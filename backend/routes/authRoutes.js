const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "luna_pharmacy_owner_jwt_secret_key_2026";

// Auto-initialize users table and default owner account if not present
async function initializeUsersTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'owner',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const defaultHash = await bcrypt.hash("eyerus1234", 10);

    // Check if any owner exists
    const res = await pool.query("SELECT * FROM users WHERE username = $1", ["admin"]);
    if (res.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)",
        ["admin", defaultHash, "owner"]
      );
      console.log("🔒 Initialized default owner account: username 'admin', password 'eyerus1234'");
    } else {
      // Ensure the admin account has password eyerus1234
      const adminUser = res.rows[0];
      const testMatch = await bcrypt.compare("eyerus1234", adminUser.password_hash);
      if (!testMatch) {
        await pool.query("UPDATE users SET password_hash = $1 WHERE username = 'admin'", [defaultHash]);
        console.log("🔒 Updated admin account password to 'eyerus1234'");
      }
    }
  } catch (err) {
    console.error("Notice during user table initialization:", err.message);
  }
}

// Run initialization
initializeUsersTable();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const trimmedUser = username.trim().toLowerCase();
    const result = await pool.query(
      "SELECT * FROM users WHERE LOWER(username) = $1",
      [trimmedUser]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Authentication server error" });
  }
});

// GET /api/auth/verify (check if current session token is valid)
router.get("/verify", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await pool.query(
      "SELECT id, username, role, created_at FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired session" });
  }
});

// POST /api/auth/change-password
router.post("/change-password", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters long."
      });
    }

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      newHash,
      user.id
    ]);

    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error("Change password error:", err.message);
    res.status(500).json({ error: "Failed to update password" });
  }
});

module.exports = router;

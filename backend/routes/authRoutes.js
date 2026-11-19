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
        pharmacy_name VARCHAR(200),
        pharmacist_name VARCHAR(200),
        role VARCHAR(50) DEFAULT 'owner',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    // Ensure column exists on older schemas
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS pharmacy_name VARCHAR(200)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS pharmacist_name VARCHAR(200)");

    const defaultHash = await bcrypt.hash("eyerus1234", 10);

    // Check if any owner exists
    const res = await pool.query("SELECT * FROM users WHERE username = $1", ["admin"]);
    if (res.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (username, password_hash, pharmacy_name, pharmacist_name, role) VALUES ($1, $2, $3, $4, $5)",
        ["admin", defaultHash, "Eyerus Pharmacy", "Eyerus Gebremariam", "owner"]
      );
      console.log("🔒 Initialized default owner account: username 'admin', password 'eyerus1234'");
    } else {
      // Ensure the admin account has password eyerus1234 and default names
      const adminUser = res.rows[0];
      const testMatch = await bcrypt.compare("eyerus1234", adminUser.password_hash);
      if (!testMatch) {
        await pool.query("UPDATE users SET password_hash = $1 WHERE username = 'admin'", [defaultHash]);
        console.log("🔒 Updated admin account password to 'eyerus1234'");
      }
      if (!adminUser.pharmacy_name) {
        await pool.query("UPDATE users SET pharmacy_name = 'Eyerus Pharmacy', pharmacist_name = 'Eyerus Gebremariam' WHERE username = 'admin'");
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
      {
        id: user.id,
        username: user.username,
        role: user.role,
        pharmacy_name: user.pharmacy_name || "Eyerus Pharmacy",
        pharmacist_name: user.pharmacist_name || "Chief Pharmacist"
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        pharmacy_name: user.pharmacy_name || "Eyerus Pharmacy",
        pharmacist_name: user.pharmacist_name || "Chief Pharmacist"
      }
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Authentication server error" });
  }
});

// POST /api/auth/register - create a new pharmacy owner account
router.post("/register", async (req, res) => {
  try {
    const { username, password, pharmacyName, pharmacistName } = req.body;
    if (!username || !password || !pharmacyName) {
      return res.status(400).json({ error: "Pharmacy name, username, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const trimmedUser = username.trim().toLowerCase();
    const existing = await pool.query("SELECT id FROM users WHERE LOWER(username) = $1", [trimmedUser]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Username already taken. Please choose another username." });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, password_hash, pharmacy_name, pharmacist_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, pharmacy_name, pharmacist_name, role",
      [trimmedUser, hash, pharmacyName.trim(), (pharmacistName || "Chief Pharmacist").trim(), "owner"]
    );
    const user = result.rows[0];
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        pharmacy_name: user.pharmacy_name,
        pharmacist_name: user.pharmacist_name
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );
    res.status(201).json({
      message: "Pharmacy account created successfully!",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        pharmacy_name: user.pharmacy_name,
        pharmacist_name: user.pharmacist_name
      }
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Failed to create pharmacy account" });
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
      "SELECT id, username, role, pharmacy_name, pharmacist_name, created_at FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    const dbUser = result.rows[0];
    res.json({
      user: {
        id: dbUser.id,
        username: dbUser.username,
        role: dbUser.role,
        pharmacy_name: dbUser.pharmacy_name || "Eyerus Pharmacy",
        pharmacist_name: dbUser.pharmacist_name || "Chief Pharmacist",
        created_at: dbUser.created_at
      }
    });
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

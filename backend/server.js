require("dotenv").config();
const express = require("express");
const cors = require("cors");
const drugRoutes = require("./routes/drugRoutes");
const saleRoutes = require("./routes/saleRoutes");
const authRoutes = require("./routes/authRoutes");
const pool = require("./db");

// Auto-migrate multi-tenant columns
(async () => {
  try {
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS pharmacy_name VARCHAR(200)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS pharmacist_name VARCHAR(200)");
    await pool.query("ALTER TABLE drugs ADD COLUMN IF NOT EXISTS owner_id INTEGER");
    await pool.query("ALTER TABLE sales ADD COLUMN IF NOT EXISTS owner_id INTEGER");

    // Assign any legacy unassigned drugs or sales to default admin account
    const adminUser = await pool.query("SELECT id FROM users WHERE username = 'admin' LIMIT 1");
    if (adminUser.rows.length > 0) {
      const adminId = adminUser.rows[0].id;
      await pool.query("UPDATE drugs SET owner_id = $1 WHERE owner_id IS NULL", [adminId]);
      await pool.query("UPDATE sales SET owner_id = $1 WHERE owner_id IS NULL", [adminId]);
      await pool.query("UPDATE users SET pharmacy_name = COALESCE(pharmacy_name, 'Eyerus Pharmacy'), pharmacist_name = COALESCE(pharmacist_name, 'Eyerus Gebremariam') WHERE username = 'admin'");
    }
    console.log("✅ Multi-tenant columns and tenant data ensured");
  } catch (e) {
    console.error("Migration notice:", e.message);
  }
})();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for local development and cloud production (Vercel)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  /\.vercel\.app$/, // Allow all Vercel deployments
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed instanceof RegExp) return allowed.test(origin);
        return allowed === origin;
      });
      if (isAllowed) return callback(null, true);
      // Fallback: allow request in production so owner can access from their domain
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json()); // Parse JSON request bodies

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/drugs", drugRoutes);
app.use("/api/sales", saleRoutes);

// Health check route for cloud hosts (Render, Railway, etc.)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Root API test route
app.get("/", (req, res) => {
  res.json({
    name: "Luna Pharmacy Management System API",
    status: "online",
    version: "1.0.0",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Luna Pharmacy API is running on port ${PORT}`);
});       



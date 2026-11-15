// Database connection setup using pg (node-postgres)
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const { Pool } = require("pg");

// Configuration: supports full DATABASE_URL (for cloud hosting like Render/Neon/Supabase) or discrete variables
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    }
  : {
      user: process.env.DB_USER || "postgres",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "pharmacy_db",
      password: String(process.env.DB_PASSWORD || ""),
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    };

const pool = new Pool(poolConfig);

// Test the connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.log("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Database connected successfully at:", res.rows[0].now);
  }
});

module.exports = pool;

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const drugRoutes = require("./routes/drugRoutes");
const saleRoutes = require("./routes/saleRoutes");
const authRoutes = require("./routes/authRoutes");

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

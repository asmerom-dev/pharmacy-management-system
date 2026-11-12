require("dotenv").config();
const express = require("express");
const cors = require("cors");
const drugRoutes = require("./routes/drugRoutes");
const saleRoutes = require("./routes/saleRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());           // Allow requests from React frontend
app.use(express.json());   // Parse JSON request bodies

// Routes
app.use("/api/drugs", drugRoutes);
app.use("/api/sales", saleRoutes);

// Basic test route
app.get("/", (req, res) => {
  res.json({ message: "Pharmacy Management System API is running!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all drugs
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM drugs ORDER BY name ASC");
    res.json(result.rows);
  } catch (error) {
    console.log("Error fetching drugs:", error.message);
    res.status(500).json({ error: "Failed to fetch drugs" });
  }
});

// POST - Add a new drug
router.post("/", async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;

    // Simple validation
    if (!name || !category || !price || stock === undefined) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await pool.query(
      "INSERT INTO drugs (name, category, price, stock) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, category, price, stock]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log("Error adding drug:", error.message);
    res.status(500).json({ error: "Failed to add drug" });
  }
});

// PUT - Update a drug
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock } = req.body;

    const result = await pool.query(
      "UPDATE drugs SET name = $1, category = $2, price = $3, stock = $4 WHERE id = $5 RETURNING *",
      [name, category, price, stock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Drug not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log("Error updating drug:", error.message);
    res.status(500).json({ error: "Failed to update drug" });
  }
});

// DELETE - Delete a drug
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM drugs WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Drug not found" });
    }

    res.json({ message: "Drug deleted successfully" });
  } catch (error) {
    console.log("Error deleting drug:", error.message);
    res.status(500).json({ error: "Failed to delete drug" });
  }
});

// GET dashboard stats
router.get("/stats/dashboard", async (req, res) => {
  try {
    // Total number of drugs
    const totalDrugs = await pool.query("SELECT COUNT(*) FROM drugs");

    // Number of out-of-stock drugs
    const outOfStock = await pool.query(
      "SELECT COUNT(*) FROM drugs WHERE stock = 0"
    );

    // Today's total sales count
    const todaySalesCount = await pool.query(
      "SELECT COUNT(*) FROM sales WHERE DATE(sale_date) = CURRENT_DATE"
    );

    // Today's total revenue
    const todayRevenue = await pool.query(
      "SELECT COALESCE(SUM(total_price), 0) as revenue FROM sales WHERE DATE(sale_date) = CURRENT_DATE"
    );

    res.json({
      totalDrugs: parseInt(totalDrugs.rows[0].count),
      outOfStock: parseInt(outOfStock.rows[0].count),
      todaySales: parseInt(todaySalesCount.rows[0].count),
      todayRevenue: parseFloat(todayRevenue.rows[0].revenue),
    });
  } catch (error) {
    console.log("Error fetching dashboard stats:", error.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;

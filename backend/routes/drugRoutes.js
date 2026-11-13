const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all drugs
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, category, price, stock, TO_CHAR(expiry_date, 'YYYY-MM-DD') as expiry_date, created_at FROM drugs ORDER BY name ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.log("Error fetching drugs:", error.message);
    res.status(500).json({ error: "Failed to fetch drugs" });
  }
});

// POST - Add a new drug
router.post("/", async (req, res) => {
  try {
    const { name, category, price, stock, expiry_date } = req.body;

    // Simple validation
    if (!name || !category || !price || stock === undefined) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const expDate = expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const result = await pool.query(
      "INSERT INTO drugs (name, category, price, stock, expiry_date) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, category, price, stock, TO_CHAR(expiry_date, 'YYYY-MM-DD') as expiry_date, created_at",
      [name, category, price, stock, expDate]
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
    const { name, category, price, stock, expiry_date } = req.body;

    const result = await pool.query(
      "UPDATE drugs SET name = $1, category = $2, price = $3, stock = $4, expiry_date = COALESCE($5, expiry_date) WHERE id = $6 RETURNING id, name, category, price, stock, TO_CHAR(expiry_date, 'YYYY-MM-DD') as expiry_date, created_at",
      [name, category, price, stock, expiry_date, id]
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

// GET dashboard stats & trends
router.get("/stats/dashboard", async (req, res) => {
  try {
    // Total number of drugs and total stock units
    const totalDrugs = await pool.query("SELECT COUNT(*) as count, COALESCE(SUM(stock), 0) as total_units FROM drugs");

    // Low stock alerts (stock > 0 and stock <= 20)
    const lowStock = await pool.query(
      "SELECT COUNT(*) FROM drugs WHERE stock > 0 AND stock <= 20"
    );

    // Number of out-of-stock drugs
    const outOfStock = await pool.query(
      "SELECT COUNT(*) FROM drugs WHERE stock = 0"
    );

    // Today's total sales count (transactions)
    const todaySalesCount = await pool.query(
      "SELECT COUNT(*) FROM sales WHERE DATE(sale_date) = CURRENT_DATE"
    );

    // Today's total revenue
    const todayRevenue = await pool.query(
      "SELECT COALESCE(SUM(total_price), 0) as revenue FROM sales WHERE DATE(sale_date) = CURRENT_DATE"
    );

    // 7-day sales trend (by day)
    const trendResult = await pool.query(`
      WITH days AS (
        SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval)::date AS day
      )
      SELECT 
        TO_CHAR(days.day, 'Dy') as day_name,
        TO_CHAR(days.day, 'Mon DD') as formatted_date,
        COALESCE(SUM(s.total_price), 0)::numeric as revenue,
        COALESCE(COUNT(s.id), 0)::integer as transactions
      FROM days
      LEFT JOIN sales s ON DATE(s.sale_date) = days.day
      GROUP BY days.day
      ORDER BY days.day ASC
    `);

    // Top selling drugs
    const topResult = await pool.query(`
      SELECT d.name, COALESCE(SUM(s.quantity), 0)::integer as total_sold
      FROM drugs d
      LEFT JOIN sales s ON d.id = s.drug_id
      GROUP BY d.name
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    res.json({
      totalDrugs: parseInt(totalDrugs.rows[0].count),
      totalUnits: parseInt(totalDrugs.rows[0].total_units),
      lowStock: parseInt(lowStock.rows[0].count),
      outOfStock: parseInt(outOfStock.rows[0].count),
      todaySales: parseInt(todaySalesCount.rows[0].count),
      todayRevenue: parseFloat(todayRevenue.rows[0].revenue),
      salesTrend: trendResult.rows,
      topSelling: topResult.rows
    });
  } catch (error) {
    console.log("Error fetching dashboard stats:", error.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const pool = require("../db");

// POST - Record a new sale (this also decreases the stock!)
router.post("/", async (req, res) => {
  try {
    const { drug_id, quantity } = req.body;

    // Validation
    if (!drug_id || !quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ error: "Drug ID and valid quantity are required" });
    }

    // First, check if drug exists and has enough stock
    const drugResult = await pool.query("SELECT * FROM drugs WHERE id = $1", [
      drug_id,
    ]);

    if (drugResult.rows.length === 0) {
      return res.status(404).json({ error: "Drug not found" });
    }

    const drug = drugResult.rows[0];

    if (drug.stock < quantity) {
      return res.status(400).json({
        error: `Not enough stock! Only ${drug.stock} left for ${drug.name}`,
      });
    }

    // Calculate total price
    const unit_price = parseFloat(drug.price);
    const total_price = unit_price * quantity;

    // Insert the sale record
    const saleResult = await pool.query(
      "INSERT INTO sales (drug_id, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4) RETURNING *",
      [drug_id, quantity, unit_price, total_price]
    );

    // Decrease the stock
    await pool.query("UPDATE drugs SET stock = stock - $1 WHERE id = $2", [
      quantity,
      drug_id,
    ]);

    res.status(201).json({
      message: `Sale recorded! Sold ${quantity}x ${drug.name}`,
      sale: saleResult.rows[0],
      remainingStock: drug.stock - quantity,
    });
  } catch (error) {
    console.log("Error recording sale:", error.message);
    res.status(500).json({ error: "Failed to record sale" });
  }
});

// GET - Get today's daily sales
router.get("/daily", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, d.name as drug_name, s.quantity, s.unit_price, 
              s.total_price, s.sale_date
       FROM sales s 
       JOIN drugs d ON s.drug_id = d.id 
       WHERE DATE(s.sale_date) = CURRENT_DATE
       ORDER BY s.sale_date DESC`
    );

    // Also get the total for today
    const totalResult = await pool.query(
      `SELECT COALESCE(SUM(total_price), 0) as total_revenue,
              COALESCE(SUM(quantity), 0) as total_items
       FROM sales 
       WHERE DATE(sale_date) = CURRENT_DATE`
    );

    res.json({
      sales: result.rows,
      summary: {
        totalRevenue: parseFloat(totalResult.rows[0].total_revenue),
        totalItems: parseInt(totalResult.rows[0].total_items),
      },
    });
  } catch (error) {
    console.log("Error fetching daily sales:", error.message);
    res.status(500).json({ error: "Failed to fetch daily sales" });
  }
});

// GET - Get top selling drugs (for the chart)
router.get("/top", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.name, SUM(s.quantity) as total_sold
       FROM sales s
       JOIN drugs d ON s.drug_id = d.id
       GROUP BY d.name
       ORDER BY total_sold DESC
       LIMIT 10`
    );

    res.json(result.rows);
  } catch (error) {
    console.log("Error fetching top drugs:", error.message);
    res.status(500).json({ error: "Failed to fetch top drugs" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const pool = require("../db");

// POST - Record a new sale (supports both single drug sale and batch checkout from POS)
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const { drug_id, quantity, items, customer_name } = req.body;

    // Handle batch checkout (from POS Cart)
    if (items && Array.isArray(items) && items.length > 0) {
      await client.query("BEGIN");
      const salesRecorded = [];

      for (const item of items) {
        const { drug_id: id, quantity: qty } = item;
        if (!id || !qty || qty <= 0) continue;

        const drugRes = await client.query("SELECT * FROM drugs WHERE id = $1 FOR UPDATE", [id]);
        if (drugRes.rows.length === 0) {
          throw new Error(`Drug with ID ${id} not found`);
        }

        const drug = drugRes.rows[0];
        if (drug.stock < qty) {
          throw new Error(`Insufficient stock for ${drug.name}. Available: ${drug.stock}, Requested: ${qty}`);
        }

        const unit_price = parseFloat(drug.price);
        const total_price = unit_price * qty;

        const saleRes = await client.query(
          "INSERT INTO sales (drug_id, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4) RETURNING *",
          [id, qty, unit_price, total_price]
        );

        await client.query("UPDATE drugs SET stock = stock - $1 WHERE id = $2", [qty, id]);
        salesRecorded.push({
          ...saleRes.rows[0],
          drug_name: drug.name
        });
      }

      await client.query("COMMIT");
      return res.status(201).json({
        message: "Checkout successful!",
        sales: salesRecorded
      });
    }

    // Handle single item sale
    if (!drug_id || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Drug ID and valid quantity are required" });
    }

    await client.query("BEGIN");
    const drugResult = await client.query("SELECT * FROM drugs WHERE id = $1 FOR UPDATE", [drug_id]);

    if (drugResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Drug not found" });
    }

    const drug = drugResult.rows[0];

    if (drug.stock < quantity) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: `Not enough stock! Only ${drug.stock} left for ${drug.name}`,
      });
    }

    const unit_price = parseFloat(drug.price);
    const total_price = unit_price * quantity;

    const saleResult = await client.query(
      "INSERT INTO sales (drug_id, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4) RETURNING *",
      [drug_id, quantity, unit_price, total_price]
    );

    await client.query("UPDATE drugs SET stock = stock - $1 WHERE id = $2", [quantity, drug_id]);
    await client.query("COMMIT");

    res.status(201).json({
      message: `Sale recorded! Sold ${quantity}x ${drug.name}`,
      sale: saleResult.rows[0],
      remainingStock: drug.stock - quantity,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("Error recording sale:", error.message);
    res.status(500).json({ error: error.message || "Failed to record sale" });
  } finally {
    client.release();
  }
});

// GET - Get daily sales & reports
router.get("/daily", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, d.name as drug_name, s.quantity, s.unit_price, 
              s.total_price, TO_CHAR(s.sale_date, 'HH12:MI AM') as formatted_time,
              s.sale_date
       FROM sales s 
       JOIN drugs d ON s.drug_id = d.id 
       WHERE DATE(s.sale_date) = CURRENT_DATE
       ORDER BY s.sale_date DESC`
    );

    // Get today summary
    const todayTotal = await pool.query(
      `SELECT COALESCE(SUM(total_price), 0) as total_revenue,
              COALESCE(SUM(quantity), 0) as total_items,
              COALESCE(COUNT(id), 0) as total_transactions
       FROM sales 
       WHERE DATE(sale_date) = CURRENT_DATE`
    );

    // Overall / 7-day stats for reports page
    const weekStats = await pool.query(
      `SELECT COALESCE(SUM(total_price), 0) as week_revenue,
              COALESCE(COUNT(id), 0) as week_transactions,
              COALESCE(AVG(total_price), 0) as avg_sale
       FROM sales 
       WHERE sale_date >= CURRENT_DATE - INTERVAL '7 days'`
    );

    // Top selling drug overall
    const topDrug = await pool.query(
      `SELECT d.name, SUM(s.quantity) as total_sold
       FROM sales s
       JOIN drugs d ON s.drug_id = d.id
       GROUP BY d.name
       ORDER BY total_sold DESC
       LIMIT 1`
    );

    // 7-day trend
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

    // Recent 10 transactions
    const recentResult = await pool.query(`
      SELECT s.id, d.name as drug_name, s.quantity, s.unit_price, 
             s.total_price, TO_CHAR(s.sale_date, 'HH12:MI AM') as formatted_time,
             TO_CHAR(s.sale_date, 'YYYY-MM-DD') as sale_day
      FROM sales s 
      JOIN drugs d ON s.drug_id = d.id 
      ORDER BY s.sale_date DESC
      LIMIT 10
    `);

    res.json({
      sales: result.rows,
      recentSales: recentResult.rows,
      trend: trendResult.rows,
      summary: {
        totalRevenue: parseFloat(todayTotal.rows[0].total_revenue),
        totalItems: parseInt(todayTotal.rows[0].total_items),
        totalTransactions: parseInt(todayTotal.rows[0].total_transactions),
        weekRevenue: parseFloat(weekStats.rows[0].week_revenue),
        weekTransactions: parseInt(weekStats.rows[0].week_transactions),
        avgSale: parseFloat(weekStats.rows[0].avg_sale),
        topDrug: topDrug.rows[0] ? topDrug.rows[0].name : "N/A"
      },
    });
  } catch (error) {
    console.log("Error fetching daily sales:", error.message);
    res.status(500).json({ error: "Failed to fetch daily sales" });
  }
});

// GET - Top selling drugs
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

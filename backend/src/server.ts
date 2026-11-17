import express from "express";
import { pool } from "./db.js";

const app = express();
app.use(express.json());

// Check database connection
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "success",
      message: "PantryPal Backend connected to PostgreSQL"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Database connection failed"
    });
  }
});

// Find a product by barcode
app.get("/api/products/:barcode", async (req, res) => {
  try {
    const barcode = String(req.params.barcode);

    const result = await pool.query(
      "SELECT * FROM products WHERE barcode = $1",
      [barcode]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Save a product in the product catalog
app.post("/api/products", async (req, res) => {
  try {
    const { barcode, name } = req.body;

    if (
      typeof barcode !== "string" ||
      !/^[0-9]{8,14}$/.test(barcode) ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      res.status(400).json({ error: "Invalid product data" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO products (barcode, name)
       VALUES ($1, $2)
       ON CONFLICT (barcode) DO NOTHING
       RETURNING *`,
      [barcode, name.trim()]
    );

    if (result.rows.length === 0) {
      res.status(409).json({ error: "Barcode already exists" });
      return;
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = Number(process.env.PORT || 3000);


const DEMO_USER_ID = 1;

// Add a product to the user's inventory
app.post("/api/inventory", async (req, res) => {
  try {
    const { productId, quantity, expiryDate } = req.body;

    if (
      !Number.isInteger(productId) ||
      productId <= 0 ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      res.status(400).json({ error: "Invalid product or quantity" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO inventory_items
       (user_id, product_id, quantity, expiry_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [DEMO_USER_ID, productId, quantity, expiryDate ?? null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add item" });
  }
});

// Get user's inventory
app.get("/api/inventory", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.id, p.name, p.barcode,
              i.quantity, i.expiry_date
       FROM inventory_items i
       JOIN products p ON p.id = i.product_id
       WHERE i.user_id = $1`,
      [DEMO_USER_ID]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load inventory" });
  }
});

app.listen(PORT, () => {
  console.log(`PantryPal Backend running on http://localhost:${PORT}`);
});

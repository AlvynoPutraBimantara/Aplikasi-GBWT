const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const pool = require("./db"); // Assumes db.js provides the database pool connection

const app = express();
const port = 3004;

app.use(cors());
app.use(bodyParser.json());

// Generate an 8-character random string for ID
function generateRandomId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

// Get all cart items
app.get("/cart", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cart");
    res.status(200).json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cart items." });
  }
});

// Get a cart item by ID
app.get("/cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM cart WHERE id = ?", [id]);
    if (result[0].length === 0) {
      return res.status(404).json({ error: "Cart item not found." });
    }
    res.status(200).json(result[0][0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch the cart item." });
  }
});

app.post("/cart", async (req, res) => {
  try {
    const { id, itemid, name, price, quantity, pedagang, user } = req.body;

    // Check if the product already exists in the cart for the same user
    const [existingCartItems] = await pool.query(
      "SELECT * FROM cart WHERE name = ? AND user = ?",
      [name, user]
    );

    if (existingCartItems.length > 0) {
      // Update the quantity of the existing item
      const updatedQuantity = existingCartItems[0].quantity + quantity;
      await pool.query(
        "UPDATE cart SET quantity = ? WHERE id = ?",
        [updatedQuantity, existingCartItems[0].id]
      );
      return res.status(200).json({ message: "Quantity updated successfully." });
    }

    // Use provided id and itemid or generate new IDs if not provided
    const newId = id || generateRandomId();
    const newItemId = itemid || generateRandomId();

    // Add the item as a new entry
    await pool.query(
      "INSERT INTO cart (id, name, price, quantity, pedagang, user, itemid) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [newItemId, name, price, quantity, pedagang, user, newId]
    );

    res.status(201).json({ message: "Item added to cart.", id: newId, itemid: newItemId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add/update the cart item." });
  }
});


// Update a cart item's quantity
app.put("/cart/:id", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    // Fetch the itemid from the cart using the cart id
    const [cartResult] = await pool.query(
      "SELECT itemid FROM cart WHERE id = ?",
      [id]
    );

    if (cartResult.length === 0) {
      return res.status(404).json({ error: "Cart item not found." });
    }

    const itemid = cartResult[0].itemid;

    // Get the stock for the product from the dataproduk table
    const [productResult] = await pool.query(
      "SELECT Stok FROM dataproduk WHERE id = ?",
      [itemid] // Now correctly using itemid to fetch stock
    );

    if (productResult.length === 0) {
      return res.status(404).json({ error: "Product not found." });
    }

    const maxStock = productResult[0].Stok;

    // Clamp the quantity to the available stock
    const clampedQuantity = Math.min(quantity, maxStock);

    // Update the cart item
    await pool.query("UPDATE cart SET quantity = ? WHERE id = ?", [
      clampedQuantity,
      id,
    ]);

    res.status(200).json({ message: "Quantity updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update the cart item quantity." });
  }
});


// Delete a cart item by ID
app.delete("/cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM cart WHERE id = ?", [id]);
    if (result[0].affectedRows === 0) {
      return res.status(404).json({ error: "Cart item not found." });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete cart item." });
  }
});

// Clear all cart items
app.delete("/cart", async (req, res) => {
  try {
    await pool.query("DELETE FROM cart");
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to clear cart." });
  }
});

app.listen(port, () => {
  console.log(`Cart service is running on http://localhost:${port}`);
});

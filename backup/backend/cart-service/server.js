const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Cart, CartItems } = require("./cart.model");
const { Produk } = require("./produk.model"); // Import Produk model



const app = express();
const port = 3004;

app.use(cors());
app.use(bodyParser.json());

// Generate an 8-character random string for ID
function generateRandomId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// Get all cart items for a specific user
app.get("/cart", async (req, res) => {
  const { user } = req.query;
  try {
    const cart = await Cart.findOne({
      where: { user },
      include: [{ model: CartItems, as: "cart_items" }],
    });
    res.status(200).json(cart ? cart.cart_items : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cart items." });
  }
});


// Add item to cart
app.post("/cart", async (req, res) => {
  try {
    const { user, itemid, name, price, quantity, pedagang } = req.body;

    // Verify the product exists and check for discount price
    const product = await Produk.findOne({ where: { id: itemid } });
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Use discount price if available
    const finalPrice = product.Harga_diskon || price;

    // Find or create a cart for the user
    let cart = await Cart.findOne({ where: { user } });
    if (!cart) {
      cart = await Cart.create({ id: generateRandomId(), user });
    }

    // Check if the item already exists in the cart
    const existingCartItem = await CartItems.findOne({
      where: { cart_id: cart.id, itemid },
    });

    if (existingCartItem) {
      // Update the quantity of the existing item
      const updatedQuantity = existingCartItem.quantity + quantity;
      await CartItems.update(
        { quantity: updatedQuantity },
        { where: { id: existingCartItem.id } }
      );
      return res.status(200).json({ message: "Quantity updated successfully." });
    }

    // Add the item to cart_items with the correct price
    await CartItems.create({
      id: generateRandomId(),
      cart_id: cart.id,
      itemid,
      name,
      price: finalPrice,
      quantity,
      pedagang,
    });

    res.status(201).json({ message: "Item added to cart." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add item to cart." });
  }
});

// Update a cart item's quantity
app.put("/cart/:id", async (req, res) => {
  const { id } = req.params; // This is the cart_item id
  const { quantity } = req.body;

  try {
    // Fetch the cart item from the cart_items table
    const cartItem = await CartItems.findOne({ where: { id } });
    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found." });
    }

    // Ensure itemid is valid
    if (!cartItem.itemid) {
      return res.status(400).json({ error: "Invalid item ID." });
    }

    // Fetch the product's stock using Sequelize
    const productResult = await Produk.findOne({
      where: { id: cartItem.itemid },
      attributes: ["Stok"], // Only fetch the Stok column
    });

    if (!productResult) {
      return res.status(404).json({ error: "Product not found." });
    }

    const maxStock = productResult.Stok;

    // Clamp the quantity to the available stock
    const clampedQuantity = Math.min(quantity, maxStock);

    // Update the cart item's quantity in the cart_items table
    await CartItems.update(
      { quantity: clampedQuantity },
      { where: { id } } // Update the cart_item with the given id
    );

    res.status(200).json({ message: "Quantity updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update the cart item quantity." });
  }
});


// Delete a cart item by ID
app.delete("/cart/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // First get the cart item to find its cart_id
    const cartItem = await CartItems.findOne({ where: { id } });
    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found." });
    }

    const cartId = cartItem.cart_id;
    
    // Delete the cart item
    await CartItems.destroy({ where: { id } });
    
    // Check if this was the last item in the cart
    const remainingItems = await CartItems.count({ where: { cart_id: cartId } });
    
    if (remainingItems === 0) {
      // If no items left, delete the cart too
      await Cart.destroy({ where: { id: cartId } });
    }
    
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete cart item." });
  }
});
// Clear all cart items for a specific user
app.delete("/cart", async (req, res) => {
  const { user } = req.query;
  try {
    const cart = await Cart.findOne({ where: { user } });
    if (cart) {
      await CartItems.destroy({ where: { cart_id: cart.id } });
      await Cart.destroy({ where: { id: cart.id } });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to clear cart." });
  }
});

app.listen(port, () => {
  console.log(`Cart service is running on http://localhost:${port}`);
});
/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
const { DataTypes } = require("sequelize");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Cart, CartItems } = require('./cart.model');
const Produk = require('./produk.model');
const User = require('./user.model');
const sequelize = require("./db");
require('dotenv').config();

const app = express();

// Determine port from environment or default
const port = process.env.PORT || 3004;

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all local network requests
    if (/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin) ||
        /^http:\/\/localhost(:\d+)?$/.test(origin) ||
        /^http:\/\/192\.168\.100\.8(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Update the generateRandomId function to handle both guest and regular users
function generateRandomId(isGuest = false) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomString = Array.from({ length: 8 }, () => 
    chars[Math.floor(Math.random() * chars.length)]).join("");
  return isGuest ? `Guest_${randomString}` : randomString;
}

// Update the GET /cart endpoint to handle guest users properly
app.get("/cart", async (req, res) => {
  const { user } = req.query;

  if (!user || typeof user !== 'string') {
    return res.status(400).json({ 
      error: "Valid user ID is required",
      details: {
        received: user,
        type: typeof user
      }
    });
  }

  try {
    // Normalize user ID (handle both Guest_ and guest_ formats)
    const normalizedUser = user.startsWith('guest_') 
      ? `Guest_${user.substring(6)}` 
      : user;

    const cart = await Cart.findOne({
      where: { user: normalizedUser },
      include: [{
        model: CartItems,
        as: "cart_items",
        include: [{
          model: Produk,
          as: "produk",
          attributes: ["Stok", "imageUrl"]
        }]
      }]
    });

    if (!cart) {
      return res.status(200).json([]);
    }

    const processedItems = cart.cart_items.map(item => ({
      id: item.id,
      cart_id: item.cart_id,
      itemid: item.itemid,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      pedagang: item.pedagang,
      stock: item.produk?.Stok || 0,
      imageUrl: item.produk?.imageUrl || ''
    }));

    res.status(200).json(processedItems);
  } catch (err) {
    console.error("Error fetching cart items:", err);
    res.status(500).json({ 
      error: "Failed to fetch cart items",
      details: err.message
    });
  }
});

// Update the POST /cart endpoint to use the new ID generation
app.post("/cart", async (req, res) => {
  let transaction;
  try {
    const { user, itemid, name, price, quantity, pedagang } = req.body;

    // Validate input
    if (!user || !itemid || !name || !price || !quantity || !pedagang) {
      return res.status(400).json({ 
        error: "All fields are required",
        details: {
          received: {
            user: !!user,
            itemid: !!itemid,
            name: !!name,
            price: !!price,
            quantity: !!quantity,
            pedagang: !!pedagang
          }
        }
      });
    }

    // Validate quantity
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be a positive number" });
    }

    transaction = await sequelize.transaction();

    // Normalize user ID and determine if guest
    const isGuest = user.startsWith('guest_');
    const cartUser = isGuest ? `Guest_${user.substring(6)}` : user;

    // Handle guest or regular users
    if (isGuest) {
      await User.findOrCreate({
        where: { id: cartUser },
        defaults: {
          id: cartUser,
          Nama: 'Guest User',
          Password: 'guest_password',
          role: 'guest',
          is_guest: true
        },
        transaction
      });
    } else {
      const userExists = await User.findOne({
        where: { id: cartUser },
        transaction
      });
      
      if (!userExists) {
        await transaction.rollback();
        return res.status(404).json({ 
          error: "User not found.",
          details: { searchedUserId: cartUser }
        });
      }
    }

    // Verify product exists
    const product = await Produk.findOne({ 
      where: { id: itemid },
      transaction
    });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ 
        error: "Product not found.",
        details: { searchedItemId: itemid }
      });
    }

    // Stock check
    const productStock = Number(product.Stok);
    if (isNaN(productStock)) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: "Invalid product stock information",
        details: { productStock: product.Stok }
      });
    }

    if (quantity > productStock) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: `Only ${productStock} items available in stock`,
        availableStock: productStock,
        requestedQuantity: quantity
      });
    }

    // Find or create cart for the user
    let cart = await Cart.findOne({ 
      where: { user: cartUser },
      transaction
    });

    if (!cart) {
      cart = await Cart.create({ 
        id: generateRandomId(isGuest), // Use proper ID generation
        user: cartUser
      }, { transaction });
    }

    // Check for existing item in cart
    const existingItem = await CartItems.findOne({
      where: { 
        cart_id: cart.id, 
        itemid 
      },
      transaction
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > productStock) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: `Cannot add more than ${productStock} items`,
          maxAllowed: productStock - existingItem.quantity
        });
      }

      await CartItems.update(
        { quantity: newQuantity },
        { 
          where: { id: existingItem.id },
          transaction 
        }
      );
    } else {
      // Add new item to cart with proper ID
      await CartItems.create({
        id: generateRandomId(isGuest), // Use proper ID generation
        cart_id: cart.id,
        itemid,
        name,
        price: product.Harga_diskon || price,
        quantity,
        pedagang
      }, { transaction });
    }

    await transaction.commit();
    res.status(201).json({ 
      message: "Item added to cart.",
      cartId: cart.id,
      productId: itemid,
      quantity: quantity
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error("Error adding to cart:", err);
    res.status(500).json({ 
      error: "Failed to add item to cart.",
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Get cart count for a user
app.get("/cart/count", async (req, res) => {
  const { user } = req.query;

  if (!user) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const cartUser = user.startsWith('guest_') ? `Guest_${user.substring(6)}` : user;
    
    const [result] = await sequelize.query(
      `SELECT COUNT(*) as count FROM cart_items ci
       JOIN cart c ON ci.cart_id = c.id
       WHERE c.user = ?`,
      {
        replacements: [cartUser],
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).json({ count: result.count || 0 });
  } catch (err) {
    console.error("Error getting cart count:", err);
    res.status(500).json({ error: "Failed to get cart count" });
  }
});

// Sync cart between devices
app.post("/cart/sync", async (req, res) => {
  const { user, items } = req.body;

  if (!user || !Array.isArray(items)) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  let transaction;
  try {
    transaction = await sequelize.transaction();
    const cartUser = user.startsWith('guest_') ? `Guest_${user.substring(6)}` : user;

    // Find or create cart
    let cart = await Cart.findOne({ where: { user: cartUser }, transaction });
    if (!cart) {
      cart = await Cart.create({
        id: generateRandomId(user.startsWith('guest_')),
        user: cartUser
      }, { transaction });
    }

    // Clear existing items
    await CartItems.destroy({ where: { cart_id: cart.id }, transaction });

    // Add new items
    await Promise.all(items.map(item => 
      CartItems.create({
        id: generateRandomId(user.startsWith('guest_')),
        cart_id: cart.id,
        itemid: item.itemid,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        pedagang: item.pedagang
      }, { transaction })
    ));

    await transaction.commit();
    res.status(200).json({ message: "Cart synced successfully" });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error("Error syncing cart:", err);
    res.status(500).json({ error: "Failed to sync cart" });
  }
});

// Update a cart item's quantity
app.put("/cart/:id", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || isNaN(quantity) || quantity < 1) {
    return res.status(400).json({ error: "Valid quantity is required" });
  }

  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Get the cart item with product info
    const cartItem = await CartItems.findOne({
      where: { id },
      include: [{
        model: Produk,
        as: "product",
        attributes: ["Stok"]
      }],
      transaction
    });

    if (!cartItem) {
      await transaction.rollback();
      return res.status(404).json({ error: "Cart item not found." });
    }

    const maxStock = cartItem.product.Stok;
    const clampedQuantity = Math.min(quantity, maxStock);

    if (clampedQuantity < 1) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: `Minimum quantity is 1, only ${maxStock} available` 
      });
    }

    // Update the quantity
    await CartItems.update(
      { quantity: clampedQuantity },
      { 
        where: { id },
        transaction
      }
    );

    await transaction.commit();
    res.status(200).json({ 
      message: "Quantity updated successfully.",
      updatedQuantity: clampedQuantity
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error("Error updating cart item:", err);
    res.status(500).json({ error: "Failed to update cart item." });
  }
});

// Delete a cart item by ID
app.delete("/cart/:id", async (req, res) => {
  const { id } = req.params;
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // First get the cart item to find its cart_id
    const cartItem = await CartItems.findOne({
      where: { id },
      transaction
    });

    if (!cartItem) {
      await transaction.rollback();
      return res.status(404).json({ error: "Cart item not found." });
    }

    const cartId = cartItem.cart_id;
    
    // Delete the cart item
    await CartItems.destroy({
      where: { id },
      transaction
    });
    
    // Check if this was the last item in the cart
    const remainingItems = await CartItems.count({ 
      where: { cart_id: cartId },
      transaction
    });
    
    if (remainingItems === 0) {
      // If no items left, delete the cart too
      const { Cart } = require('./cart.model');
      await Cart.destroy({
        where: { id: cartId },
        transaction
      });
    }
    
    await transaction.commit();
    res.status(204).end();
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error("Error deleting cart item:", err);
    res.status(500).json({ error: "Failed to delete cart item." });
  }
});

// Clear all cart items for a specific user
app.delete("/cart", async (req, res) => {
  const { user } = req.query;

  if (!user) {
    return res.status(400).json({ error: "User ID is required" });
  }

  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Models required within function scope
    const { Cart } = require('./cart.model');

    // Find the user's cart
    const cart = await Cart.findOne({ 
      where: { user },
      transaction
    });
    
    if (cart) {
      const cartId = cart.id;
      
      // Delete all cart items
      await CartItems.destroy({
        where: { cart_id: cartId },
        transaction
      });
      
      // Delete the cart
      await Cart.destroy({
        where: { id: cartId },
        transaction
      });
    }

    await transaction.commit();
    res.status(204).end();
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error("Error clearing cart:", err);
    res.status(500).json({ error: "Failed to clear cart." });
  }
});

// Get cart total for a user
app.get("/cart/total", async (req, res) => {
  const { user } = req.query;

  if (!user) {
    return res.status(400).json({ error: "User ID is required" });
  }

  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Find the user's cart
    const [cart] = await sequelize.query(
      "SELECT id FROM cart WHERE user = ?",
      {
        replacements: [user],
        transaction,
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (!cart || cart.length === 0) {
      await transaction.commit();
      return res.status(200).json({ total: 0, itemCount: 0 });
    }

    const cartId = cart[0].id;

    // Calculate total and item count
    const [result] = await sequelize.query(
      `SELECT 
        SUM(ci.price * ci.quantity) as total,
        SUM(ci.quantity) as itemCount
       FROM cart_items ci
       WHERE ci.cart_id = ?`,
      {
        replacements: [cartId],
        transaction,
        type: sequelize.QueryTypes.SELECT
      }
    );

    const total = result[0].total || 0;
    const itemCount = result[0].itemCount || 0;

    await transaction.commit();
    res.status(200).json({ total, itemCount });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error("Error calculating cart total:", err);
    res.status(500).json({ error: "Failed to calculate cart total." });
  }
});

// After importing models but before starting the server
async function initializeDatabase() {
  try {
    // Load models in correct order
    const User = require('./user.model');
    const Produk = require('./produk.model');
    const { Cart, CartItems } = require('./cart.model');

    // Setup associations
    CartItems.belongsTo(Produk, {
      foreignKey: "itemid",
      as: "product",
      onDelete: 'CASCADE'
    });

    // Try verifying if tables exist
    await sequelize.query("SELECT 1 FROM `user` LIMIT 1");
    await sequelize.query("SELECT 1 FROM `cart` LIMIT 1");
    await sequelize.query("SELECT 1 FROM `cart_items` LIMIT 1");

    console.log('Database tables verified');
  } catch (error) {
    console.error('Database verification failed:', error);

    // Re-sync models if verification fails
    try {
      await sequelize.sync({ alter: true });
      console.log('Database re-synchronized');
    } catch (syncError) {
      console.error('Failed to re-synchronize database:', syncError);
      process.exit(1); // Exit if re-sync also fails
    }
  }
}

initializeDatabase().then(() => {
  const HOST = '0.0.0.0'; // Listen on all network interfaces
  app.listen(port, HOST, () => {
    console.log("Cart service is running on:");
    console.log(`- Local: http://localhost:${port}`);
    console.log(`- Network: http://192.168.100.8:${port}`);
    console.log(`- Accessible from any device in your local network`);
  });
});
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sequelize = require("./db");
const { Op } = require('sequelize');
const pool = require("./db");
const app = express();
const port = process.env.PORT || 3003;
const baseUrl = process.env.BASE_URL || 'http://localhost:3003';

// Enhanced CORS configuration similar to produk-service
const allowedOrigins = [
  'http://192.168.100.8:8080',
  'http://192.168.100.8:3000',
  'http://192.168.100.8:3003',
  baseUrl,
  // Allow all devices in local network
  /^http:\/\/192\.168\.100\.\d{1,3}(:\d+)?$/,
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(allowedOrigin => 
      typeof allowedOrigin === 'string' 
        ? origin === allowedOrigin
        : allowedOrigin.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length']
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Generate an 8-character random string for ID
function generateRandomId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function initializeModels() {
  try {
    // eslint-disable-next-line no-unused-vars
    const sequelizeInstance = require('./db');
    
    // Load models FIRST
    const User = require('./user.model');
    const { Produk } = require('./produk.model');
    const { Cart, CartItems } = require('./cart.model');
    const { Orders, OrderItems, Invoice } = require('./orders.model');

    // THEN setup associations
    const setupAssociations = require('./associations');
    setupAssociations({ 
      User, 
      Produk, 
      Cart, 
      CartItems, 
      Orders, 
      OrderItems, 
      Invoice 
    });

    // Sync only necessary models
    await Promise.all([
      User.sync(),
      Produk.sync(),
      Cart.sync(),
      Orders.sync(),
      Invoice.sync()
    ]);
    
    console.log('Models synchronized successfully');
  } catch (error) {
    console.error('Model initialization failed:', error);
    process.exit(1);
  }
}


// Get all orders for a specific user
app.get("/orders", async (req, res) => {
  try {
    const { Orders, OrderItems } = require('./orders.model');
    const user = req.query.user; // Get user ID from query params
    
    if (!user) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const orders = await Orders.findAll({
      where: { user },
      include: [{
        model: OrderItems,
        as: "order_items"
      }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ 
      error: "Failed to fetch orders",
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// Get all cart items for a specific user
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
    const { Cart, CartItems } = require('./cart.model');
    
    // Find cart for user with associated items
    const cart = await Cart.findOne({
      where: { user },
      include: [{
        model: CartItems,
        as: "items"
      }]
    });

    if (!cart) {
      return res.status(200).json([]);
    }

    // Process cart items
    const processedItems = cart.cart_items.map(item => ({
      id: item.id,
      cart_id: item.cart_id,
      itemid: item.itemid,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      pedagang: item.pedagang
    }));

    res.status(200).json(processedItems);
  } catch (err) {
    console.error("Error fetching cart items:", err);
    res.status(500).json({ 
      error: "Failed to fetch cart items.",
      details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Add item to cart - Fixed version
app.post("/cart", async (req, res) => {
  let transaction;
  try {
    const { Cart, CartItems } = require('./cart.model');
    const { Produk } = require('./produk.model');
    
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
      where: { user },
      transaction
    });

    if (!cart) {
      cart = await Cart.create({ 
        id: generateRandomId(), 
        user 
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
      // Update quantity if item exists
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
      // Add new item to cart
      await CartItems.create({
        id: generateRandomId(),
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

// Update a cart item's quantity
app.put("/cart/:id", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || isNaN(quantity) || quantity < 1) {
    return res.status(400).json({ error: "Valid quantity is required" });
  }

  let transaction;
  try {
    const { CartItems } = require('./cart.model');
    const { Produk } = require('./produk.model');
    
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

// Add to order-service server.js
app.delete('/orders/user/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    await pool.query('START TRANSACTION');
    
    // Get all orders for this user
    const [orders] = await pool.query("SELECT id FROM orders WHERE user = ?", [userId]);
    
    if (orders.length > 0) {
      // Delete all order items
      await pool.query("DELETE FROM order_items WHERE order_id IN (?)", [orders.map(o => o.id)]);
      
      // Delete all orders
      await pool.query("DELETE FROM orders WHERE user = ?", [userId]);
    }
    
    await pool.query('COMMIT');
    res.status(200).json({ success: true, message: `Deleted ${orders.length} orders and their items` });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error("Error deleting user orders:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Delete a cart item by ID
app.delete("/cart/:id", async (req, res) => {
  const { id } = req.params;
  let transaction;

  try {
    const { Cart, CartItems } = require('./cart.model');
    
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
    const { Cart, CartItems } = require('./cart.model');
    
    transaction = await sequelize.transaction();

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

// Update the POST /orders endpoint to handle stock validation
app.post("/orders", async (req, res) => {
  const { orders, clearCart } = req.body;

  if (!Array.isArray(orders)) {
    return res.status(400).json({ error: "Orders must be an array" });
  }

  for (const order of orders) {
    if (!order.itemid || !order.pedagang || !order.price || !order.quantity) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: {
          required: ['itemid', 'pedagang', 'price', 'quantity'],
          received: order
        }
      });
    }
  }

  let transaction;
  try {
    const { Orders, OrderItems } = require('./orders.model');
    const { Produk } = require('./produk.model');
    const { Cart, CartItems } = require('./cart.model');
    const { Op } = require("sequelize");

    const generateRandomId = () => Math.random().toString(36).substr(2, 8).toUpperCase();

    transaction = await sequelize.transaction();

    // --- PATCH CODE START ---
    const productIds = [...new Set(orders.map(o => o.itemid))].sort();

    const products = await Produk.findAll({
      where: { id: { [Op.in]: productIds } },
      order: [['id', 'ASC']],
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    const productMap = {};
    products.forEach(p => productMap[p.id] = p);

    for (const order of orders) {
      const product = productMap[order.itemid];
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ error: `Product not found: ${order.itemid}` });
      }
      if (product.Stok < order.quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: `Insufficient stock for ${order.name}`,
          available: product.Stok,
          requested: order.quantity
        });
      }
    }
    // --- PATCH CODE END ---

    const ordersGroupedByPedagang = orders.reduce((acc, order) => {
      const orderId = order.orderid || order.orderId || generateRandomId();

      if (!acc[orderId]) {
        acc[orderId] = {
          id: orderId,
          user: order.user || null,
          total: 0,
          catatan: order.catatan || '',
          alamat: order.alamat || '',
          pemesan: order.pemesan || `guest_${order.user || 'unknown'}`,
          created_at: new Date(),
          status: "pending",
          order_items: []
        };
      }

      const itemTotal = parseFloat(order.price) * parseInt(order.quantity);
      acc[orderId].total += itemTotal;

      acc[orderId].order_items.push({
        id: generateRandomId(),
        order_id: orderId,
        itemid: order.itemid,
        name: order.name || `Product ${order.itemid}`,
        pedagang: order.pedagang,
        price: order.price,
        quantity: order.quantity.toString(),
      });

      return acc;
    }, {});

    const createdOrders = [];

    for (const orderData of Object.values(ordersGroupedByPedagang)) {
      const createdOrder = await Orders.create(orderData, { transaction });
      await OrderItems.bulkCreate(orderData.order_items, { transaction });

      for (const item of orderData.order_items) {
        await Produk.decrement('Stok', {
          by: parseInt(item.quantity),
          where: { id: item.itemid },
          transaction
        });
      }

      createdOrders.push(createdOrder);
    }

    if (clearCart && orders.length > 0 && orders[0].user) {
      const cart = await Cart.findOne({ 
        where: { user: orders[0].user },
        transaction
      });

      if (cart) {
        await CartItems.destroy({
          where: { cart_id: cart.id },
          transaction
        });
        await Cart.destroy({
          where: { id: cart.id },
          transaction
        });
      }
    }

    await transaction.commit();
    res.status(201).json({ 
      message: "Orders created successfully",
      orders: createdOrders.map(o => ({
        id: o.id,
        orderid: o.id,
        user: o.user,
        total: o.total
      }))
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error processing orders:", error);
    res.status(500).json({ 
      error: "Failed to process orders",
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});


app.put("/orders/:id", async (req, res) => {
  const { id } = req.params;
  const { invoice_url } = req.body;

  try {
    const { Orders } = require('./orders.model');
    
    const order = await Orders.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await order.update({ invoice_url });
    res.status(200).json(order);
  } catch (error) {
    console.error("Error updating order invoice:", error);
    res.status(500).json({ 
      error: "Failed to update order invoice",
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

app.get("/orders/:id", async (req, res) => {
  try {
    const { Orders, OrderItems } = require('./orders.model');
    
    const order = await Orders.findOne({
      where: { id: req.params.id },
      include: [{
        model: OrderItems,
        as: "order_items"
      }]
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ 
      error: "Failed to fetch order",
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// Mark order as complete and delete it
app.delete("/orders/:id/complete", async (req, res) => {
  const orderId = req.params.id;
  let transaction;

  try {
    const { Orders, OrderItems, Invoice } = require('./orders.model');
    
    transaction = await sequelize.transaction();

    // First nullify the order_id reference in invoice
    await Invoice.update(
      { order_id: null },
      { 
        where: { order_id: orderId },
        transaction
      }
    );

    // Then delete order items
    await OrderItems.destroy({ 
      where: { order_id: orderId },
      transaction
    });

    // Finally delete the order
    const deletedCount = await Orders.destroy({ 
      where: { id: orderId },
      transaction
    });

    if (deletedCount === 0) {
      await transaction.rollback();
      return res.status(404).json({ error: "Order not found" });
    }

    await transaction.commit();
    res.status(204).end();
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error completing order:", error);
    res.status(500).json({ 
      error: "Failed to complete order",
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

app.post("/orders/:id/refund", async (req, res) => {
  let transaction;
  try {
    const { Orders, OrderItems, Invoice } = require('./orders.model');
    const { Produk } = require('./produk.model');
    
    transaction = await sequelize.transaction();

    // Find the order with its items and associated products
    const order = await Orders.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: OrderItems,
          as: "order_items",
          include: [{
            model: Produk,
            as: "order_item_product", // Corrected alias from patch
            attributes: ['id', 'Stok']
          }]
        },
        {
          model: Invoice,
          as: "invoice"
        }
      ],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: "Order not found" });
    }

    // Update stock for each item
    await Promise.all(order.order_items.map(async (item) => {
      if (item.order_item_product) { // Updated reference to match corrected alias
        await Produk.increment('Stok', {
          by: parseInt(item.quantity),
          where: { id: item.itemid },
          transaction
        });
      }
    }));

    // Handle associated invoice (if exists)
    if (order.invoice) {
      await Invoice.update(
        { order_id: null },
        { 
          where: { id: order.invoice.id },
          transaction
        }
      );
    }

    // Delete order items
    await OrderItems.destroy({ 
      where: { order_id: order.id },
      transaction
    });

    // Finally delete the order
    await Orders.destroy({ 
      where: { id: order.id },
      transaction
    });

    await transaction.commit();
    res.json({ 
      message: "Order refunded and stock updated successfully",
      invoice_url: order.invoice ? order.invoice.invoice_url : null
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Refund error:", error);
    res.status(500).json({ 
      error: "Failed to process refund",
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// Update invoice creation endpoint
app.post('/invoices', async (req, res) => {
  try {
    const { Orders, Invoice } = require('./orders.model');
    
    const { order_id, filename, pdfData } = req.body;
    
    if (!order_id || !pdfData) {
      return res.status(400).json({ 
        error: "order_id and pdfData are required" 
      });
    }

    // Verify order exists
    const order = await Orders.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Convert base64 to Buffer
    const fileBuffer = Buffer.from(pdfData, 'base64');
    
    // Generate consistent filename if not provided
    const finalFilename = filename || `invoice_${order_id}.pdf`;
    const invoiceUrl = `/invoices/${order_id}/${finalFilename}`;

    const invoice = await Invoice.create({
      id: generateRandomId(),
      order_id,
      filename: finalFilename,
      file: fileBuffer,
      invoice_url: invoiceUrl
    });

    // Update order with invoice URL
    await order.update({ 
      invoice_url: invoice.invoice_url 
    });

    res.status(201).json({
      id: invoice.id,
      invoice_url: invoice.invoice_url
    });
  } catch (error) {
    console.error("Invoice creation error:", error);
    res.status(500).json({ 
      error: "Failed to create invoice",
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

app.get('/invoices/:order_id/:filename', async (req, res) => {
  try {
    const { Invoice } = require('./orders.model');
    const { order_id } = req.params;

    // Find invoice by order_id or invoice_url
    const invoice = await Invoice.findOne({
      where: { 
        [Op.or]: [
          { order_id },
          { invoice_url: `/invoices/${order_id}/${req.params.filename}` }
        ]
      }
    });

    if (!invoice || !invoice.file) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Set proper headers for inline display
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.filename || 'invoice.pdf'}"`,
      'Content-Length': invoice.file.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'Content-Disposition',
      'X-Content-Type-Options': 'nosniff'
    });
    
    res.send(invoice.file);
  } catch (error) {
    console.error("Error serving invoice:", error);
    res.status(500).json({ 
      error: "Failed to serve invoice",
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// Add validation endpoint
app.get('/invoices/:id/verify', async (req, res) => {
  try {
    // eslint-disable-next-line no-undef
    const invoice = await Invoice.findByPk(req.params.id);
    // eslint-disable-next-line no-undef
    const isValid = isValidPDF(invoice.file);
    
    res.json({
      valid: isValid,
      size: invoice.file.length,
      firstBytes: invoice.file.slice(0,4).toString('hex')
    });
  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
});

initializeModels().then(() => {
  const HOST = '0.0.0.0'; // Explicitly set to 0.0.0.0 to match .env configuration
  const server = app.listen(port, HOST, () => {
    console.log(`Orders service running at ${baseUrl}`);
    console.log(`Server running on http://${HOST}:${port}`);
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });
}).catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sequelize = require("./db");

const app = express();
const port = 3003;

app.use(cors());
app.use(bodyParser.json());

// Generate an 8-character random string for ID
function generateRandomId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// Initialize database models with proper relationships
async function initializeModels() {
  try {
    const sequelizeInstance = require('./db');
    
    // Import models in the correct order
    const User = require('./user.model');
    const { Produk } = require('./produk.model');
    const { Cart, CartItems } = require('./cart.model');
    const { Orders, OrderItems, Invoice } = require('./orders.model');

    // Setup associations
    const setupAssociations = require('./associations');
    setupAssociations({ User, Cart, CartItems, Produk, Orders, OrderItems, Invoice });

    // Clean up any invalid foreign key references before syncing
    await sequelizeInstance.query(`
      DELETE FROM orders 
      WHERE user NOT IN (SELECT id FROM user)
    `);

    await sequelizeInstance.query(`
      DELETE FROM cart 
      WHERE user NOT IN (SELECT id FROM user)
    `);

    await sequelizeInstance.query(`
      DELETE FROM invoice 
      WHERE order_id NOT IN (SELECT id FROM orders)
    `);

    await sequelizeInstance.query(`
      DELETE FROM order_items 
      WHERE order_id NOT IN (SELECT id FROM orders)
    `);

    // Sync models in proper dependency order
    await User.sync({ alter: true });  // Base table must sync first
    await Produk.sync({ alter: true }); // Independent product table
    await Cart.sync({ alter: true });  // Depends only on User
    await Orders.sync({ alter: true }); // Must sync before Invoice and OrderItems
    await Invoice.sync({ alter: true }); // Depends on Orders
    await CartItems.sync({ alter: true }); // Depends on Cart and Produk
    await OrderItems.sync({ alter: true }); // Depends on Orders and Produk

    console.log('Database models synchronized successfully');
  } catch (error) {
    console.error('Failed to initialize models:', error);
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
    return res.status(400).json({ error: "Invalid order data - expected array" });
  }

  let transaction;
  try {
    const { Orders, OrderItems } = require('./orders.model');
    const { Produk } = require('./produk.model');
    const { Cart, CartItems } = require('./cart.model');
    
    transaction = await sequelize.transaction();

    // First validate all products and quantities
    for (const order of orders) {
      const product = await Produk.findOne({ 
        where: { id: order.itemid },
        transaction
      });
      
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ 
          error: `Product not found: ${order.itemid}`,
          itemid: order.itemid
        });
      }
      
      if (product.Stok < order.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          error: `Insufficient stock for product: ${order.name}`,
          itemid: order.itemid,
          available: product.Stok,
          requested: order.quantity
        });
      }
    }

    // Process orders if validation passes
    const ordersGroupedByPedagang = orders.reduce((acc, order) => {
      if (!acc[order.orderid]) {
        acc[order.orderid] = {
          id: order.orderid || generateRandomId(),
          user: order.user,
          total: 0,
          catatan: order.catatan,
          alamat: order.alamat || order.Alamat,
          pemesan: order.pemesan,
          created_at: new Date(),
          status: "pending",
          order_items: []
        };
      }
      
      acc[order.orderid].total += parseFloat(order.price) * parseInt(order.quantity);
      acc[order.orderid].order_items.push({
        id: generateRandomId(),
        order_id: acc[order.orderid].id,
        itemid: order.itemid,
        name: order.name,
        pedagang: order.pedagang,
        price: order.price,
        quantity: order.quantity.toString(),
      });
      
      return acc;
    }, {});

    const createdOrders = [];
    
    for (const orderData of Object.values(ordersGroupedByPedagang)) {
      const createdOrder = await Orders.create(orderData, { transaction });
      
      // Create order items
      await OrderItems.bulkCreate(orderData.order_items, { transaction });
      
      // Update product stocks
      for (const item of orderData.order_items) {
        await Produk.decrement('Stok', {
          by: parseInt(item.quantity),
          where: { id: item.itemid },
          transaction
        });
      }
      
      createdOrders.push({
        id: createdOrder.id,
        orderid: createdOrder.id,
        user: createdOrder.user,
        total: createdOrder.total
      });
    }

    // Clear cart if requested
    if (clearCart && orders.length > 0) {
      const userId = orders[0].user;
      
      // Find the user's cart
      const cart = await Cart.findOne({ 
        where: { user: userId },
        transaction
      });
      
      if (cart) {
        // Delete all cart items
        await CartItems.destroy({
          where: { cart_id: cart.id },
          transaction
        });
        
        // Delete the cart
        await Cart.destroy({
          where: { id: cart.id },
          transaction
        });
      }
    }

    await transaction.commit();
    res.status(201).json({ 
      message: "Orders created successfully",
      orders: createdOrders
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

// Update the refund endpoint to properly handle stock updates
// Update the refund endpoint to properly handle stock updates
app.post("/orders/:id/refund", async (req, res) => {
  let transaction;
  try {
    const { Orders, OrderItems, Invoice } = require('./orders.model');
    const { Produk } = require('./produk.model');
    
    transaction = await sequelize.transaction();

    // Find the order with its items and associated products
    const order = await Orders.findOne({
      where: { id: req.params.id },
      include: [{
        model: OrderItems,
        as: "order_items",
        include: [{
          model: Produk,
          as: "order_item_product", // Corrected alias
          attributes: ['id', 'Stok']
        }]
      }],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: "Order not found" });
    }

    // Update stock for each item
    await Promise.all(order.order_items.map(async (item) => {
      if (item.order_item_product) { // Using correct alias
        await Produk.increment('Stok', {
          by: parseInt(item.quantity), // Ensure quantity is parsed as integer
          where: { id: item.itemid },
          transaction
        });
      }
    }));

    // Delete associated invoice first (if exists)
    if (order.invoice_url) {
      await Invoice.destroy({ 
        where: { order_id: order.id },
        transaction
      });
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
    res.json({ message: "Order refunded and stock updated successfully" });
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

// Add this near the other route definitions in server.js
app.get('/invoices/:order_id/:filename', async (req, res) => {
  try {
    const { Invoice } = require('./orders.model');
    const { order_id } = req.params;

    // Find the invoice in database
    const invoice = await Invoice.findOne({
      where: { order_id }
    });

    if (!invoice || !invoice.file) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${invoice.filename}`);
    
    // Send the PDF data
    res.send(invoice.file);
  } catch (error) {
    console.error("Error serving invoice:", error);
    res.status(500).json({ 
      error: "Failed to serve invoice",
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// Initialize models before starting server
initializeModels().then(() => {
  app.listen(port, () => {
    console.log(`Orders service is running on http://localhost:${port}`);
  });
});
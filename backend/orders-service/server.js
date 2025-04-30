const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment-timezone");
const { Orders, OrderItems, Invoice } = require("./orders.model");
const { Produk } = require("./produk.model"); // Import the Produk model
const NodeCache = require('node-cache'); // Added for caching

const app = express();
const port = 3003;

// Initialize cache with 60 second TTL
const orderCache = new NodeCache({ stdTTL: 60 });

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

// Format date to YYYY-MM-DD HH:mm:ss in UTC+7
function getCurrentTimestamp() {
  return moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
}

// Get all orders with their items
app.get("/orders", async (req, res) => {
  try {
    const orders = await Orders.findAll({
      include: [{ model: OrderItems, as: "order_items" }],
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get single order by ID with caching
// Update the /orders/:id endpoint
app.get("/orders/:id", async (req, res) => {
  try {
    const cachedOrder = orderCache.get(req.params.id);
    if (cachedOrder) {
      // Ensure order_items is always an array
      cachedOrder.order_items = Array.isArray(cachedOrder.order_items) 
        ? cachedOrder.order_items 
        : cachedOrder.order_items ? [cachedOrder.order_items] : [];
      return res.json(cachedOrder);
    }
    
    const order = await Orders.findOne({
      where: { id: req.params.id },
      include: [{
        model: OrderItems,
        as: "order_items",
        required: false
      }]
    });
    
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    // Convert to plain object and ensure order_items is an array
    const plainOrder = order.get({ plain: true });
    plainOrder.order_items = Array.isArray(plainOrder.order_items) 
      ? plainOrder.order_items 
      : plainOrder.order_items ? [plainOrder.order_items] : [];
    
    orderCache.set(req.params.id, plainOrder);
    res.json(plainOrder);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get order by orderid (either direct match or through order_items)
app.get("/orders/by-orderid/:orderid", async (req, res) => {
  try {
    // First try direct match
    let order = await Orders.findOne({
      where: { id: req.params.orderid },
      include: [{ model: OrderItems, as: "order_items" }],
      raw: true,
      nest: true
    });

    // If not found, try searching by orderid field
    if (!order) {
      order = await Orders.findOne({
        where: { '$order_items.order_id$': req.params.orderid },
        include: [{ model: OrderItems, as: "order_items" }],
        raw: true,
        nest: true
      });
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
    }

    // Create a clean plain object
    const cleanOrder = JSON.parse(JSON.stringify(order));
    res.json(cleanOrder);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/orders", async (req, res) => {
  const { orders } = req.body;
  if (!Array.isArray(orders) || orders.length === 0) {
    return res.status(400).json({ error: "Invalid order data." });
  }

  try {
    const ordersGroupedByPedagang = orders.reduce((acc, order) => {
      if (!acc[order.orderid]) {
        acc[order.orderid] = {
          id: generateRandomId(),
          user: order.user,
          total: 0,
          catatan: order.catatan,
          alamat: order.Alamat,
          pemesan: order.pemesan,
          created_at: getCurrentTimestamp(),
          status: "pending",
          order_items: [],
          temporaryId: order.orderid // Store the original ID
        };
      }
      acc[order.orderid].total += order.total;
      acc[order.orderid].order_items.push({
        id: generateRandomId(),
        order_id: acc[order.orderid].id,
        itemid: order.itemid,
        name: order.name,
        pedagang: order.pedagang,
        price: order.price,
        quantity: order.quantity,
      });
      return acc;
    }, {});

    const createdOrders = [];
    
    for (const orderId of Object.keys(ordersGroupedByPedagang)) {
      const orderData = ordersGroupedByPedagang[orderId];
      const createdOrder = await Orders.create(orderData);
      createdOrders.push({
        id: createdOrder.id,
        temporaryId: orderId
      });

      for (const item of orderData.order_items) {
        await OrderItems.create(item);

        // Update the stock in the dataproduk table
        const product = await Produk.findOne({ where: { id: item.itemid } });
        if (product) {
          const newStock = product.Stok - item.quantity;
          await Produk.update({ Stok: newStock }, { where: { id: item.itemid } });
        }
      }
    }

    res.status(201).json({ 
      message: "Orders added successfully!",
      orders: createdOrders
    });
  } catch (error) {
    console.error("Error adding orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/orders/:id", async (req, res) => {
  const orderId = req.params.id;
  try {
    await OrderItems.destroy({ where: { order_id: orderId } });
    const deletedOrder = await Orders.destroy({ where: { id: orderId } });

    if (deletedOrder) {
      // Clear the cache for this order
      orderCache.del(orderId);
      res.status(204).end();
    } else {
      res.status(404).send("Order not found");
    }
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Refund an order and update stock
app.post("/orders/:id/refund", async (req, res) => {
  const orderId = req.params.id;

  try {
    // Step 1: Fetch the order and its items
    const order = await Orders.findOne({
      where: { id: orderId },
      include: [{ model: OrderItems, as: "order_items" }],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Step 2: Update stock for each item in the order
    for (const item of order.order_items) {
      const product = await Produk.findOne({ where: { id: item.itemid } });
      if (product) {
        const newStock = product.Stok + parseInt(item.quantity, 10);
        await Produk.update({ Stok: newStock }, { where: { id: item.itemid } });
      }
    }

    // Step 3: Delete the order and its items
    await OrderItems.destroy({ where: { order_id: orderId } });
    await Orders.destroy({ where: { id: orderId } });

    // Clear the cache for this order
    orderCache.del(orderId);

    res.status(200).json({ message: "Order refunded and stock updated successfully!" });
  } catch (error) {
    console.error("Error refunding order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete all orders for a specific user
app.delete("/orders/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    // Find all orders for this user
    const orders = await Orders.findAll({
      where: { user: userId }
    });
    
    // Delete each order's items and then the order itself
    for (const order of orders) {
      await OrderItems.destroy({ where: { order_id: order.id } });
      await Orders.destroy({ where: { id: order.id } });
      // Clear the cache for each order
      orderCache.del(order.id);
    }
    
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting user orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// In backend\orders-service\server.js
app.post('/invoices', async (req, res) => {
  try {
    const { order_id, filename, pdfData } = req.body;
    
    // Create the invoice record
    const invoice = await Invoice.create({
      id: generateRandomId(),
      order_id,
      filename,
      file: Buffer.from(pdfData, 'base64')
    });

    // Generate the invoice URL
    const invoiceUrl = `/orders/${order_id}/invoice`;

    // Update the order with the invoice URL
    await Orders.update(
      { invoice_url: invoiceUrl },
      { where: { id: order_id } }
    );

    res.status(201).json({ 
      message: 'Invoice created successfully',
      invoiceId: invoice.id,
      invoiceUrl
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get invoice by order ID - Enhanced version
app.get('/orders/:id/invoice', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: { order_id: req.params.id }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Verify the PDF data is valid
    if (!invoice.file || !(invoice.file instanceof Buffer)) {
      return res.status(500).json({ error: 'Invalid PDF data' });
    }

    // Set comprehensive headers
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${encodeURIComponent(invoice.filename)}"`,
      'Content-Length': invoice.file.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'ALLOW-FROM *', // Allow iframe embedding
      'Content-Security-Policy': "frame-ancestors 'self' *", // Modern alternative to X-Frame-Options
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length'
    });

    // Send the PDF data
    res.send(invoice.file);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add this new endpoint for completing orders without refund
app.delete("/orders/:id/complete", async (req, res) => {
  const orderId = req.params.id;
  try {
    // Delete order items first
    await OrderItems.destroy({ where: { order_id: orderId } });
    
    // Then delete the order
    const deletedOrder = await Orders.destroy({ where: { id: orderId } });

    if (deletedOrder) {
      // Clear the cache for this order
      orderCache.del(orderId);
      res.status(204).end();
    } else {
      res.status(404).send("Order not found");
    }
  } catch (error) {
    console.error("Error completing order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Orders service is running on http://localhost:${port}`);
});

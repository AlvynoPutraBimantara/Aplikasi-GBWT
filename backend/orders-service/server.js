const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment-timezone");
const { Orders, OrderItems } = require("./orders.model");
const { Produk } = require("./produk.model"); // Import the Produk model

const app = express();
const port = 3003;

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

// Create a new order with items
// ... (previous code remains the same until the POST /orders endpoint)

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
          alamat: order.Alamat, // Now properly passed from frontend
          pemesan: order.pemesan, // Now properly passed from frontend
          created_at: getCurrentTimestamp(),
          status: "pending", // Default status
          order_items: [],
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

    for (const orderId of Object.keys(ordersGroupedByPedagang)) {
      const orderData = ordersGroupedByPedagang[orderId];
      await Orders.create(orderData);

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

    res.status(201).json({ message: "Orders added successfully!" });
  } catch (error) {
    console.error("Error adding orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// Delete an order by ID
app.delete("/orders/:id", async (req, res) => {
  const orderId = req.params.id;
  try {
    await OrderItems.destroy({ where: { order_id: orderId } });
    const deletedOrder = await Orders.destroy({ where: { id: orderId } });

    if (deletedOrder) {
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

    res.status(200).json({ message: "Order refunded and stock updated successfully!" });
  } catch (error) {
    console.error("Error refunding order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Add this to orders-service/server.js before the app.listen call

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
    }
    
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting user orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Orders service is running on http://localhost:${port}`);
});
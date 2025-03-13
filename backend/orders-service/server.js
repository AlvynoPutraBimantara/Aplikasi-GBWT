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
          created_at: getCurrentTimestamp(), // Assign timestamp in UTC+7
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
      // eslint-disable-next-line no-unused-vars
      const newOrder = await Orders.create(orderData);

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

app.listen(port, () => {
  console.log(`Orders service is running on http://localhost:${port}`);
});
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const dbFilePath = path.join(__dirname, "db.json");
const getData = () => JSON.parse(fs.readFileSync(dbFilePath, "utf-8"));
const saveData = (data) =>
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));

app.get("/Orders", (req, res) => {
  const data = getData();
  res.json(data.Orders);
});

app.post("/Orders", (req, res) => {
  const data = getData();
  const newOrder = req.body;

  // Ensure the ID is a string
  if (typeof newOrder.id !== "string") {
    return res.status(400).send("Order ID must be a string");
  }

  data.Orders.push(newOrder);
  data.Cart = []; // Clear cart on server
  saveData(data);
  res.status(201).json(newOrder);
});

app.delete("/Orders/:id", (req, res) => {
  const data = getData();
  const orderId = req.params.id;

  // Log the order ID to debug
  console.log(`Attempting to delete order with ID: ${orderId}`);

  const orderIndex = data.Orders.findIndex((order) => order.id === orderId);

  if (orderIndex !== -1) {
    data.Orders.splice(orderIndex, 1);
    saveData(data);
    res.status(204).end();
  } else {
    console.log(`Order with ID: ${orderId} not found`);
    res.status(404).send("Order not found");
  }
});

app.get("/Cart", (req, res) => {
  const data = getData();
  res.json(data.Cart);
});

app.post("/Cart", (req, res) => {
  const data = getData();
  const newCartItem = req.body;
  data.Cart.push(newCartItem);
  saveData(data);
  res.status(201).json(newCartItem);
});

app.put("/DataProduk/:id", (req, res) => {
  const data = getData();
  const productId = req.params.id;
  const updatedProduct = req.body;

  const productIndex = data.DataProduk.findIndex((p) => p.id === productId);
  if (productIndex !== -1) {
    data.DataProduk[productIndex] = updatedProduct;
    saveData(data);
    console.log(
      `Product ${updatedProduct.Nama} updated: new stock ${updatedProduct.Stok}`
    );
    res.status(200).json(updatedProduct);
  } else {
    res.status(404).send("Product not found");
  }
});

app.delete("/Cart/:id", (req, res) => {
  const data = getData();
  const cartItemId = req.params.id;
  data.Cart = data.Cart.filter((item) => item.id !== cartItemId);
  saveData(data);
  res.status(204).end();
});

app.delete("/Cart", (req, res) => {
  const data = getData();
  data.Cart = [];
  saveData(data);
  res.status(204).end();
});

app.get("/DataProduk", (req, res) => {
  const data = getData();
  res.json(data.DataProduk);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.post("/Transactions", (req, res) => {
  const data = getData();
  const newTransaction = req.body;
  data.Transactions.push(newTransaction);
  saveData(data);
  res.status(201).json(newTransaction);
});

app.get("/Transactions", (req, res) => {
  const data = getData();
  res.json(data.Transactions);
});

app.delete("/Transactions/:id", (req, res) => {
  const data = getData();
  const transactionId = req.params.id;

  const transactionIndex = data.Transactions.findIndex(
    (transaction) => transaction.id === transactionId
  );

  if (transactionIndex !== -1) {
    data.Transactions.splice(transactionIndex, 1);
    saveData(data);
    res.status(204).end();
  } else {
    res.status(404).send("Transaction not found");
  }
});

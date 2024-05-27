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

// Orders routes
app.get("/Orders", (req, res) => {
  const data = getData();
  res.json(data.Orders);
});

app.post("/Orders", (req, res) => {
  const data = getData();
  const newOrder = req.body;
  data.Orders.push(newOrder);
  data.Cart = [];
  saveData(data);
  res.status(201).json(newOrder);
});

// Cart routes
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

app.put("/Cart/:id", (req, res) => {
  const data = getData();
  const cartItemId = req.params.id;
  const newQuantity = req.body.quantity;
  const item = data.Cart.find((item) => item.id === cartItemId);
  if (item) {
    item.quantity = newQuantity;
    saveData(data);
    res.status(200).json(item);
  } else {
    res.status(404).send("Item not found");
  }
});

app.delete("/Cart/:id", (req, res) => {
  const data = getData();
  const cartItemId = req.params.id;
  data.Cart = data.Cart.filter((item) => item.id !== cartItemId);
  saveData(data);
  res.status(204).end();
});

app.get("/DataProduk", (req, res) => {
  const data = getData();
  res.send(data.DataProduk);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

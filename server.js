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
  data.Orders.push(newOrder);
  data.Cart = [];
  saveData(data);
  res.status(201).json(newOrder);
});

app.delete("/Orders/:id", (req, res) => {
  const data = getData();
  const orderId = req.params.id;
  data.Orders = data.Orders.filter((order) => order.id !== orderId);
  saveData(data);
  res.status(204).end();
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

app.get("/DataProduk", (req, res) => {
  const data = getData();
  res.json(data.DataProduk);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

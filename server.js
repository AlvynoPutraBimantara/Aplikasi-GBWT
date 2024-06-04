const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to my server!");
});

// Paths
const dbFilePath = path.join(__dirname, "db.json");
const imagesDir = path.join(__dirname, "images");

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// Helper functions for reading and writing data
const getData = () => {
  if (!fs.existsSync(dbFilePath)) {
    // Create initial data structure if file doesn't exist
    const initialData = {
      DataProduk: [],
      Orders: [],
      Cart: [],
      Transactions: [],
      User: [], // Ensure User array is present
    };
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2));
  }
  return JSON.parse(fs.readFileSync(dbFilePath, "utf-8"));
};

const saveData = (data) =>
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/images", express.static(imagesDir));

// File upload endpoint
app.post("/uploads", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const imageUrl = `/images/${req.file.filename}`;
  res.status(201).json({ imageUrl });
});

// Routes for User
app.get("/User", (req, res) => {
  const data = getData();
  res.json(data.User);
});

app.get("/User/:id", (req, res) => {
  const data = getData();
  const user = data.User.find((u) => u.id === req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).send("User not found");
  }
});

app.put("/User/:id", (req, res) => {
  const data = getData();
  const userIndex = data.User.findIndex((u) => u.id === req.params.id);
  if (userIndex !== -1) {
    data.User[userIndex] = req.body;
    saveData(data);
    res.status(200).json(data.User[userIndex]);
  } else {
    res.status(404).send("User not found");
  }
});

// Routes for DataProduk
app.get("/DataProduk", (req, res) => {
  const data = getData();
  res.json(data.DataProduk);
});

app.post("/DataProduk", (req, res) => {
  const data = getData();
  const newProduct = req.body;
  data.DataProduk.push(newProduct);
  saveData(data);
  res.status(201).json(newProduct);
});

app.put("/DataProduk/:id", (req, res) => {
  const data = getData();
  const productId = req.params.id;
  const updatedProduct = req.body;
  const productIndex = data.DataProduk.findIndex((p) => p.id === productId);
  if (productIndex !== -1) {
    data.DataProduk[productIndex] = updatedProduct;
    saveData(data);
    res.status(200).json(updatedProduct);
  } else {
    res.status(404).send("Product not found");
  }
});

// Routes for Orders
app.get("/Orders", (req, res) => {
  const data = getData();
  res.json(data.Orders);
});

app.post("/Orders", (req, res) => {
  const data = getData();
  const newOrder = req.body;
  newOrder.timestamp = new Date().toISOString(); // Add timestamp
  data.Orders.push(newOrder);
  saveData(data);
  res.status(201).json(newOrder);
});

app.delete("/Orders/:id", (req, res) => {
  const data = getData();
  const orderId = req.params.id;
  const orderIndex = data.Orders.findIndex((order) => order.id === orderId);
  if (orderIndex !== -1) {
    data.Orders.splice(orderIndex, 1);
    saveData(data);
    res.status(204).end();
  } else {
    res.status(404).send("Order not found");
  }
});

// Routes for Cart
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

// Routes for Transactions
app.get("/Transactions", (req, res) => {
  const data = getData();
  const transactions = data.Transactions;
  const products = data.DataProduk;
  const namaWarung = req.headers["nama-warung"];
  if (!namaWarung) {
    return res.status(400).send("NamaWarung header is missing");
  }
  const transactionsWithPedagang = transactions.map((transaction) => {
    const itemsWithPedagang = transaction.items.map((item) => {
      const product = products.find((p) => p.id === item.id);
      return {
        ...item,
        pedagang: product ? product.Pedagang : null,
      };
    });
    return {
      ...transaction,
      items: itemsWithPedagang,
    };
  });
  const filteredTransactions = transactionsWithPedagang.filter((transaction) =>
    transaction.items.some((item) => item.pedagang === namaWarung)
  );
  res.json(filteredTransactions);
});

app.post("/Transactions", (req, res) => {
  const data = getData();
  const newTransaction = req.body;
  newTransaction.timestamp = new Date().toISOString(); // Add timestamp
  console.log(`Transaction by user ${newTransaction.user} is being processed`);
  data.Transactions.push(newTransaction);
  saveData(data);
  res.status(201).json(newTransaction);
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.put("/DataKategori/:id", (req, res) => {
  const data = getData();
  const kategoriId = req.params.id;
  const updatedKategori = req.body;
  const kategoriIndex = data.DataKategori.findIndex((k) => k.id === kategoriId);
  if (kategoriIndex !== -1) {
    data.DataKategori[kategoriIndex] = {
      ...data.DataKategori[kategoriIndex],
      ...updatedKategori,
    };
    saveData(data);
    res.status(200).json(updatedKategori);
  } else {
    res.status(404).send("Kategori not found");
  }
});

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment-timezone");
const { Transactions, TransactionItems, TransactionsHistory, TransactionHistoryItems } = require("./transactions.model");
const { Produk } = require("./produk.model");
//const { sequelize } = require("./db");

const app = express();
const port = 3005;

app.use(cors());
app.use(bodyParser.json());

// Format date to YYYY-MM-DD HH:mm:ss in UTC+7
function getCurrentTimestamp() {
  return moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
}

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

// Get all transaction items
app.get("/transactions-items", async (req, res) => {
  try {
    const items = await TransactionItems.findAll();
    res.json(items);
  } catch (error) {
    console.error("Error fetching transaction items:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a new transaction with items
app.post("/transactions", async (req, res) => {
  const { order, invoice_url } = req.body;

  if (!order || !order.user || !order.order_items || order.order_items.length === 0) {
    return res.status(400).json({ error: "Invalid transaction data." });
  }

  try {
    // Create the transaction
    const transactionId = generateRandomId();
    // eslint-disable-next-line no-unused-vars
    const transaction = await Transactions.create({
      id: transactionId,
      user: order.user,
      total: order.total,
      catatan: order.catatan,
      alamat: order.alamat,
      pemesan: order.pemesan || order.user, // Include pemesan field
      created_at: getCurrentTimestamp(),
      invoice_url: invoice_url || null
    });

    // Create transaction items
    for (const item of order.order_items) {
      await TransactionItems.create({
        id: generateRandomId(),
        transactions_id: transactionId,
        itemid: item.itemid,
        name: item.name,
        pedagang: item.pedagang,
        price: item.price,
        quantity: item.quantity,
      });
    }

    res.status(201).json({ 
      message: "Transaction created successfully!", 
      transactionId 
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all transactions with their items
app.get("/transactions", async (req, res) => {
  try {
    const transactions = await Transactions.findAll({
      include: [{ model: TransactionItems, as: "transaction_items" }],
    });
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a transaction by ID
app.delete("/transactions/:id", async (req, res) => {
  const transactionId = req.params.id;
  try {
    await TransactionItems.destroy({ where: { transactions_id: transactionId } });
    const deletedTransaction = await Transactions.destroy({ where: { id: transactionId } });

    if (deletedTransaction) {
      res.status(204).end();
    } else {
      res.status(404).send("Transaction not found");
    }
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Refund a transaction and update stock
app.post("/transactions/:id/refund", async (req, res) => {
  const transactionId = req.params.id;
  const { invoice_url } = req.body;

  try {
    // Fetch the transaction and its items
    const transaction = await Transactions.findOne({
      where: { id: transactionId },
      include: [{ model: TransactionItems, as: "transaction_items" }],
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Update stock for each item in the transaction
    for (const item of transaction.transaction_items) {
      const product = await Produk.findOne({ where: { id: item.itemid } });
      if (product) {
        const newStock = product.Stok + parseInt(item.quantity, 10);
        await Produk.update({ Stok: newStock }, { where: { id: item.itemid } });
      }
    }

    // Move the transaction to history with invoice_url
    await TransactionsHistory.create({
      id: transaction.id,
      user: transaction.user,
      total: transaction.total,
      catatan: transaction.catatan,
      alamat: transaction.alamat,
      description: "Pesanan Dikembalikan",
      created_at: transaction.created_at,
      invoice_url: invoice_url || transaction.invoice_url || null
    });

    // Move transaction items to transactions_history_items
    for (const item of transaction.transaction_items) {
      await TransactionHistoryItems.create({
        id: generateRandomId(),
        transaction_id: transactionId,
        itemid: item.itemid,
        name: item.name,
        pedagang: item.pedagang,
        price: item.price,
        quantity: item.quantity,
      });
    }

    // Delete the transaction and its items from the main tables
    await TransactionItems.destroy({ where: { transactions_id: transactionId } });
    await Transactions.destroy({ where: { id: transactionId } });

    res.status(200).json({ message: "Transaction refunded and moved to history successfully!" });
  } catch (error) {
    console.error("Error refunding transaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Move transaction to history and delete from main tables
app.post("/transactions/:id/move-to-history", async (req, res) => {
  const transactionId = req.params.id;
  const { description, invoice_url } = req.body;

  try {
    // Fetch the transaction and its items
    const transaction = await Transactions.findOne({
      where: { id: transactionId },
      include: [{ model: TransactionItems, as: "transaction_items" }],
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Create a new entry in transactions_history with invoice_url
    await TransactionsHistory.create({
      id: transaction.id,
      user: transaction.user,
      total: transaction.total,
      catatan: transaction.catatan,
      alamat: transaction.alamat,
      pemesan: transaction.pemesan, // Include pemesan field
      description: description,
      created_at: transaction.created_at,
      invoice_url: invoice_url || transaction.invoice_url || null
    });

    // Move transaction items to transactions_history_items
    for (const item of transaction.transaction_items) {
      await TransactionHistoryItems.create({
        id: generateRandomId(),
        transaction_id: transactionId,
        itemid: item.itemid,
        name: item.name,
        pedagang: item.pedagang,
        price: item.price,
        quantity: item.quantity,
      });
    }

    // Delete the transaction and its items from the main tables
    await TransactionItems.destroy({ where: { transactions_id: transactionId } });
    await Transactions.destroy({ where: { id: transactionId } });

    res.status(200).json({ message: "Transaction moved to history successfully!" });
  } catch (error) {
    console.error("Error moving transaction to history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all transactions history
app.get("/transactions-history", async (req, res) => {
  try {
    const transactions = await TransactionsHistory.findAll();
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get transaction history items by transaction ID
app.get("/transactions-history-items/:transactionId", async (req, res) => {
  const transactionId = req.params.transactionId;
  try {
    const items = await TransactionHistoryItems.findAll({
      where: { transaction_id: transactionId },
    });
    res.json(items);
  } catch (error) {
    console.error("Error fetching transaction history items:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Mark transaction as paid
app.put("/transactions-history/:id/mark-as-paid", async (req, res) => {
  const transactionId = req.params.id;

  try {
    // Update the transaction description to "Sudah dibayar"
    await TransactionsHistory.update(
      { description: "Lunas" },
      { where: { id: transactionId } }
    );

    res.status(200).json({ message: "Transaction marked as paid successfully!" });
  } catch (error) {
    console.error("Error marking transaction as paid:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/transactions-history-items", async (req, res) => {
  try {
    const items = await TransactionHistoryItems.findAll();
    res.json(items);
  } catch (error) {
    console.error("Error fetching transaction history items:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Transactions service is running on http://localhost:${port}`);
});
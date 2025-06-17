const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment-timezone");
const { Op } = require("sequelize");
const { Transactions, TransactionItems, TransactionsHistory, TransactionHistoryItems } = require("./transactions.model");
const { Produk } = require("./produk.model");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3005;

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://192.168.100.8:8080',
  'http://192.168.100.8:3000',
  'http://192.168.100.8:3005',
  // Allow all devices in local network
  /^http:\/\/192\.168\.100\.\d{1,3}(:\d+)?$/,
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/ // Allow any 192.168.x.x address
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.some(allowedOrigin => 
        typeof allowedOrigin === 'string' 
          ? origin === allowedOrigin
          : allowedOrigin.test(origin)
      ) // ← added closing parenthesis here
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};


// Middleware
app.use(cors(corsOptions));
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

// Database synchronization
(async () => {
  try {
    await Transactions.sync({ alter: true });
    await TransactionItems.sync({ alter: true });
    await TransactionsHistory.sync({ alter: true });
    await TransactionHistoryItems.sync({ alter: true });
    console.log('Transaction database models synchronized');
  } catch (syncError) {
    console.error('Error synchronizing transaction models:', syncError);
  }
})();

// Get all transaction items
app.get("/transactions-items", async (req, res) => {
  try {
    const items = await TransactionItems.findAll();
    res.json(items);
  } catch (error) {
    console.error("Error fetching transaction items:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create a new transaction with items (updated to flat structure)
app.post("/transactions", async (req, res) => {
  const { id, user, total, catatan, alamat, pemesan, created_at, order_items, invoice_url } = req.body;

  // Validate required fields
  if (!user || !order_items || order_items.length === 0) {
    return res.status(400).json({ error: "Data transaksi tidak valid." });
  }
  if (!alamat) {
    return res.status(400).json({ error: "Alamat harus diisi." });
  }

  try {
    // Use transaction for atomic operations
    await Transactions.sequelize.transaction(async (t) => {
      // Create the transaction
      const transaction = await Transactions.create({
        id: id || generateRandomId(),
        user: user,
        total: total,
        catatan: catatan,
        alamat: alamat,
        pemesan: pemesan || user,
        created_at: created_at || getCurrentTimestamp(),
        invoice_url: invoice_url || null
      }, { transaction: t });

      // Create transaction items
      const itemPromises = order_items.map(item => 
        TransactionItems.create({
          id: generateRandomId(),
          transactions_id: transaction.id,
          itemid: item.itemid,
          name: item.name,
          pedagang: item.pedagang,
          price: item.price,
          quantity: parseInt(item.quantity, 10) || 1,
        }, { transaction: t })
      );

      await Promise.all(itemPromises);

      res.status(201).json({ 
        message: "Transaksi berhasil dibuat!", 
        transactionId: transaction.id 
      });
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ 
      error: "Terjadi kesalahan server",
      details: error.message 
    });
  }
});

// Get all transactions with their items
app.get("/transactions", async (req, res) => {
  try {
    const whereClause = {};
    
    // Add filtering by user if provided
    if (req.query.user) {
      whereClause.user = req.query.user;
    }
    
    // Add filtering by status if provided
    if (req.query.status) {
      whereClause.status = req.query.status;
    }

    const transactions = await Transactions.findAll({
      where: whereClause,
      include: [{ model: TransactionItems, as: "transaction_items" }],
      order: [['created_at', 'DESC']]
    });
    
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get transaction by ID
app.get("/transactions/:id", async (req, res) => {
  try {
    const transaction = await Transactions.findByPk(req.params.id, {
      include: [{ model: TransactionItems, as: "transaction_items" }]
    });

    if (transaction) {
      res.json(transaction);
    } else {
      res.status(404).json({ error: "Transaction not found" });
    }
  } catch (error) {
    console.error(`Error fetching transaction (${req.params.id}):`, error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update transaction status
app.put("/transactions/:id/status", async (req, res) => {
  try {
    const transaction = await Transactions.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    await transaction.update({ status });
    res.json({ message: "Transaction status updated successfully" });
  } catch (error) {
    console.error(`Error updating transaction status (${req.params.id}):`, error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete a transaction by ID
app.delete("/transactions/:id", async (req, res) => {
  try {
    await Transactions.sequelize.transaction(async (t) => {
      await TransactionItems.destroy({ 
        where: { transactions_id: req.params.id },
        transaction: t
      });
      
      const deletedTransaction = await Transactions.destroy({ 
        where: { id: req.params.id },
        transaction: t
      });

      if (deletedTransaction) {
        res.status(204).end();
      } else {
        res.status(404).send("Transaction not found");
      }
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Refund a transaction and update stock
app.post("/transactions/:id/refund", async (req, res) => {
  const transactionId = req.params.id;
  const { invoice_url } = req.body;

  try {
    // Use transaction for atomic operations
    await Transactions.sequelize.transaction(async (t) => {
      // Fetch the transaction and its items
      const transaction = await Transactions.findOne({
        where: { id: transactionId },
        include: [{ model: TransactionItems, as: "transaction_items" }],
        transaction: t
      });

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      // Update stock for each item in the transaction
      for (const item of transaction.transaction_items) {
        const product = await Produk.findOne({ 
          where: { id: item.itemid },
          transaction: t
        });
        if (product) {
          const newStock = product.Stok + parseInt(item.quantity, 10);
          await Produk.update({ Stok: newStock }, { 
            where: { id: item.itemid },
            transaction: t
          });
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
      }, { transaction: t });

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
        }, { transaction: t });
      }

      // Delete the transaction and its items from the main tables
      await TransactionItems.destroy({ 
        where: { transactions_id: transactionId },
        transaction: t
      });
      await Transactions.destroy({ 
        where: { id: transactionId },
        transaction: t
      });

      res.status(200).json({ message: "Transaction refunded and moved to history successfully!" });
    });
  } catch (error) {
    console.error("Error refunding transaction:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Move transaction to history and delete from main tables
app.post("/transactions/:id/move-to-history", async (req, res) => {
  const transactionId = req.params.id;
  const { description, invoice_url } = req.body;

  try {
    // Use transaction for atomic operations
    await Transactions.sequelize.transaction(async (t) => {
      // Fetch the transaction and its items
      const transaction = await Transactions.findOne({
        where: { id: transactionId },
        include: [{ model: TransactionItems, as: "transaction_items" }],
        transaction: t
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
        pemesan: transaction.pemesan,
        description: description,
        created_at: transaction.created_at,
        invoice_url: invoice_url || transaction.invoice_url || null
      }, { transaction: t });

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
        }, { transaction: t });
      }

      // Delete the transaction and its items from the main tables
      await TransactionItems.destroy({ 
        where: { transactions_id: transactionId },
        transaction: t
      });
      await Transactions.destroy({ 
        where: { id: transactionId },
        transaction: t
      });

      res.status(200).json({ message: "Transaction moved to history successfully!" });
    });
  } catch (error) {
    console.error("Error moving transaction to history:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all transactions history with optional filters
app.get("/transactions-history", async (req, res) => {
  try {
    const whereClause = {};
    
    // Add filtering by description if provided
    if (req.query.description) {
      whereClause.description = req.query.description;
    }
    
    // Add filtering by user if provided
    if (req.query.user) {
      whereClause.user = req.query.user;
    }
    
    // Add date range filtering if provided
    if (req.query.startDate && req.query.endDate) {
      whereClause.created_at = {
        [Op.between]: [
          new Date(req.query.startDate),
          new Date(req.query.endDate)
        ]
      };
    }

    const transactions = await TransactionsHistory.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });
    
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions history:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    res.status(500).json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark transaction as paid
app.put("/transactions-history/:id/mark-as-paid", async (req, res) => {
  const transactionId = req.params.id;

  try {
    // Update the transaction description to "Lunas"
    await TransactionsHistory.update(
      { description: "Lunas" },
      { where: { id: transactionId } }
    );

    res.status(200).json({ message: "Transaction marked as paid successfully!" });
  } catch (error) {
    console.error("Error marking transaction as paid:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all transaction history items
app.get("/transactions-history-items", async (req, res) => {
  try {
    const items = await TransactionHistoryItems.findAll();
    res.json(items);
  } catch (error) {
    console.error("Error fetching transaction history items:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Start server
const HOST = '0.0.0.0'; // Listen on all network interfaces
app.listen(port, HOST, () => {
  console.log("Transactions service is running on:");
  console.log(`- Local: http://192.168.100.8:${port}`);
  console.log(`- Network: http://192.168.100.8:${port}`);
  console.log(`- Accessible from any device in your local network`);
});
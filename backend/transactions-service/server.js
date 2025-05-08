require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment-timezone');
const { 
  Transactions, 
  TransactionItems, 
  TransactionsHistory, 
  TransactionHistoryItems 
} = require('./transactions.model');
// eslint-disable-next-line no-unused-vars
const { Produk } = require('./produk.model');

const app = express();
const port = process.env.PORT || 3005;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Service prefix
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'transaction-service',
      timestamp: new Date().toISOString()
    }
  });
});

// Helper functions
const getCurrentTimestamp = () => moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
const generateRandomId = () => Math.random().toString(36).substr(2, 8);

// Transaction endpoints
router.post('/transactions', async (req, res) => {
  const { order, invoice_url } = req.body;

  if (!order || !order.user || !order.order_items?.length) {
    return res.status(400).json({
      success: false,
      message: 'Invalid transaction data'
    });
  }

  try {
    const transactionId = generateRandomId();
    
    await Transactions.create({
      id: transactionId,
      user: order.user,
      total: order.total,
      catatan: order.catatan,
      alamat: order.alamat,
      pemesan: order.pemesan || order.user,
      created_at: getCurrentTimestamp(),
      invoice_url: invoice_url || null
    });

    await Promise.all(order.order_items.map(item => 
      TransactionItems.create({
        id: generateRandomId(),
        transactions_id: transactionId,
        itemid: item.itemid,
        name: item.name,
        pedagang: item.pedagang,
        price: item.price,
        quantity: item.quantity,
      })
    ));

    res.status(201).json({
      success: true,
      data: { transactionId }
    });
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction'
    });
  }
});

router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transactions.findAll({
      include: [{ 
        model: TransactionItems, 
        as: 'transaction_items' 
      }],
    });

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

// History endpoints
router.post('/transactions/:id/move-to-history', async (req, res) => {
  const { id } = req.params;
  const { description, invoice_url } = req.body;

  try {
    const transaction = await Transactions.findOne({
      where: { id },
      include: [{ model: TransactionItems, as: 'transaction_items' }]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await TransactionsHistory.create({
      ...transaction.toJSON(),
      description,
      invoice_url: invoice_url || transaction.invoice_url
    });

    await Promise.all(
      transaction.transaction_items.map(item =>
        TransactionHistoryItems.create({
          ...item.toJSON(),
          id: generateRandomId(),
          transaction_id: id
        })
      )
    );

    await TransactionItems.destroy({ where: { transactions_id: id } });
    await Transactions.destroy({ where: { id } });

    res.json({
      success: true,
      message: 'Transaction moved to history'
    });
  } catch (error) {
    console.error('Move to history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move transaction'
    });
  }
});

// Mount router
app.use('/transaction-service', router);

// Error handling
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Transaction service error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.listen(port, () => {
  console.log(`Transaction service running on port ${port}`);
  console.log(`Endpoint: http://localhost:${port}/transaction-service`);
});
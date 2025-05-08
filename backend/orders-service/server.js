require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment-timezone');
const { Orders, OrderItems, Invoice } = require('./orders.model');
const { Produk } = require('./produk.model');
const NodeCache = require('node-cache');
const sequelize = require('./db');

const app = express();
const port = process.env.PORT || 3003;

// Initialize cache with 60 second TTL
const orderCache = new NodeCache({ stdTTL: 60 });

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Service router
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'order-service',
      timestamp: new Date().toISOString(),
      dbStatus: sequelize.authenticate() ? 'connected' : 'disconnected'
    }
  });
});

// Helper functions
const generateRandomId = () => Math.random().toString(36).substr(2, 8);
const getCurrentTimestamp = () => moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');

// Order endpoints
router.post('/orders', async (req, res) => {
  const { orders } = req.body;

  if (!Array.isArray(orders) || orders.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order data'
    });
  }

  const transaction = await sequelize.transaction();
  try {
    const ordersGrouped = orders.reduce((acc, order) => {
      if (!acc[order.orderid]) {
        acc[order.orderid] = {
          id: generateRandomId(),
          user: order.user,
          total: 0,
          catatan: order.catatan,
          alamat: order.alamat,
          pemesan: order.pemesan,
          created_at: getCurrentTimestamp(),
          status: 'pending',
          order_items: [],
          temporaryId: order.orderid
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
    
    for (const orderData of Object.values(ordersGrouped)) {
      const createdOrder = await Orders.create(orderData, { transaction });
      
      await Promise.all(orderData.order_items.map(item =>
        OrderItems.create(item, { transaction })
      ));

      // Update product stock
      await Promise.all(orderData.order_items.map(async item => {
        const product = await Produk.findOne({ 
          where: { id: item.itemid },
          transaction
        });
        
        if (product) {
          await Produk.update(
            { Stok: product.Stok - item.quantity },
            { where: { id: item.itemid }, transaction }
          );
        }
      }));

      createdOrders.push({
        id: createdOrder.id,
        temporaryId: orderData.temporaryId
      });
    }

    await transaction.commit();
    
    res.status(201).json({
      success: true,
      data: createdOrders
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create orders'
    });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const cachedOrder = orderCache.get(req.params.id);
    if (cachedOrder) {
      return res.json({
        success: true,
        data: cachedOrder
      });
    }

    const order = await Orders.findOne({
      where: { id: req.params.id },
      include: [{
        model: OrderItems,
        as: 'order_items',
        required: false
      }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const orderData = order.get({ plain: true });
    orderCache.set(req.params.id, orderData);
    
    res.json({
      success: true,
      data: orderData
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// Invoice endpoints
router.post('/invoices', async (req, res) => {
  const { order_id, filename, pdfData } = req.body;

  if (!order_id || !filename || !pdfData) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  try {
    const invoice = await Invoice.create({
      id: generateRandomId(),
      order_id,
      filename,
      file: Buffer.from(pdfData, 'base64')
    });

    const invoiceUrl = `/order-service/orders/${order_id}/invoice`;

    await Orders.update(
      { invoice_url: invoiceUrl },
      { where: { id: order_id } }
    );

    res.status(201).json({
      success: true,
      data: {
        invoiceId: invoice.id,
        invoiceUrl
      }
    });
  } catch (error) {
    console.error('Invoice creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice'
    });
  }
});

router.get('/orders/:id/invoice', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: { order_id: req.params.id }
    });

    if (!invoice || !invoice.file) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.filename}"`,
      'Content-Length': invoice.file.length
    });

    res.send(invoice.file);
  } catch (error) {
    console.error('Invoice fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice'
    });
  }
});

// Mount service router
app.use('/order-service', router);

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Order service error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.listen(port, () => {
  console.log(`Order service running on port ${port}`);
  console.log(`Service endpoint: http://localhost:${port}/order-service`);
});
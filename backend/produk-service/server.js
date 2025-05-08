require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pool = require('./db');
const { Sequelize } = require('sequelize');

const app = express();
const port = process.env.PORT || 3002;

// Database connection check
const checkDatabaseConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer configuration (used for file uploads)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Add file upload endpoint to demonstrate usage
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({
    message: 'File uploaded successfully',
    file: req.file
  });
});

// Initialize Sequelize and test connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

// Test Sequelize connection
sequelize.authenticate()
  .then(() => console.log('Sequelize connection established'))
  .catch(err => console.error('Sequelize connection failed:', err));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'produk-service' });
});
// API Routes
const router = express.Router();

// Product routes
router.get('/products', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM dataproduk');
    res.json(products.map(p => ({
      ...p,
      imageUrl: p.imageUrl ? `${process.env.SERVICE_URL}${p.imageUrl}` : null
    })));
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM dataproduk WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    const product = rows[0];
    if (product.imageUrl) {
      product.imageUrl = `${process.env.SERVICE_URL}${product.imageUrl}`;
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Image routes
router.get('/images/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productimages WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Image not found' });
    
    const image = rows[0];
    res.set('Content-Type', image.mimetype);
    res.send(image.data);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mount router with service prefix
app.use('/produk-service', router);

// Error handling middleware
app.use((err, req, res) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
checkDatabaseConnection().then(() => {
  app.listen(port, () => {
    console.log(`Produk service running on port ${port}`);
    console.log(`Service endpoint: http://localhost:${port}/produk-service`);
  });
});
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
// eslint-disable-next-line no-unused-vars
const path = require('path');
const { AppImage, Category } = require('./category.model');

const app = express();
const port = process.env.PORT || 3006;
const sequelize = require('./db');

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Service router
const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    await Category.findOne();
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        service: 'category-service',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection error'
    });
  }
});

// Helper function to generate random ID
const generateRandomId = () => Math.random().toString(36).substr(2, 8);

// Image endpoints
router.post('/images', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const image = await AppImage.create({
      id: generateRandomId(),
      filename: req.file.originalname,
      data: req.file.buffer,
      mimetype: req.file.mimetype
    });

    const imageUrl = `${process.env.SERVICE_URL}/images/${image.id}`;
    
    res.status(201).json({
      success: true,
      data: {
        id: image.id,
        imageUrl
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
});

router.get('/images/:id', async (req, res) => {
  try {
    const image = await AppImage.findByPk(req.params.id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    res.set({
      'Content-Type': image.mimetype,
      'Content-Disposition': `inline; filename="${image.filename}"`,
      'Cross-Origin-Resource-Policy': 'cross-origin'
    });
    res.send(image.data);
  } catch (error) {
    console.error('Image fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch image'
    });
  }
});

// Category endpoints
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { category, imageUrl } = req.body;
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const newCategory = await Category.create({
      id: generateRandomId(),
      category,
      imageUrl
    });

    res.status(201).json({
      success: true,
      data: newCategory
    });
  } catch (error) {
    console.error('Category creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, imageUrl } = req.body;

    const [updated] = await Category.update(
      { category, imageUrl },
      { where: { id } }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const updatedCategory = await Category.findByPk(id);
    res.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    console.error('Category update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Category deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
});

// Mount service router
app.use('/category-service', router);

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Category service error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Connect to DB and start server
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established');
    app.listen(port, () => {
      console.log(`Category service running on port ${port}`);
      console.log(`Service endpoint: http://localhost:${port}/category-service`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

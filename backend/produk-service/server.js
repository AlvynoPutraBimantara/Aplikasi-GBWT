const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Op } = require("sequelize");
const { Produk, ProdukImages } = require("./produk.model");
const app = express();
//const os = require('os');
require('dotenv').config();

// Determine port from environment or default
const port = process.env.PORT || 3002;

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://192.168.100.8:8080',
  'http://192.168.100.8:3000',
  'http://192.168.100.8:3002',
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
      )  // This closing parenthesis was missing
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
app.use(express.json());

// Multer configuration
const upload = multer(); // Use memory storage to avoid saving files locally

// Helper function for warnings
const logWarning = (message) => {
  console.warn(`[WARNING]: ${message}`);
};

// Helper function to generate random ID
const generateRandomId = () => Math.random().toString(36).substr(2, 8).toUpperCase();

// Update the base URL handling
const getBaseUrl = () => {
  const networkIp = '192.168.100.8'; // Your server's local IP
  return process.env.BASE_URL || `http://${networkIp}:${port}`;
};

// Database synchronization
(async () => {
  try {
    // Sync both models
    await Produk.sync({ alter: true });
    await ProdukImages.sync({ alter: true });
    console.log('Database models synchronized');
  } catch (syncError) {
    console.error('Error synchronizing models:', syncError);
  }
})();

// CRUD Routes

// Get all products
app.get("/products", async (req, res) => {
  try {
    // Verify tables exist with raw query
    const [tables] = await Produk.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = '${process.env.DB_NAME || "gbwt"}'
      AND table_name IN ('dataproduk', 'productimages')
    `);
    
    if (tables.length < 2) {
      throw new Error('Required tables not found in database');
    }

    // Debugging: Verify table structure in development
    if (process.env.NODE_ENV === 'development') {
      try {
        const [results] = await Produk.sequelize.query("DESCRIBE dataproduk");
        console.log("Table structure:", results);
        
        const [rawProducts] = await Produk.sequelize.query(`
          SELECT id, Nama, Harga, Harga_diskon, Kategori, Keterangan, 
                Pedagang, Stok, imageUrl, created_at, user_id 
          FROM dataproduk
          ORDER BY created_at DESC
          LIMIT 5
        `);
        console.log("Raw query results sample:", rawProducts);
      } catch (debugError) {
        console.error("Debugging error:", debugError);
      }
    }

    const options = {
      order: [['created_at', 'DESC']],
      attributes: [
        'id', 'Nama', 'Harga', 'Harga_diskon', 'Kategori', 
        'Keterangan', 'Pedagang', 'Stok', 'imageUrl', 'created_at', 'user_id'
      ],
      include: [{
        model: ProdukImages,
        as: 'images',
        attributes: ['id', 'mimetype']
      }]
    };

    if (req.query.newSince) {
      options.where = {
        created_at: {
          [Op.gte]: new Date(req.query.newSince)
        }
      };
    }

    const products = await Produk.findAll(options);

    const processedProducts = products.map(product => ({
      ...product.get({ plain: true }),
      imageUrl: product.imageUrl ? `${getBaseUrl()}/images/${product.id}` : null,
      hasImage: product.images && product.images.length > 0
    }));

    res.json(processedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack
      } : undefined
    });
  }
});

// Get product by ID
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Produk.findByPk(req.params.id, {
      include: [{
        model: ProdukImages,
        as: 'images'
      }]
    });

    if (product) {
      const productData = product.get({ plain: true });
      // Always set imageUrl if product has images
      productData.imageUrl = product.images && product.images.length > 0 
        ? `${getBaseUrl()}/images/${product.id}`
        : null;
      res.json(productData);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.error(`Error fetching product by ID (${req.params.id}):`, error);
    res.status(500).json({ error: error.message });
  }
});

// Create product
app.post("/products", upload.single("image"), async (req, res) => {
  // Validate required fields (excluding user_id)
  const requiredFields = ['Nama', 'Harga', 'Kategori', 'Pedagang'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({ 
      success: false,
      error: "Missing required fields",
      missingFields 
    });
  }

  // Add logging for incoming data
  console.log("Incoming product data:", {
    body: req.body,
    file: req.file ? `Received file (${req.file.size} bytes)` : 'No file'
  });

  try {
    const productId = generateRandomId();
    const userId = req.body.user_id || null; // Make user_id optional

    // If user_id is provided, verify it exists
    if (userId) {
      try {
        const [user] = await Produk.sequelize.query(
          'SELECT id FROM `user` WHERE id = ? LIMIT 1', // Add backticks around table name
          { replacements: [userId] }
        );
        
        if (!user || user.length === 0) {
          return res.status(400).json({
            success: false,
            error: "Invalid user_id",
            message: "User tidak ditemukan"
          });
        }
      } catch (dbError) {
        console.error("Database error during user verification:", dbError);
        return res.status(500).json({
          success: false,
          error: "Database error during user verification"
        });
      }
    }

    await Produk.sequelize.transaction(async (t) => {
      // Create product
      await Produk.create({
        id: productId,
        Nama: req.body.Nama,
        Harga: parseFloat(req.body.Harga),
        Kategori: req.body.Kategori,
        Keterangan: req.body.Keterangan || null,
        Pedagang: req.body.Pedagang,
        Stok: parseInt(req.body.Stok) || 0,
        imageUrl: req.file ? `/images/${productId}` : null,
        user_id: userId // Can be null
      }, { transaction: t });

      // Create image if file was uploaded
      if (req.file) {
        await ProdukImages.create({
          id: productId,
          filename: req.file.originalname,
          data: req.file.buffer,
          mimetype: req.file.mimetype,
          upload_date: new Date()
        }, { transaction: t });
      }
    });

    res.status(201).json({ 
      success: true,
      message: "Product added successfully",
      productId
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to add product",
      message: process.env.NODE_ENV === 'development' ? error.message : "Terjadi kesalahan server"
    });
  }
});

// Serve image files
app.get("/images/:id", async (req, res) => {
  try {
    const image = await ProdukImages.findByPk(req.params.id);
    if (image) {
      res.setHeader("Content-Type", image.mimetype);
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.send(image.data);
    } else {
      res.status(404).json({ error: "Image not found" });
    }
  } catch (error) {
    console.error(`Error fetching image for product (${req.params.id}):`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update product
app.put("/products/:id", upload.single("image"), async (req, res) => {
  try {
    const product = await Produk.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { Nama, Harga, Kategori, Keterangan, Pedagang, Stok, Harga_diskon, user_id } = req.body;

    // Use transaction for atomic updates
    await Produk.sequelize.transaction(async (t) => {
      // Update product data
      await product.update({
        Nama,
        Harga,
        Kategori,
        Keterangan,
        Pedagang,
        Stok,
        Harga_diskon: Harga_diskon || null,
        user_id,
        imageUrl: req.file ? `/images/${req.params.id}` : product.imageUrl
      }, { transaction: t });

      // Update or create image if file was uploaded
      if (req.file) {
        await ProdukImages.upsert({
          id: req.params.id,
          filename: req.file.originalname,
          data: req.file.buffer,
          mimetype: req.file.mimetype
        }, { transaction: t });
      }
    });

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error(`Error updating product (${req.params.id}):`, error);
    res.status(500).json({ error: error.message });
  }
});

// Delete product
app.delete("/products/:id", async (req, res) => {
  try {
    const deletedCount = await Produk.destroy({
      where: { id: req.params.id }
    });
    
    if (deletedCount === 1) {
      res.json({ message: "Product deleted" });
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    logWarning(`Error deleting product (${req.params.id}): ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Reset discount
app.put("/products/:id/reset-discount", async (req, res) => {
  try {
    const product = await Produk.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await product.update({ Harga_diskon: null });
    res.json({ message: "Discount reset successfully" });
  } catch (error) {
    console.error(`Error resetting discount for product (${req.params.id}):`, error);
    res.status(500).json({ error: error.message });
  }
});

// Get new products
app.get("/products/new", async (req, res) => {
  try {
    const sinceDate = req.query.since || new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    const products = await Produk.findAll({
      where: {
        created_at: {
          [Op.gte]: sinceDate
        }
      },
      order: [['created_at', 'DESC']],
      include: [{
        model: ProdukImages,
        as: 'images',
        attributes: ['mimetype']
      }]
    });
    
    const productsWithImageUrls = products.map(product => ({
      ...product.get({ plain: true }),
      imageUrl: product.imageUrl ? `${getBaseUrl()}/images/${product.id}` : null,
      hasImage: product.images && product.images.length > 0
    }));
    
    res.json(productsWithImageUrls);
  } catch (error) {
    console.error("Error fetching new products:", error);
    res.status(500).json({ error: "Failed to fetch new products" });
  }
});

// Start server
const HOST = '0.0.0.0'; // Listen on all network interfaces
app.listen(port, HOST, () => {
  console.log("Produk service is running on:");
  console.log(`- Local: http://localhost:${port}`);
  console.log(`- Network: http://192.168.100.8:${port}`);
  console.log(`- Accessible from any device in your local network`);
});
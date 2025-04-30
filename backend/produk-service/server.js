// Import dependencies
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pool = require("./db");
const generateRandomId = () => Math.random().toString(36).substr(2, 8).toUpperCase();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration
const upload = multer(); // Use memory storage to avoid saving files locally

// Helper function for warnings
const logWarning = (message) => {
  console.warn(`[WARNING]: ${message}`);
};

// CRUD Routes

// In backend\produk-service\server.js (alternative version)
app.get("/products", async (req, res) => {
  try {
    let query = "SELECT * FROM dataproduk";
    let params = [];
    
    // Check if this is a request for new products
    if (req.query.newSince) {
      query = "SELECT * FROM dataproduk WHERE created_at >= ? ORDER BY created_at DESC";
      params = [req.query.newSince];
    }
    
    const [products] = await pool.query(query, params);
    
    // Process products to include full image URLs
    const processedProducts = products.map(product => ({
      ...product,
      imageUrl: product.imageUrl 
        ? `http://localhost:3002${product.imageUrl}`
        : 'default-image.jpg'
    }));
    
    res.json(processedProducts);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
app.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM dataproduk WHERE id = ?", [id]);
    if (rows.length > 0) {
      const product = rows[0];
      if (product.imageUrl) {
        product.imageUrl = `http://localhost:3002${product.imageUrl}`;
      }
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.error(`Error fetching product by ID (${id}):`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// In the POST /products route in server.js
app.post("/products", upload.single("image"), async (req, res) => {
  const { Nama, Harga, Kategori, Keterangan, Pedagang, Stok } = req.body;

  if (!Nama || !Harga || !Kategori || !Pedagang) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const productId = generateRandomId();

    // Insert product data into 'dataproduk'
    const productQuery = `
      INSERT INTO dataproduk (id, Nama, Harga, Kategori, Keterangan, Pedagang, Stok, imageUrl, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    const imageUrl = req.file ? `/images/${productId}` : null;
    const productValues = [productId, Nama, Harga, Kategori, Keterangan, Pedagang, Stok, imageUrl];
    await pool.query(productQuery, productValues);

    // Rest of the code remains the same...
    if (req.file) {
      const imageQuery = `
        INSERT INTO productimages (id, filename, data, mimetype)
        VALUES (?, ?, ?, ?)
      `;
      const imageValues = [productId, req.file.originalname, req.file.buffer, req.file.mimetype];
      await pool.query(imageQuery, imageValues);
    }

    res.status(201).json({ message: "Product added successfully" });
  } catch (error) {
    console.error("Error adding product:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Serve image files from the database
app.get("/images/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM productimages WHERE id = ?", [id]);
    if (rows.length > 0) {
      const image = rows[0];
      res.setHeader("Content-Type", image.mimetype);
      res.send(image.data);
    } else {
      res.status(404).json({ error: "Image not found" });
    }
  } catch (error) {
    console.error(`Error fetching image for product (${id}):`, error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/products/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { Nama, Harga, Kategori, Keterangan, Pedagang, Stok, Harga_diskon } = req.body;

  try {
    let imageUrl;

    if (req.file) {
      const sanitizedMimetype = req.file.mimetype.replace(/[^\w.-]/g, "");

      const imageQuery = `
        INSERT INTO productimages (id, filename, data, mimetype)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          filename = VALUES(filename), 
          data = VALUES(data), 
          mimetype = VALUES(mimetype)
      `;
      const imageValues = [id, req.file.originalname, req.file.buffer, sanitizedMimetype];
      await pool.query(imageQuery, imageValues);

      imageUrl = `/images/${id}`;
    } else {
      const [rows] = await pool.query("SELECT imageUrl FROM dataproduk WHERE id = ?", [id]);
      imageUrl = rows[0]?.imageUrl || null;
    }

    // Convert empty string, "0", or "null" to NULL for Harga_diskon
    const discountValue = !Harga_diskon || Harga_diskon === '0' || Harga_diskon === 'null' || Harga_diskon === '' 
      ? null 
      : parseFloat(Harga_diskon);

    const updateQuery = `
      UPDATE dataproduk 
      SET Nama = ?, Harga = ?, Kategori = ?, Keterangan = ?, Pedagang = ?, Stok = ?, imageUrl = ?, 
      Harga_diskon = ?
      WHERE id = ?
    `;
    const updateValues = [
      Nama, 
      Harga, 
      Kategori, 
      Keterangan, 
      Pedagang, 
      Stok, 
      imageUrl, 
      discountValue, 
      id
    ];
    
    await pool.query(updateQuery, updateValues);

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error(`Error updating product (${id}):`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete product
app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM dataproduk WHERE id = ?", [id]);
    res.json({ message: "Product deleted" });
  } catch (error) {
    logWarning(`Error deleting product (${id}): ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Fetch all users
app.get("/users", async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, NamaWarung FROM user");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Reset Harga_diskon for a product
app.put("/products/:id/reset-discount", async (req, res) => {
  const { id } = req.params;

  try {
    // Update the product to set Harga_diskon to NULL
    const updateQuery = `
      UPDATE dataproduk 
      SET Harga_diskon = NULL
      WHERE id = ?
    `;
    await pool.query(updateQuery, [id]);

    res.json({ message: "Discount reset successfully" });
  } catch (error) {
    console.error(`Error resetting discount for product (${id}):`, error.message);
    res.status(500).json({ error: error.message });
  }
});


app.get("/products/new", async (req, res) => {
  try {
    // Get the since date from query parameter or default to 3 days ago
    let sinceDate = req.query.since;
    
    if (!sinceDate) {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      sinceDate = threeDaysAgo.toISOString().slice(0, 19).replace('T', ' ');
    }

    // Query to get products created after the specified date
    const query = `
      SELECT * FROM dataproduk 
      WHERE created_at >= ? 
      ORDER BY created_at DESC
    `;
    
    const [products] = await pool.query(query, [sinceDate]);
    
    // Map products to include full image URLs
    const productsWithImageUrls = products.map(product => ({
      ...product,
      imageUrl: product.imageUrl 
        ? `http://localhost:3002${product.imageUrl}`
        : null
    }));
    
    res.json(productsWithImageUrls);
  } catch (error) {
    console.error("Error fetching new products:", error.message);
    res.status(500).json({ error: "Failed to fetch new products" });
  }
});

// Start server
app.listen(3002, () => {
  console.log("Produk service is running on http://localhost:3002");
});
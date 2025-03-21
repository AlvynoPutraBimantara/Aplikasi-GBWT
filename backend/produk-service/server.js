
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

// Get all products
app.get("/products", async (req, res) => {
  try {
    const [products] = await pool.query("SELECT * FROM dataproduk");
    res.json(products);
  } catch (error) {
    logWarning(`Error fetching products: ${error.message}`);
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


app.post("/products", upload.single("image"), async (req, res) => {
  const { Nama, Harga, Kategori, Keterangan, Pedagang, Stok } = req.body;

  if (!Nama || !Harga || !Kategori || !Pedagang) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const productId = generateRandomId();

    // Insert product data into 'dataproduk'
    const productQuery = `
      INSERT INTO dataproduk (id, Nama, Harga, Kategori, Keterangan, Pedagang, Stok, imageUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const imageUrl = req.file ? `/images/${productId}` : null;
    const productValues = [productId, Nama, Harga, Kategori, Keterangan, Pedagang, Stok, imageUrl];
    await pool.query(productQuery, productValues);

    // If image is uploaded, store it in 'productimages' with the same id as 'productId'
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
  const { Nama, Harga, Kategori, Keterangan, Pedagang, Stok } = req.body;

  try {
    let imageUrl;

    if (req.file) {
      const sanitizedMimetype = req.file.mimetype.replace(/[^\w.-]/g, "");

      // Store the updated image in the 'productimages' table
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
      // Retain the existing image URL if no new image is uploaded
      const [rows] = await pool.query("SELECT imageUrl FROM dataproduk WHERE id = ?", [id]);
      imageUrl = rows[0]?.imageUrl || null;
    }

    // Update the product details
    const updateQuery = `
      UPDATE dataproduk 
      SET Nama = ?, Harga = ?, Kategori = ?, Keterangan = ?, Pedagang = ?, Stok = ?, imageUrl = ? 
      WHERE id = ?
    `;
    const updateValues = [Nama, Harga, Kategori, Keterangan, Pedagang, Stok, imageUrl, id];
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


// Start server
app.listen(3002, () => {
  console.log("Produk service is running on http://localhost:3002");
});

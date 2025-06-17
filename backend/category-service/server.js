/* eslint-disable no-unused-vars */
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("./db");
const crypto = require("crypto");
const os = require('os');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3006;

// Calculate base URL for image serving
const baseUrl = process.env.BASE_URL || `http://${os.hostname()}:${port}`;

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://192.168.100.8:8080',
  'http://192.168.100.8:3000',
  'http://192.168.100.8:3006' 
];


const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// CRUD Operations for appimages

// Get all images
app.get("/images", (req, res) => {
  const query = "SELECT id, filename, mimetype, upload_date FROM appimages";
  db.query(query)
    .then(([results]) => res.json(results))
    .catch((err) => {
      console.error("Error fetching images:", err);
      res.status(500).send("Server error");
    });
});

// Delete an image by ID
app.delete("/images/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM appimages WHERE id = ?";

  db.query(query, [id])
    .then(([results]) => {
      if (results.affectedRows === 0) {
        res.status(404).send("Image not found");
      } else {
        res.send({ message: "Image deleted successfully" });
      }
    })
    .catch((err) => {
      console.error("Error deleting image:", err);
      res.status(500).send("Server error");
    });
});

// backend/category-service/server.js
app.get("/images/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT data, mimetype FROM appimages WHERE id = ?";
  
  db.query(query, [id])
    .then(([results]) => {
      if (results.length === 0) {
        return res.status(404).send("Image not found");
      }
      const image = results[0];
      res.setHeader("Content-Type", image.mimetype);
      res.send(image.data);
    })
    .catch((err) => {
      console.error("Error fetching image:", err);
      res.status(500).send("Server error");
    });
});

app.get("/categories/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM categories WHERE id = ?";
  db.query(query, [id])
    .then(([results]) => {
      if (results.length === 0) {
        res.status(404).send("Category not found");
      } else {
        res.json(results[0]);
      }
    })
    .catch((err) => {
      console.error("Error fetching category:", err);
      res.status(500).send("Server error");
    });
});

// CRUD Operations for categories

// Get all categories
app.get("/categories", (req, res) => {
  const query = "SELECT * FROM categories";
  db.query(query)
    .then(([results]) => res.json(results))
    .catch((err) => {
      console.error("Error fetching categories:", err);
      res.status(500).send("Server error");
    });
});

// Upload a new image
app.post("/images", upload.single("image"), (req, res) => {
  const { originalname, mimetype } = req.file;
  const data = req.file.buffer;
  const id = generateRandomId();

  const query = "INSERT INTO appimages (id, filename, data, mimetype) VALUES (?, ?, ?, ?)";
  db.query(query, [id, originalname, data, mimetype])
    .then(() => {
      // Use baseUrl instead of hardcoded localhost
      const imageUrl = `${baseUrl}/images/${id}`;
      res.status(201).send({ id, imageUrl });
    })
    .catch((err) => {
      console.error("Error uploading image:", err);
      res.status(500).send("Server error");
    });
});

// Add a new category with an image URL
app.post("/categories", (req, res) => {
  const { category, imageUrl } = req.body;

  if (!category || !imageUrl) {
    return res.status(400).send("Category and imageUrl are required.");
  }

  const categoryId = generateRandomId();

  const query = "INSERT INTO categories (id, category, imageUrl) VALUES (?, ?, ?)";
  db.query(query, [categoryId, category, imageUrl])
    .then(() => res.status(201).send({ id: categoryId, category, imageUrl }))
    .catch((err) => {
      console.error("Error adding category:", err);
      res.status(500).send("Server error");
    });
});

// Update a category
app.put("/categories/:id", (req, res) => {
  const { id } = req.params;
  const { category, imageurl, imageUrl } = req.body; // Accept both 'imageurl' and 'imageUrl'

  // Validate that the 'category' field is provided
  if (!category) {
    return res.status(400).send("Category name is required");
  }

  // Determine the final image URL, giving precedence to 'imageurl' if both are provided
  const finalImageUrl = imageurl || imageUrl || null;

  const query = "UPDATE categories SET category = ?, imageUrl = ? WHERE id = ?";

  db.query(query, [category, finalImageUrl, id])
    .then(([results]) => {
      if (results.affectedRows === 0) {
        res.status(404).send("Category not found");
      } else {
        res.send({ message: "Category updated successfully", id });
      }
    })
    .catch((err) => {
      console.error("Error updating category:", err);
      res.status(500).send("Server error");
    });
});


// Delete a category
app.delete("/categories/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM categories WHERE id = ?";
  db.query(query, [id])
    .then(([results]) => {
      if (results.affectedRows === 0) {
        res.status(404).send("Category not found");
      } else {
        res.send("Category deleted successfully");
      }
    })
    .catch((err) => {
      console.error("Error deleting category:", err);
      res.status(500).send("Server error");
    });
});

// Start server with network accessibility
const HOST = '0.0.0.0'; // Listen on all network interfaces
app.listen(port, HOST, () => {
  console.log(`Category service is running on:`);
  console.log(`- Local: http://localhost:${port}`);
  console.log(`- Network: http://192.168.100.8:${port}`);
});

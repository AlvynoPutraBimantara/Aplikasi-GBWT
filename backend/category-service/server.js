const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("./db"); // Importing the database connection from db.js
const crypto = require("crypto");

const app = express();
const port = 3006;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Get image by ID
app.get("/images/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT data, mimetype FROM appimages WHERE id = ?";
  db.query(query, [id])
    .then(([results]) => {
      if (results.length === 0) {
        res.status(404).send("Image not found");
      } else {
        const { data, mimetype } = results[0];
        res.setHeader("Content-Type", mimetype);
        res.send(data);
      }
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

  const query = "INSERT INTO appimages (filename, data, mimetype) VALUES (?, ?, ?)";
  db.query(query, [originalname, data, mimetype])
    .then(([result]) => {
      const imageUrl = `http://localhost:${port}/images/${result.insertId}`; // Generate imageUrl
      res.status(201).send({ id: result.insertId, imageUrl });
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

  // Generate a random 8-character ID
  const categoryId = crypto.randomBytes(4).toString("hex");

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
  const { category, imageurl } = req.body;

  if (!category) {
    return res.status(400).send("Category name is required");
  }

  const query = "UPDATE categories SET category = ?, imageurl = ? WHERE id = ?";
  db.query(query, [category, imageurl || null, id])
    .then(([results]) => {
      if (results.affectedRows === 0) {
        res.status(404).send("Category not found");
      } else {
        res.send("Category updated successfully");
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



// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

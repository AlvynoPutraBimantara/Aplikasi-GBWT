const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const pool = require("./db"); // Import the database pool from db.js

const app = express();
const port = 3006;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Test MySQL connection on server startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL");
    connection.release();
  } catch (error) {
    console.error("Error connecting to MySQL:", error.message);
    process.exit(1); // Exit process if MySQL connection fails
  }
})();

// Routes
// Upload image
app.post("/uploads", upload.single("image"), async (req, res) => {
    const { originalname, mimetype, buffer } = req.file;
  
    try {
      const [result] = await pool.execute(
        "INSERT INTO gbwt.userimages (filename, mimetype, data) VALUES (?, ?, ?)",
        [originalname, mimetype, buffer]
      );
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Database error." });
    }
  });
  
  app.get("/uploads/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const [rows] = await pool.execute(
        "SELECT filename, mimetype, data FROM gbwt.userimages WHERE id = ?",
        [id]
      );
      if (!rows.length) return res.status(404).json({ message: "Image not found." });
  
      const { mimetype, data } = rows[0];
      res.setHeader("Content-Type", mimetype);
      res.send(data);
    } catch (error) {
      console.error("Error fetching image:", error);
      res.status(500).json({ message: "Database error." });
    }
  });
  
  app.delete("/uploads/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const [result] = await pool.execute("DELETE FROM gbwt.userimages WHERE id = ?", [id]);
      if (!result.affectedRows) return res.status(404).json({ message: "Image not found." });
  
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ message: "Database error." });
    }
  });
  

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer"); // Move this line here
const pool = require("./db");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3001;

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cors());
app.use(bodyParser.json());

// Generate a 8-digit random string for ID
function generateRandomId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

// User Login Endpoint
app.post("/login", async (req, res) => {
  const { Nama, Password } = req.body;

  if (!Nama || !Password) {
    return res.status(400).json({ message: "Name and password are required." });
  }

  const query = "SELECT * FROM User WHERE Nama = ? AND Password = ?";
  try {
    const [results] = await pool.query(query, [Nama, Password]);

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = results[0];
    res.status(200).json(user);
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Fetch User by ID
app.get("/user/:id", async (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM user WHERE id = ?";
  try {
    const [results] = await pool.query(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Update user with image handling
app.put("/user/:id", async (req, res) => {
  const { id } = req.params;
  const { NamaWarung, Nama, Telp, Alamat, Password, imageUrl } = req.body;
  let previousImageId = null;

  // Get current user details to remove old image if necessary
  try {
    const [userResults] = await pool.query("SELECT imageUrl FROM user WHERE id = ?", [id]);
    if (userResults.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    const user = userResults[0];
    if (user.imageUrl) {
      const urlParts = user.imageUrl.split("/");
      previousImageId = urlParts[urlParts.length - 1];
    }
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({ message: "Internal server error." });
  }

  try {
    const [updateResult] = await pool.query(
      "UPDATE user SET NamaWarung = ?, Nama = ?, Telp = ?, Alamat = ?, Password = ?, imageUrl = ? WHERE id = ?",
      [NamaWarung, Nama, Telp, Alamat, Password, imageUrl, id]
    );

    if (!updateResult.affectedRows) {
      return res.status(404).json({ message: "User not found." });
    }

    // Remove previous image if a new one was uploaded
    if (previousImageId && previousImageId !== imageUrl.split("/").pop()) {
      await pool.query("DELETE FROM userimages WHERE id = ?", [previousImageId]);
    }

    res.status(200).json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});
// Create New User
app.post("/user", async (req, res) => {
  const { NamaWarung, Nama, Telp, Alamat, Password, imageUrl } = req.body;

  if (!Nama || !Password) {
    return res.status(400).json({ message: "Name and password are required." });
  }

  const userid = generateRandomId();

  const query = `
    INSERT INTO User (id, NamaWarung, Nama, Telp, Alamat, Password, role, imageUrl)
    VALUES (?, ?, ?, ?, ?, ?, 'user', ?)`;

  try {
    await pool.query(query, [
      userid,
      NamaWarung || null,
      Nama,
      Telp || null,
      Alamat || null,
      Password,
      imageUrl || null,
    ]);

    // Fetch the newly created user
    const [userResults] = await pool.query("SELECT * FROM User WHERE id = ?", [userid]);

    res.status(201).json(userResults[0]); // Send back the newly created user data
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Upload or Update User Image
app.post("/user/:id/upload-image", upload.single("image"), async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: "No image file provided." });
  }

  const { originalname, mimetype, buffer } = req.file;
  const imageId = generateRandomId();

  try {
    // Save image to userimages table
    await pool.query(
      "INSERT INTO gbwt.userimages (id, filename, data, mimetype) VALUES (?, ?, ?, ?)",
      [imageId, originalname, buffer, mimetype]
    );

    // Update user table with image URL
    const imageUrl = `http://localhost:3001/images/${imageId}`;
    await pool.query("UPDATE gbwt.user SET imageUrl = ? WHERE id = ?", [imageUrl, id]);

    res.status(200).json({ message: "Image uploaded and user updated successfully." });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Fetch All Users
app.get("/users", async (req, res) => {
  const query = "SELECT * FROM gbwt.user";
  try {
    const [results] = await pool.query(query);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Fetch All Users with NamaWarung not null
app.get("/users", async (req, res) => {
  const query = "SELECT * FROM gbwt.user WHERE NamaWarung IS NOT NULL";
  try {
    const [results] = await pool.query(query);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});


// Delete User by ID
app.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM gbwt.user WHERE id = ?";
  try {
    const [results] = await pool.query(query, [id]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Add routes to upload and manage images

// Upload user image
app.post("/uploads", upload.single("image"), async (req, res) => {
  const id = generateRandomId();
  const { originalname, mimetype, buffer } = req.file;

  try {
    await pool.query(
      "INSERT INTO userimages (id, filename, data, mimetype) VALUES (?, ?, ?, ?)",
      [id, originalname, buffer, mimetype]
    );

    res.status(201).json({ id });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Serve user image
app.get("/uploads/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await pool.query("SELECT * FROM userimages WHERE id = ?", [id]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Image not found." });
    }

    const image = results[0];
    res.setHeader("Content-Type", image.mimetype);
    res.send(image.data);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Delete Image by ID
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

app.get('/images/:id', async (req, res) => {
  const id = req.params.id;
  try {
      const [rows] = await pool.execute('SELECT * FROM userimages WHERE id = ?', [id]);
      if (rows.length === 0) {
          return res.status(404).send('Image not found');
      }
      const image = rows[0];
      res.set('Content-Type', image.mimetype);
      res.send(image.data);
  } catch (error) {
      console.error('Error fetching image:', error);
      res.status(500).send('Error fetching image');
  }
});


app.listen(port, () => {
  console.log(`User Service is running on http://localhost:${port}`);
});

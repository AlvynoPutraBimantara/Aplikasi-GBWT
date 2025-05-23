const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const pool = require("./db");
const app = express();
const cors = require("cors");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 3001;

const storage = multer.memoryStorage();
const upload = multer({ storage });

const saltRounds = 10;

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

// Utility function to normalize phone numbers
function formatPhoneNumber(telp) {
  if (!telp) return null;
  const cleaned = telp.toString().replace(/\D/g, '');
  if (cleaned.startsWith('62')) return cleaned;
  if (cleaned.startsWith('0')) return '62' + cleaned.substring(1);
  return '62' + cleaned;
}

// Generate JWT token function
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, nama: user.Nama },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Updated Login Endpoint
app.post("/login", async (req, res) => {
  const { Nama, Password } = req.body;

  // Validate input
  if (!Nama || !Password) {
    return res.status(400).json({ 
      success: false,
      message: 'Name and password are required'
    });
  }

  try {
    console.log(`Login attempt for user: ${Nama}`);
    
    // Find user by name
    const [users] = await pool.query("SELECT * FROM user WHERE Nama = ?", [Nama]);
    
    if (users.length === 0) {
      console.log(`User not found: ${Nama}`);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const user = users[0];
    
    // Compare hashed password
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      console.log(`Password mismatch for user: ${Nama}`);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(user);
    
    // Remove password before sending response
    delete user.Password;

    console.log(`Successful login for ${Nama}, role: ${user.role}`);

    // Return success response
    return res.status(200)
      .json({
        success: true,
        ...user,
        token
      });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500)
      .json({ 
        success: false,
        message: 'Internal server error' 
      });
  }
});



// Endpoint to check phone number availability - FINAL UPDATED VERSION
app.get("/user/check-phone", async (req, res) => {
  const { telp } = req.query;

  if (!telp) {
    return res.status(400).json({ 
      success: false,
      message: "Phone number is required" 
    });
  }

  try {
    const formattedTelp = formatPhoneNumber(telp);

    const [results] = await pool.query(
      `SELECT id, Nama FROM user 
       WHERE Telp IN (?, ?, ?)`,
      [
        formattedTelp,                        // e.g., 628123456789
        "0" + formattedTelp.substring(2),     // e.g., 08123456789
        "+" + formattedTelp                   // e.g., +628123456789
      ]
    );

    res.status(200).json({ 
      exists: results.length > 0,
      user: results.length > 0 ? results[0] : null
    });
  } catch (error) {
    console.error("Error checking phone number:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
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

// Enhanced Update User with proper transaction handling and related tables update
app.put("/user/:id", async (req, res) => {
  const { id } = req.params;
  let { NamaWarung, Nama, Telp, Alamat, Password, imageUrl } = req.body;
  let previousImageId = null;

  // Format Telp before use
  if (Telp) {
    Telp = formatPhoneNumber(Telp);
  }

  // Check if Telp is being updated and if it already exists
  if (Telp) {
    try {
      const [existingTelp] = await pool.query(
        "SELECT id FROM user WHERE Telp = ? AND id != ?",
        [Telp, id]
      );
      
      if (existingTelp.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: `Nomor telepon ${Telp} sudah terdaftar. Gunakan nomor lain.`
        });
      }
    } catch (error) {
      console.error("Error checking Telp:", error);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  }

  // Check if NamaWarung is being updated and if it already exists
  if (NamaWarung) {
    try {
      const [existing] = await pool.query(
        "SELECT id FROM user WHERE NamaWarung = ? AND id != ?",
        [NamaWarung, id]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: `Maaf nama warung "${NamaWarung}" sudah diambil, tolong pilih nama warung lain`
        });
      }
    } catch (error) {
      console.error("Error checking NamaWarung:", error);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  }

  // Get current user details
  try {
    const [userResults] = await pool.query("SELECT NamaWarung, imageUrl, Password FROM user WHERE id = ?", [id]);
    if (userResults.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    
    const user = userResults[0];
    const oldNamaWarung = user.NamaWarung;
    
    if (user.imageUrl) {
      const urlParts = user.imageUrl.split("/");
      previousImageId = urlParts[urlParts.length - 1];
    }

    // Start transaction
    await pool.query('START TRANSACTION');

    // Handle password update
    let hashedPassword = user.Password;
    if (Password) {
      hashedPassword = await bcrypt.hash(Password, saltRounds);
    }

    // Update user table
    const [updateResult] = await pool.query(
      "UPDATE user SET NamaWarung = ?, Nama = ?, Telp = ?, Alamat = ?, Password = ?, imageUrl = ? WHERE id = ?",
      [NamaWarung, Nama, Telp, Alamat, hashedPassword, imageUrl, id]
    );

    if (!updateResult.affectedRows) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // If NamaWarung changed, update related tables
    if (NamaWarung && oldNamaWarung && NamaWarung !== oldNamaWarung) {
      const tables = [
        { name: 'dataproduk', column: 'Pedagang', idColumn: 'user_id' },
        { name: 'cart_items', column: 'pedagang' },
        { name: 'order_items', column: 'pedagang' },
        { name: 'transactions_items', column: 'pedagang' },
        { name: 'transactions_history_items', column: 'pedagang' }
      ];

      for (const table of tables) {
        try {
          if (table.name === 'dataproduk') {
            await pool.query(
              `UPDATE ${table.name} SET ${table.column} = ?, ${table.idColumn} = ? WHERE ${table.column} = ?`,
              [NamaWarung, id, oldNamaWarung]
            );
          } else {
            await pool.query(
              `UPDATE ${table.name} SET ${table.column} = ? WHERE ${table.column} = ?`,
              [NamaWarung, oldNamaWarung]
            );
          }
        } catch (error) {
          console.error(`Error updating ${table.name}:`, error);
          await pool.query('ROLLBACK');
          return res.status(500).json({ 
            success: false,
            message: `Failed to update ${table.name} records`
          });
        }
      }
    }

    // Remove previous image if a new one was uploaded
    if (previousImageId && imageUrl && previousImageId !== imageUrl.split("/").pop()) {
      await pool.query("DELETE FROM userimages WHERE id = ?", [previousImageId]);
    }

    // Commit transaction
    await pool.query('COMMIT');
    res.status(200).json({ success: true, message: "User updated successfully." });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// server.js - Add this new route
app.put("/user/:id/reset-password", async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ 
      success: false,
      message: "New password is required." 
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const [updateResult] = await pool.query(
      "UPDATE user SET Password = ? WHERE id = ?",
      [hashedPassword, id]
    );

    if (!updateResult.affectedRows) {
      return res.status(404).json({ 
        success: false,
        message: "User not found." 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Password updated successfully." 
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error." 
    });
  }
});

// Create New User with Password Hashing
app.post("/user", async (req, res) => {
  let { NamaWarung, Nama, Telp, Alamat, Password, imageUrl } = req.body;

  if (!Nama || !Password) {
    return res.status(400).json({ message: "Name and password are required." });
  }

  // Format Telp before use
  if (Telp) {
    Telp = formatPhoneNumber(Telp);
  }

  // Check if Telp is provided and already exists
  if (Telp) {
    try {
      const [existingTelp] = await pool.query(
        "SELECT id FROM user WHERE Telp = ?",
        [Telp]
      );
      
      if (existingTelp.length > 0) {
        return res.status(400).json({ 
          message: `Nomor telepon ${Telp} sudah terdaftar. Gunakan nomor lain.`
        });
      }
    } catch (error) {
      console.error("Error checking Telp:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }

  // Check if NamaWarung already exists
  if (NamaWarung) {
    try {
      const [existing] = await pool.query(
        "SELECT id FROM user WHERE NamaWarung = ?",
        [NamaWarung]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ 
          message: `Maaf nama warung "${NamaWarung}" sudah diambil, tolong pilih nama warung lain`
        });
      }
    } catch (error) {
      console.error("Error checking NamaWarung:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }

  const userid = generateRandomId();

  try {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    const query = `
      INSERT INTO User (id, NamaWarung, Nama, Telp, Alamat, Password, role, imageUrl)
      VALUES (?, ?, ?, ?, ?, ?, 'user', ?)
    `;

    await pool.query(query, [
      userid,
      NamaWarung || null,
      Nama,
      Telp || null,
      Alamat || null,
      hashedPassword,
      imageUrl || null,
    ]);

    // Fetch the newly created user (excluding password)
    const [userResults] = await pool.query(
      "SELECT id, NamaWarung, Nama, Telp, Alamat, role, imageUrl FROM User WHERE id = ?", 
      [userid]
    );

    res.status(201).json(userResults[0]);
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

// Get all users (admin only)
app.get("/users/all", async (req, res) => {
  const query = "SELECT * FROM gbwt.user";
  try {
    const [results] = await pool.query(query);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get public users with NamaWarung (for marketplace)
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

// Get user by telephone number
app.get("/user/by-telp/:telp", async (req, res) => {
  const { telp } = req.params;
  try {
    const [results] = await pool.query(
      "SELECT * FROM user WHERE Telp = ?",
      [telp]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    res.status(200).json({ 
      success: true,
      user: results[0] 
    });
  } catch (error) {
    console.error("Error fetching user by telp:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
});

// Enhanced Delete User by ID with transaction and product validation
app.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    // Start transaction
    await pool.query('START TRANSACTION');

    // First get user details to check if they have products
    const [user] = await pool.query("SELECT NamaWarung FROM user WHERE id = ?", [id]);
    if (user.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: "User not found." });
    }

    const namaWarung = user[0].NamaWarung;

    // If user has a NamaWarung, check if they have products
    if (namaWarung) {
      const [products] = await pool.query("SELECT id FROM dataproduk WHERE Pedagang = ?", [namaWarung]);
      if (products.length > 0) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ 
          message: "Cannot delete user with existing products. Delete products first."
        });
      }
    }

    // Delete user images if any
    await pool.query("DELETE FROM userimages WHERE user_id = ?", [id]);

    // Finally delete the user
    await pool.query("DELETE FROM user WHERE id = ?", [id]);

    await pool.query('COMMIT');
    res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

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

// Guest Sign-in Endpoint
app.post('/guest-signin', async (req, res) => {
  const guestId = generateRandomId();
  const guestName = `guest_${guestId}`;
  const guestPassword = generateRandomId();

  try {
    // Hash the guest password
    const hashedPassword = await bcrypt.hash(guestPassword, saltRounds);

    const query = `
      INSERT INTO User (id, Nama, Password, role)
      VALUES (?, ?, ?, 'guest')`;

    await pool.query(query, [guestId, guestName, hashedPassword]);

    // Return guest user without password
    const [userResults] = await pool.query(
      "SELECT id, Nama, role FROM User WHERE id = ?", 
      [guestId]
    );
    
    const guestUser = userResults[0];
    
    // Generate token for guest
    const token = generateToken(guestUser);
    
    res.status(201).json({
      ...guestUser,
      token
    });
    
  } catch (err) {
    console.error("Error creating guest user:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Delete Guest User
app.delete('/guest/:id', async (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM gbwt.user WHERE id = ? AND role = 'guest'";
  try {
    const [results] = await pool.query(query, [id]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Guest user not found." });
    }
    res.status(200).json({ message: "Guest user deleted successfully." });
  } catch (err) {
    console.error("Error deleting guest user:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});



app.listen(port, () => {
  console.log(`User Service is running on http://localhost:${port}`);
});
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
// eslint-disable-next-line no-unused-vars
const os = require('os');

const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://192.168.100.8:8080',
    /\.local$/,
    /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'X-Device-Id'], // Added X-Device-Id here
  credentials: true,
  exposedHeaders: ['Authorization'],
  maxAge: 86400
};
app.use(cors(corsOptions));


app.options('*', cors(corsOptions));



const storage = multer.memoryStorage();
const upload = multer({ storage });

const saltRounds = 10;

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
// Add this function before app.listen()
function getNetworkIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  
  // Check for the most likely network interface
  for (const name of ['Ethernet', 'Wi-Fi', 'eth0', 'wlan0']) {
    if (interfaces[name]) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  
  // Fallback to first non-internal IPv4 address
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost'; // Fallback if no network IP found
}
async function deleteGuestUser(id) {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    
    // Only cleanup guest users
    const [user] = await conn.query(
      'SELECT * FROM user WHERE id = ? AND role = "guest" AND is_guest = 1',
      [id]
    );
    
    if (user.length === 0) return false;

    // Disassociate from orders (set user to null)
    await conn.query("UPDATE orders SET user = NULL WHERE user = ?", [id]);
    
    // Delete cart items and cart
    await conn.query(`
      DELETE cart_items 
      FROM cart_items 
      JOIN cart ON cart_items.cart_id = cart.id 
      WHERE cart.user = ?
    `, [id]);
    
    await conn.query("DELETE FROM cart WHERE user = ?", [id]);
    
    // Delete user images
    await conn.query("DELETE FROM userimages WHERE user_id = ?", [id]);
    
    // Delete guest user
    const [result] = await conn.query(`
      DELETE FROM user 
      WHERE id = ? 
        AND role = 'guest' 
        AND is_guest = 1
    `, [id]);
    
    await conn.query('COMMIT');
    return result.affectedRows > 0;
  } catch (error) {
    await conn.query('ROLLBACK');
    console.error("Guest cleanup error:", error);
    throw error;
  } finally {
    conn.release();
  }
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

// Add before all guest routes
app.param('id', (req, res, next, id) => {
  if (req.method === 'DELETE' || req.method === 'POST') {
    if (!/^[A-Za-z0-9]{8}$/.test(id)) {
      return res.status(400).json({ message: "Invalid guest ID format" });
    }
  }
  next();
});

// Add force cleanup endpoint
app.post('/guest/:id/cleanup', async (req, res) => {
  res.status(202).send('Cleanup initiated');
  try {
    await pool.query('CALL FullGuestCleanup(?)', [req.params.id]);
    console.log(`Successfully cleaned up guest ${req.params.id}`);
  } catch (error) {
    console.error(`Cleanup failed for ${req.params.id}:`, error);
  }
});

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

// Endpoint to check phone number availability
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

// Reset Password Endpoint
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
// In your image upload endpoint
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

    // Store only the relative path in the database
    const imageUrl = `/images/${imageId}`;
    await pool.query("UPDATE gbwt.user SET imageUrl = ? WHERE id = ?", [imageUrl, id]);

    res.status(200).json({ 
      message: "Image uploaded and user updated successfully.",
      imageUrl: imageUrl
    });
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

// Changed endpoint: General image upload
app.post("/images", upload.single("image"), async (req, res) => {
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

// Changed endpoint: Serve user image
app.get("/images/:id", async (req, res) => {
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

// Changed endpoint: Delete Image by ID
app.delete("/images/:id", async (req, res) => {
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
app.post('/user-service/guest-signin', async (req, res) => {
  const guestId = generateRandomId();
  const guestName = `guest_${guestId}`;
  const guestPassword = generateRandomId();

  try {
    const hashedPassword = await bcrypt.hash(guestPassword, saltRounds);

    const query = `
      INSERT INTO user (id, Nama, Password, role, is_guest, created_at)
      VALUES (?, ?, ?, 'guest', 1, NOW())`;

    await pool.query(query, [guestId, guestName, hashedPassword]);

    const [userResults] = await pool.query(
      "SELECT id, Nama, role FROM user WHERE id = ?", 
      [guestId]
    );

    if (userResults.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Guest user creation failed"
      });
    }

    const guestUser = userResults[0];
    const token = generateToken(guestUser);
    
    res.status(201).json({
      success: true,
      message: "Guest session created",
      token: token,
      userId: guestUser.id,
      role: guestUser.role,
      isGuest: true,
      user: {
        id: guestUser.id,
        role: guestUser.role,
        Nama: guestUser.Nama
      }
    });

  } catch (err) {
    console.error("Guest Sign-in Error:", {
      code: err.code,
      sqlMessage: err.sqlMessage,
      sql: err.sql
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.post('/user-service/guest/:id/cleanup', async (req, res) => {
  try {
    const guestId = req.params.id;
    if (!guestId || !/^[A-Za-z0-9]{8}$/.test(guestId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid guest ID format" 
      });
    }

    // Immediate response to client
    res.status(202).json({ 
      success: true,
      message: "Cleanup initiated" 
    });

    // Perform cleanup in background
    setTimeout(async () => {
      try {
        const deleted = await deleteGuestUser(guestId);
        if (deleted) {
          console.log(`Successfully cleaned up guest ${guestId}`);
        } else {
          console.log(`Guest ${guestId} not found for cleanup`);
        }
      } catch (error) {
        console.error(`Cleanup failed for ${guestId}:`, error);
      }
    }, 0);

  } catch (error) {
    console.error('Cleanup endpoint error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error during cleanup' 
    });
  }
});

// Delete Guest User
app.delete('/guest/:id', async (req, res) => {
  try {
    const deleted = await deleteGuestUser(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Guest not found." });
    res.json({ message: "Guest deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting guest." });
  }
});


app.post('/guest/:id/cleanup', async (req, res) => {
  try {
    const deleted = await deleteGuestUser(req.params.id);
    if (deleted) {
      // Prevent cached state in client after guest deletion
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Guest not found" });
    }
  } catch (error) {
    console.error(`Cleanup failed:`, error);
    res.status(500).json({ 
      success: false,
      message: 'Cleanup failed'
    });
  }
});

// Optimized scheduled cleanup
setInterval(async () => {
  try {
    const [oldGuests] = await pool.query(`
      SELECT id FROM user 
      WHERE role = 'guest' 
        AND is_guest = 1
        AND created_at < NOW() - INTERVAL 1 HOUR
    `);

    for (const guest of oldGuests) {
      try {
        await deleteGuestUser(guest.id);
      } catch (error) {
        console.error(`Scheduled cleanup failed:`, error);
      }
    }
  } catch (error) {
    console.error("Cleanup scheduler error:", error);
  }
}, 1800000); // 30 minutes

// Update the server listening configuration at the bottom
app.listen(port, '0.0.0.0', () => {
  const networkIP = getNetworkIP(); 
  console.log(`Server accessible at:
    - Local: http://localhost:${port}
    - Network: http://${networkIP}:${port}`);
});
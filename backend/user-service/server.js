require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const pool = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Sequelize } = require('sequelize');

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

const cors = require('cors');

const corsOptions = {
  origin: 'http://localhost:8080', // Match your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.get('/health', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1 AS test');
    if (result[0].test !== 1) throw new Error('Database connection test failed');

    res.status(200).json({ 
      status: 'healthy',
      service: 'user-service',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({ 
      status: 'unhealthy',
      service: 'user-service',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

function generateRandomId() {
  return Math.random().toString(36).substr(2, 8);
}

const router = express.Router();

// Updated login endpoint from patch
// Update the login endpoint to ensure consistent response format:
router.post('/login', async (req, res) => {
  const { Nama, Password } = req.body;

  try {
    // Input validation
    if (!Nama || !Password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
    }

    const [results] = await pool.query(
      "SELECT id, Nama, NamaWarung, role, imageUrl, Password FROM User WHERE Nama = ?", 
      [Nama]
    );

    if (results.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" // Generic message for security
      });
    }

    const user = results[0];
    const match = await bcrypt.compare(Password, user.Password);

    if (!match) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" // Generic message for security
      });
    }

    const payload = {
      id: user.id,
      Nama: user.Nama,
      NamaWarung: user.NamaWarung,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set CORS headers
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    return res.json({ 
      success: true,
      data: {
        token,
        user: payload,
        imageUrl: user.imageUrl 
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error"
    });
  }
});

// User CRUD Endpoints
router.post('/', async (req, res) => {
  const { NamaWarung, Nama, Telp, Alamat, Password, imageUrl } = req.body;

  if (!Nama || !Password) {
    return res.status(400).json({ 
      success: false,
      message: "Name and password are required" 
    });
  }

  try {
    // Check if NamaWarung exists
    if (NamaWarung) {
      const [existing] = await pool.query(
        "SELECT id FROM user WHERE NamaWarung = ?",
        [NamaWarung]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: `Warung name "${NamaWarung}" already exists`
        });
      }
    }

    const userId = generateRandomId();
    const query = `
      INSERT INTO User (id, NamaWarung, Nama, Telp, Alamat, Password, role, imageUrl)
      VALUES (?, ?, ?, ?, ?, ?, 'user', ?)`;

    await pool.query(query, [
      userId,
      NamaWarung || null,
      Nama,
      Telp || null,
      Alamat || null,
      Password,
      imageUrl || null
    ]);

    const [user] = await pool.query("SELECT * FROM User WHERE id = ?", [userId]);
    
    res.status(201).json({
      success: true,
      data: user[0]
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [user] = await pool.query(
      "SELECT id, Nama, NamaWarung, Telp, Alamat, role, imageUrl FROM user WHERE id = ?",
      [req.params.id]
    );

    if (user.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: user[0]
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { NamaWarung, Nama, Telp, Alamat, Password, imageUrl } = req.body;

  try {
    // Check if NamaWarung exists
    if (NamaWarung) {
      const [existing] = await pool.query(
        "SELECT id FROM user WHERE NamaWarung = ? AND id != ?",
        [NamaWarung, id]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: `Warung name "${NamaWarung}" already exists`
        });
      }
    }

    // Get current user data
    const [currentUser] = await pool.query(
      "SELECT NamaWarung, imageUrl FROM user WHERE id = ?",
      [id]
    );

    if (currentUser.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    const oldNamaWarung = currentUser[0].NamaWarung;
    const oldImageUrl = currentUser[0].imageUrl;

    // Start transaction
    await pool.query('START TRANSACTION');

    // Update user
    const [result] = await pool.query(
      `UPDATE user SET 
        NamaWarung = ?, 
        Nama = ?, 
        Telp = ?, 
        Alamat = ?, 
        Password = ?, 
        imageUrl = ? 
      WHERE id = ?`,
      [
        NamaWarung || null,
        Nama,
        Telp || null,
        Alamat || null,
        Password,
        imageUrl || null,
        id
      ]
    );

    if (result.affectedRows === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Update related tables if warung name changed
    if (NamaWarung && oldNamaWarung && NamaWarung !== oldNamaWarung) {
      const tables = [
        'dataproduk', 
        'cart_items', 
        'order_items', 
        'transactions_items',
        'transactions_history_items'
      ];

      for (const table of tables) {
        try {
          await pool.query(
            `UPDATE ${table} SET Pedagang = ? WHERE Pedagang = ?`,
            [NamaWarung, oldNamaWarung]
          );
        } catch (error) {
          await pool.query('ROLLBACK');
          console.error(`Error updating ${table}:`, error);
          return res.status(500).json({ 
            success: false,
            message: "Internal server error" 
          });
        }
      }
    }

    // Delete old image if changed
    if (oldImageUrl && imageUrl && oldImageUrl !== imageUrl) {
      const oldImageId = oldImageUrl.split('/').pop();
      await pool.query("DELETE FROM userimages WHERE id = ?", [oldImageId]);
    }

    await pool.query('COMMIT');
    
    // Get updated user
    const [updatedUser] = await pool.query(
      "SELECT id, Nama, NamaWarung, Telp, Alamat, role, imageUrl FROM user WHERE id = ?",
      [id]
    );

    res.status(200).json({
      success: true,
      data: updatedUser[0]
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error("Error updating user:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
});

// Image handling
router.post('/:id/image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      message: "No image provided" 
    });
  }

  const { id } = req.params;
  const { originalname, mimetype, buffer } = req.file;
  const imageId = generateRandomId();

  try {
    // Check if user exists
    const [user] = await pool.query("SELECT id FROM user WHERE id = ?", [id]);
    if (user.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Save image
    await pool.query(
      "INSERT INTO userimages (id, filename, data, mimetype) VALUES (?, ?, ?, ?)",
      [imageId, originalname, buffer, mimetype]
    );

    // Update user with image URL
    const imageUrl = `${process.env.SERVICE_URL}/images/${imageId}`;
    await pool.query("UPDATE user SET imageUrl = ? WHERE id = ?", [imageUrl, id]);

    res.status(200).json({
      success: true,
      data: { imageUrl }
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
});

router.get('/images/:id', async (req, res) => {
  try {
    const [image] = await pool.query(
      "SELECT mimetype, data FROM userimages WHERE id = ?",
      [req.params.id]
    );

    if (image.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Image not found" 
      });
    }

    res.set('Content-Type', image[0].mimetype);
    res.send(image[0].data);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
});

// Mount router with service prefix
app.use('/user-service', router);

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error' 
  });
});
// Mount the router at root path
app.use('/', router);


app.listen(port, () => {
  console.log(`User service running on port ${port}`);
  console.log(`Service endpoint: http://localhost:${port}/user-service`);
});
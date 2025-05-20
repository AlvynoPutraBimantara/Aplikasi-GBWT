const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, UserImages } = require('./user.model');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:8080',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, nama: user.Nama },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Helper function to generate random ID
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


app.post('/login', async (req, res) => {
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
    const user = await User.findOne({ where: { Nama } });

    if (!user) {
      console.log(`User not found: ${Nama}`);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      console.log(`Password mismatch for user: ${Nama}`);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken(user);
    const userData = user.get({ plain: true });
    delete userData.Password;

    console.log(`Successful login for ${Nama}, role: ${user.role}`);

    // Explicit response with content type
    return res.status(200)
      .set('Content-Type', 'application/json')
      .json({
        success: true,
        ...userData,
        token
      });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500)
      .set('Content-Type', 'application/json')
      .json({ 
        success: false,
        message: 'Internal server error' 
      });
  }
});



// Guest Sign-in Endpoint
app.post('/guest-signin', async (req, res) => {
  const guestId = generateRandomId();
  const guestName = `guest_${guestId}`;
  const guestPassword = generateRandomId();

  try {
    const hashedPassword = await bcrypt.hash(guestPassword, 10);
    const guestUser = await User.create({
      id: guestId,
      Nama: guestName,
      Password: hashedPassword,
      role: 'guest'
    });

    const token = generateToken(guestUser);
    const userData = guestUser.get({ plain: true });
    delete userData.Password;

    res.status(201).json({
      ...userData,
      token
    });
  } catch (err) {
    console.error('Guest sign-in error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/', async (req, res) => {
  const { Nama, Telp, Alamat, Password } = req.body;

  // 1. Validasi input
  if (!Nama || !Telp || !Alamat || !Password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // 2. Generate ID unik untuk user baru
    const id = generateRandomId();

    // 3. Enkripsi password menggunakan bcrypt
    const hashedPassword = await bcrypt.hash(Password, 10);

    // 4. Simpan user baru ke database
    const newUser = await User.create({
      id,
      Nama,
      Telp,
      Alamat,
      Password: hashedPassword,
      role: 'user'  // role default diset sebagai 'user'
    });

    // 5. Generate token autentikasi (misalnya JWT)
    const token = generateToken(newUser);

    // 6. Hapus password dari data yang akan dikirim ke client
    const userData = newUser.get({ plain: true });
    delete userData.Password;

    // 7. Kirim response sukses dengan data user dan token
    res.status(201).json({
      ...userData,
      token
    });
  } catch (err) {
    // 8. Tangani error dan kirim response error
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// User CRUD Endpoints
app.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['Password'] },
      include: [{
        model: UserImages,
        as: 'images',
        attributes: ['id', 'filename', 'mimetype', 'upload_date']
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/:id', async (req, res) => {
  const { NamaWarung, Nama, Telp, Alamat, Password } = req.body;
  
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if NamaWarung is being updated and if it already exists
    if (NamaWarung && NamaWarung !== user.NamaWarung) {
      const existing = await User.findOne({ where: { NamaWarung } });
      if (existing && existing.id !== user.id) {
        return res.status(400).json({ 
          message: `Nama warung "${NamaWarung}" sudah diambil`
        });
      }
    }

    // Update user
    const updates = {};
    if (NamaWarung) updates.NamaWarung = NamaWarung;
    if (Nama) updates.Nama = Nama;
    if (Telp) updates.Telp = Telp;
    if (Alamat) updates.Alamat = Alamat;
    if (Password) {
      updates.Password = await bcrypt.hash(Password, 10);
    }

    await user.update(updates);
    
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ['Password'] }
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Image Upload Endpoint
app.post('/:id/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image provided' });
  }

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete previous image if exists
    if (user.imageUrl) {
      const imageId = user.imageUrl.split('/').pop();
      await UserImages.destroy({ where: { id: imageId } });
    }

    // Save new image
    const imageId = generateRandomId();
    await UserImages.create({
      id: imageId,
      userId: user.id,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      data: req.file.buffer
    });

    // Update user with new image URL
    const imageUrl = `${process.env.BASE_URL || 'http://localhost:3001'}/images/${imageId}`;
    await user.update({ imageUrl });

    res.status(200).json({ imageUrl });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Serve images
app.get('/images/:id', async (req, res) => {
  try {
    const image = await UserImages.findByPk(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.set('Content-Type', image.mimetype);
    res.send(image.data);
  } catch (err) {
    console.error('Image serve error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add this to user-service/server.js

// Get all users (admin only)
// In user-service/server.js, update the GET / endpoint
app.get('/', async (req, res) => {
  try {
    console.log("All incoming headers:", req.headers); // Debug all headers
    
    // Verify admin role from headers (case-insensitive check)
    const userRole = req.headers['x-user-role'] || req.headers['X-User-Role'];
    console.log("Extracted role:", userRole); // Debug extracted role
    
    if (userRole !== 'admin') {
      return res.status(403).json({ 
        message: 'Forbidden: Admin access required',
        receivedRole: userRole,
        allHeaders: req.headers // Include for debugging
      });
    }

    const users = await User.findAll({
      attributes: { exclude: ['Password'] },
      order: [['Nama', 'ASC']]
    });
    
    res.status(200).json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user (admin only)
app.delete('/:id', async (req, res) => {
  try {
    // Verify admin role from headers
    const userRole = req.headers['x-user-role'];
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin accounts
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin account' });
    }

    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('User service error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`User service running on http://localhost:${port}`);
});
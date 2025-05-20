const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:8080',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Authentication middleware
const authenticate = (req, res, next) => {
  if (req.path === '/user/login' || req.path === '/user/guest-signin') {
    return next();
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

app.use(authenticate);

const services = {
  user: {
    target: 'http://localhost:3001',
    pathRewrite: { '^/user': '' }
  },
  products: {
    target: 'http://localhost:3002',
    pathRewrite: { '^/products': '' }
  },
  orders: {
    target: 'http://localhost:3003',
    pathRewrite: { '^/orders': '' }
  },
  cart: {
    target: 'http://localhost:3004',
    pathRewrite: { '^/cart': '' }
  },
  transactions: {
    target: 'http://localhost:3005',
    pathRewrite: { '^/transactions': '' }
  },
  category: {
    target: 'http://localhost:3006',
    pathRewrite: { '^/category': '' }
  }
};

// Modify the proxy configuration
Object.entries(services).forEach(([route, config]) => {
  app.use(`/${route}`, createProxyMiddleware({
    ...config,
    changeOrigin: true,
    onProxyReq: (proxyReq, req) => {
      // Ensure Content-Type is set if not present
      if (!req.headers['content-type'] && req.method === 'POST') {
        proxyReq.setHeader('Content-Type', 'application/json');
      }
      
      // Forward all headers
      Object.keys(req.headers).forEach(key => {
        proxyReq.setHeader(key, req.headers[key]);
      });
      
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.id);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Ensure responses always have content
      if (proxyRes.statusCode === 204) {
        console.warn(`Converting 204 response to 200 for ${req.method} ${req.url}`);
        proxyRes.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          success: true,
          message: 'Request processed successfully' 
        }));
      }
    }
  }));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Centralized error handling
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`API Gateway running on http://localhost:${port}`);
});

require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;

// Enhanced rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});

// Middleware - Removed duplicate express.json() as per patch
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Explicitly handle OPTIONS requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', corsOptions.origin);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).send();
});

app.use(apiLimiter);

// Service configurations
const services = {
  user: {
    target: 'http://localhost:3001',
    pathRewrite: { '^/user-service': '' },
    changeOrigin: true
  },
  produk: {
    target: 'http://localhost:3002',
    pathRewrite: { '^/produk-service': '' },
    changeOrigin: true
  },
  order: {
    target: 'http://localhost:3003',
    pathRewrite: { '^/order-service': '' },
    changeOrigin: true
  },
  cart: {
    target: 'http://localhost:3004',
    pathRewrite: { '^/cart-service': '' },
    changeOrigin: true
  },
  transaction: {
    target: 'http://localhost:3005',
    pathRewrite: { '^/transaction-service': '' },
    changeOrigin: true
  },
  category: {
    target: 'http://localhost:3006',
    pathRewrite: { '^/category-service': '' },
    changeOrigin: true
  }
};

// JWT Authentication Middleware - Updated to properly skip login
const authenticate = async (req, res, next) => {
  // Skip OPTIONS requests and public routes
  if (req.method === 'OPTIONS') {
    return next();
  }

  const publicRoutes = [
    '/user-service/login',
    '/user-service/register',
    '/health',
    '/status'
  ];

  // Normalize path by removing trailing slash and query params
  const normalizedPath = req.path.replace(/\/$/, '').split('?')[0];
  
  if (publicRoutes.some(route => normalizedPath === route)) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      message: 'Authorization token required' 
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token' 
    });
  }
};

app.use(authenticate);

// Updated proxy middleware configuration from patch
// In api-gateway/server.js, update the createServiceProxy function:
const createServiceProxy = (serviceName) => {
  return createProxyMiddleware({
    ...services[serviceName],
    selfHandleResponse: false,
    proxyTimeout: 30000,
    timeout: 30000,
    onProxyReq: (proxyReq, req) => {
      console.log(`Proxying to ${serviceName}: ${req.method} ${req.path}`);
      proxyReq.setHeader('X-Forwarded-For', req.ip);
      if (req.headers.cookie) {
        proxyReq.setHeader('cookie', req.headers.cookie);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || corsOptions.origin;
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      proxyRes.headers['Access-Control-Expose-Headers'] = 'Authorization';
    },
    onError: (err, req, res) => {
      console.error(`[Gateway Error] ${serviceName}:`, err.message);
      res.header('Access-Control-Allow-Origin', req.headers.origin || corsOptions.origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.status(502).json({
        success: false,
        message: `${serviceName} service unavailable`,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  });
};


// Mount services
Object.entries(services).forEach(([name, config]) => {
  app.use(`/${name}-service`, createServiceProxy(name));
  console.log(`Mounted ${name}-service at /${name}-service -> ${config.target}`);
});

// Health endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'operational',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
});

app.get('/status', async (req, res) => {
  const status = {
    gateway: 'healthy',
    services: {},
    timestamp: new Date().toISOString()
  };

  await Promise.all(Object.keys(services).map(async (name) => {
    try {
      const response = await fetch(`${services[name].target}/health`);
      status.services[name] = response.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      status.services[name] = 'unavailable';
    }
  }));

  const allHealthy = Object.values(status.services).every(s => s === 'healthy');
  res.status(allHealthy ? 200 : 503).json({
    success: allHealthy,
    data: status
  });
});

// API Documentation
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'GBWT API Gateway',
      services: Object.keys(services).map(name => ({
        name: `${name}-service`,
        path: `/${name}-service`,
        health: `/${name}-service/health`
      })),
      documentation: 'https://docs.gbwt.example.com'
    }
  });
});

// Error Handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error('[Gateway Error]', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(port, () => {
  console.log(`\nAPI Gateway running on port ${port}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('\nMounted Services:');
  Object.entries(services).forEach(([name, config]) => {
    console.log(`- ${name}-service: ${config.target}`);
  });
  console.log('\nMonitoring:');
  console.log(`- Health: http://localhost:${port}/health`);
  console.log(`- Status: http://localhost:${port}/status\n`);
});
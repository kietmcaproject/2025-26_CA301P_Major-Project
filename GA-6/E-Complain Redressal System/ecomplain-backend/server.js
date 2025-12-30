const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./src/config/database');

// Import Redis connection
const { connectRedis, closeRedis } = require('./src/config/redis');

// Import routes
const authRoutes = require('./src/routes/auth');
const complaintRoutes = require('./src/routes/complaints');
const dashboardRoutes = require('./src/routes/dashboard');
const adminRoutes = require('./src/routes/admin');
const superAdminRoutes = require('./src/routes/superAdmin');
const profileRoutes = require('./src/routes/profile');

// Import middleware
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// Connect to database
connectDB();

// Connect to Redis
connectRedis();

const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware with performance optimizations
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  // Disable some headers that can slow down responses
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:5173',
      'http://localhost:5174'
    ];

    // Allow custom domains from environment variable (comma-separated)
    const customDomains = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(domain => domain.trim())
      : [];

    if (allowedOrigins.indexOf(origin) !== -1 || customDomains.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing middleware - optimized settings
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for potential use
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
  parameterLimit: 100 // Limit number of parameters
}));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Compression middleware with optimized settings
app.use(compression({
  level: 6, // Compression level (1-9, 6 is a good balance)
  filter: (req, res) => {
    // Don't compress responses if this request header is present
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter function
    return compression.filter(req, res);
  }
}));

// Import cache middleware
const { cacheMiddleware } = require('./src/middleware/cache');

// Apply caching to frequently accessed endpoints
// Cache dashboard stats for 2 minutes
app.use('/api/dashboard', cacheMiddleware(2 * 60 * 1000));
// Cache admin lists for 5 minutes
app.use('/api/admin/additional-hods', cacheMiddleware(5 * 60 * 1000));
app.use('/api/admin/deans', cacheMiddleware(5 * 60 * 1000));
// Cache super-admin overview for 1 minute (frequently updated)
app.use('/api/super-admin/overview', cacheMiddleware(1 * 60 * 1000));
// Cache super-admin analytics for 5 minutes (heavy aggregations)
app.use('/api/super-admin/analytics', cacheMiddleware(5 * 60 * 1000));

// Logging middleware removed to suppress console logs



// API routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/profile', profileRoutes);

// Serve static files (if any) with optimized settings
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1y', // Cache static files for 1 year
  etag: true, // Enable ETag for better caching
  lastModified: true,
  setHeaders: (res, path) => {
    // Set cache headers for images
    if (path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-Complaint System API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await closeRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await closeRedis();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`
🌐 API URL: http://localhost:${PORT}
🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
  `);
});

// Export app for testing
module.exports = app;
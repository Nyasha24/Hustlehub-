require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const https = require('https');
const fs = require('fs');
const path = require('path');

const connectDB = require('./config/db');
const { setupSwagger } = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const gigRoutes = require('./routes/gigRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const errorHandler = require('./middleware/errorHandler');
const { sanitizeInput } = require('./middleware/sanitizeInput');

const app = express();

const PORT = process.env.PORT || 4000;
const USE_HTTPS = process.env.USE_HTTPS === 'true';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Security hardening: hide server technology signature & trust Railway reverse proxy
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Security Headers & Content Security Policy via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://accounts.google.com', 'https://apis.google.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:', 'https://lh3.googleusercontent.com'],
        frameSrc: ["'self'", 'https://accounts.google.com', 'https://maps.google.com', 'https://www.google.com'],
        connectSrc: ["'self'", 'https://accounts.google.com', CLIENT_ORIGIN, 'https://hustlehub-api-production.up.railway.app'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"]
      }
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginEmbedderPolicy: false
  })
);

// Controlled Cross-Origin Resource Sharing
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Request body parser with payload size limit
app.use(express.json({ limit: '10kb' }));

// Input sanitization middleware for XSS and NoSQL injection defense
app.use(sanitizeInput);

// Interactive Swagger OpenAPI 3.0 Documentation
setupSwagger(app);

// Mounted Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    protocol: USE_HTTPS ? 'HTTPS' : 'HTTP',
    timestamp: new Date().toISOString()
  });
});

// Serve Static Frontend Assets in Production
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/api-docs') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(publicDir, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.status(200).json({
      app: process.env.APP_NAME || 'HustleHub+ API',
      message: 'API is running securely',
      documentation: '/api-docs'
    });
  });
}

// 404 Route Not Found Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Centralized Secure Error Handler
app.use(errorHandler);

// Start Server (Connect DB if MONGO_URI is set and not running in test suite)
if (require.main === module) {
  if (process.env.MONGO_URI) {
    connectDB();
  }

  if (USE_HTTPS) {
    const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, 'certs', 'localhost-key.pem');
    const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, 'certs', 'localhost-cert.pem');

    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };

    https.createServer(httpsOptions, app).listen(PORT, () => {
      console.log(`HTTPS server running on port ${PORT}`);
    });
  } else {
    app.listen(PORT, () => {
      console.log(`HTTP server running on port ${PORT}`);
    });
  }
}

module.exports = app;
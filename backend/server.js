const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const emailRoutes = require('./routes/emailRoutes');
const { logger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/email', emailRoutes);

// Email tracking endpoints
app.get('/api/email/track/open/:emailId', (req, res) => {
  const { emailId } = req.params;
  
  // Log email open event
  logger.info('Email opened', { emailId, ip: req.ip });
  
  // Update analytics in database
  // This would be implemented with your Supabase client
  
  // Return 1x1 transparent pixel
  const pixel = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
  );
  
  res.set({
    'Content-Type': 'image/png',
    'Content-Length': pixel.length,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  res.send(pixel);
});

app.get('/api/email/track/click/:emailId/:linkId', (req, res) => {
  const { emailId, linkId } = req.params;
  const { url } = req.query;
  
  // Log email click event
  logger.info('Email link clicked', { emailId, linkId, url, ip: req.ip });
  
  // Update analytics in database
  // This would be implemented with your Supabase client
  
  // Redirect to original URL
  if (url) {
    res.redirect(decodeURIComponent(url));
  } else {
    res.status(400).json({ error: 'Missing URL parameter' });
  }
});

// Unsubscribe endpoint
app.get('/unsubscribe', (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).json({ error: 'Missing unsubscribe token' });
  }
  
  try {
    // Decode token and handle unsubscribe
    const email = Buffer.from(token, 'base64').toString();
    
    // Update user preferences in database
    logger.info('Unsubscribe request', { email, ip: req.ip });
    
    res.json({ 
      message: 'Successfully unsubscribed',
      email: email 
    });
  } catch (error) {
    logger.error('Unsubscribe error', error);
    res.status(400).json({ error: 'Invalid unsubscribe token' });
  }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Email API available at http://localhost:${PORT}/api/email`);
});

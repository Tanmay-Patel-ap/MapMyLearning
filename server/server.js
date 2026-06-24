const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './.env' });
console.log('[Server] Environment variables loaded');

const app = express();

// Body parser
app.use(express.json());
console.log('[Server] Body parser middleware initialized');

// Cookie parser
app.use(cookieParser());
console.log('[Server] Cookie parser middleware initialized');

// Enable CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
};
app.use(cors(corsOptions));
console.log('[Server] CORS middleware initialized');

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('[Health] Health check requested');
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Static folder
app.use(express.static(path.join(__dirname, '../client')));
console.log('[Server] Static files served from client folder');

const PORT = process.env.PORT || 5000;

// Connect to database FIRST, THEN load routes and start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Now load routes AFTER DB is connected
    const auth = require('./routes/authRoutes');
    const roadmaps = require('./routes/roadmapRoutes');
    
    // Mount routers
    app.use('/api/auth', auth);
    app.use('/api/roadmap', roadmaps);
    console.log('[Server] Routes mounted');
    
  } catch (error) {
    console.warn('[Server] Database connection failed, roadmap features still work...');
    // Still load basic routes even without DB
    const roadmaps = require('./routes/roadmapRoutes');
    app.use('/api/roadmap', roadmaps);
  }
  
  const server = app.listen(PORT, () => {
    console.log(`[Server] MapMyLearning running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`[Error] Unhandled rejection: ${err.message}`);
  console.error('[Error] Stack:', err.stack);
  // Don't close server for minor issues
});

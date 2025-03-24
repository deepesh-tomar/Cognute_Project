const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Init express
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));

// API 404 handler - return JSON for API requests that don't match any route
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    message: 'API endpoint not found',
    endpoint: req.originalUrl
  });
});

// Serve frontend for any other route
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Ensure we always respond with JSON for API routes
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(500).json({ 
      message: 'Server Error', 
      error: process.env.NODE_ENV === 'production' ? null : err.message 
    });
  }
  
  // For non-API routes, fall back to HTML
  next(err);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
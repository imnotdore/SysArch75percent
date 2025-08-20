require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // For dev: allow all origins
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Barangay Management System Backend');
});

module.exports = app;

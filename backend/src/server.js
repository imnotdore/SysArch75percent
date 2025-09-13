// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const app = express();
const scheduleRoutes = require('./routes/scheduleRoutes');
// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', scheduleRoutes);



// Test route
app.get('/', (req, res) => res.send('Barangay Management System Backend is running'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

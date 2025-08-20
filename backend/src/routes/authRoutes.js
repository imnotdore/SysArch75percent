const express = require('express');
const {
  loginAdmin,
  registerAdmin,
  loginStaff,
  registerStaff,
  loginResident,
  registerResident,
} = require('../controllers/authController');

const router = express.Router();

// Admin routes
router.post('/admin/login', loginAdmin);
router.post('/admin/register', registerAdmin);

// Staff routes
router.post('/staff/register', registerStaff);
router.post('/staff/login', loginStaff);

// Resident routes
router.post('/resident/register', registerResident);
router.post('/resident/login', loginResident);

module.exports = router;

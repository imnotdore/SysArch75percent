const express = require('express');
const {
  loginAdmin,
  registerAdmin,
  loginStaff,
  registerStaff,
  loginResident,
  registerResident,
  authMiddleware,
  getResidentProfile
} = require('../controllers/authController');

const router = express.Router();

// Admin
router.post('/admin/login', loginAdmin);
router.post('/admin/register', registerAdmin);

// Staff
router.post('/staff/login', loginStaff);
router.post('/staff/register', registerStaff);

// Resident
router.post('/resident/login', loginResident);
router.post('/resident/register', registerResident);

// Protected route for resident profile
router.get("/resident/me", authMiddleware, getResidentProfile);

module.exports = router;

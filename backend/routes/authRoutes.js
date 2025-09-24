// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Resident
router.post("/resident/register", authController.registerResident);
router.post("/resident/login", authController.loginResident);

// Staff
router.post("/staff/register", authController.registerStaff);
router.post("/staff/login", authController.loginStaff);

// Admin
router.post("/admin/register", authController.registerAdmin);
router.post("/admin/login", authController.loginAdmin);

module.exports = router;

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Resident
router.post("/resident/login", authController.loginResident);
router.post("/resident/register", authController.registerResident);

// Staff
router.post("/staff/login", authController.loginStaff);
router.post("/staff/register", authController.registerStaff);

// Admin
router.post("/admin/login", authController.loginAdmin);
router.post("/admin/register", authController.registerAdmin);

module.exports = router;

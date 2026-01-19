// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");

// Existing routes
router.get("/staff/pending", authController.getPendingStaff);
router.get("/staff/approved", authController.getApprovedStaff);
router.post("/staff-requests/:id/accept", authController.approveStaff);
router.post("/staff-requests/:id/reject", authController.rejectStaff);

// Add these new routes - FIX THE PATH ISSUE
router.get("/page-limits", adminController.getPageLimits);
router.put("/page-limits", adminController.updatePageLimit);

module.exports = router;
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Staff requests
router.get("/staff/pending", authController.getPendingStaff);
router.get("/staff/approved", authController.getApprovedStaff);

// Approve/reject staff
router.post("/staff-requests/:id/accept", authController.approveStaff);
router.post("/staff-requests/:id/reject", authController.rejectStaff);

module.exports = router;

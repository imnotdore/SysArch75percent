const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createRequest,
  getUserRequests,
  cancelRequest,
  getAllRequests,
  updateRequestStatus,
} = require("../controllers/computerBorrowController");

// ---------------- Resident ----------------
router.post("/", authMiddleware(["resident"]), createRequest);
router.get("/my-requests", authMiddleware(["resident"]), getUserRequests); // SPECIFIC route para sa my-requests
router.get("/", authMiddleware(["resident"]), getUserRequests); // Keep for backward compatibility
router.put("/:id/cancel", authMiddleware(["resident"]), cancelRequest); // Use PUT for cancellation with reason

// ---------------- Staff/Admin ----------------
router.get("/all", authMiddleware(["staff", "admin"]), getAllRequests);
router.put("/:id/status", authMiddleware(["staff", "admin"]), updateRequestStatus);

module.exports = router;
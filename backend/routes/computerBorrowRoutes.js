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
router.get("/", authMiddleware(["resident"]), getUserRequests);
router.delete("/:id", authMiddleware(["resident"]), cancelRequest);

// ---------------- Staff/Admin ----------------
router.get("/all", authMiddleware(["staff", "admin"]), getAllRequests);
router.put("/:id/status", authMiddleware(["staff", "admin"]), updateRequestStatus);

module.exports = router;

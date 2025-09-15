const express = require("express");
const router = express.Router();
const {
  createSchedule,
  getUserSchedules,
  getAllSchedules,
  updateScheduleStatus,
} = require("../controllers/scheduleController");

const authMiddleware = require("../middlewares/authMiddleware");

// Residents (lahat ng logged-in users pwede)
router.post("/", authMiddleware(), createSchedule);
router.get("/:user_id", authMiddleware(), getUserSchedules);

// Admin/Staff only (may roles check)
router.get("/", authMiddleware(["admin", "staff"]), getAllSchedules);
router.put("/:id/status", authMiddleware(["admin", "staff"]), updateScheduleStatus);

module.exports = router;

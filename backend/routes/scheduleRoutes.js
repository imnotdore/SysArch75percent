// backend/routes/scheduleRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createSchedule,
  getAllSchedules,
  getUserSchedules,
  updateScheduleStatus,
  deleteSchedule,
} = require("../controllers/scheduleController");

// Resident routes
router.post("/", authMiddleware(["resident"]), createSchedule); // create schedule
router.get("/", authMiddleware(["resident"]), getUserSchedules); // get logged-in resident schedules
router.delete("/:id", authMiddleware(["resident"]), deleteSchedule); // cancel schedule

// Admin routes
router.get("/all", authMiddleware(["admin"]), getAllSchedules); // admin: get all schedules
router.put("/:id/status", authMiddleware(["admin"]), updateScheduleStatus); // admin: approve/reject

module.exports = router;

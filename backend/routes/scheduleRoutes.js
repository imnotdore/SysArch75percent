const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createSchedule,
  getUserSchedules,
  deleteSchedule,
  getAllSchedules,
  updateScheduleStatus,
  getPendingSchedules,
  staffCancelSchedule,
} = require("../controllers/scheduleController");

// ✅ IDAGDAG ITO - Import from staffController
const { getAcceptedSchedules } = require("../controllers/staffController");

// ------------------- Resident -------------------
// Create a new schedule
router.post("/", authMiddleware(["resident"]), createSchedule);
// Get schedules of logged-in resident
router.get("/", authMiddleware(["resident"]), getUserSchedules);
// Cancel a pending schedule
router.delete("/:id", authMiddleware(["resident"]), deleteSchedule);

// ------------------- Admin -------------------
// Get all schedules
router.get("/all", authMiddleware(["admin"]), getAllSchedules);
// Update schedule status (approve/reject/cancel)
router.put("/:id/status", authMiddleware(["admin"]), updateScheduleStatus);

// ------------------- Staff -------------------
// Get all pending schedules (inbox)
router.get("/pending", authMiddleware(["staff"]), getPendingSchedules);

// ✅ FIXED - Make sure getAcceptedSchedules is properly imported
router.get('/accepted-schedules', authMiddleware(["staff"]), getAcceptedSchedules);

// Get pending schedules of a specific resident
router.get("/resident/:id", authMiddleware(["staff"]), async (req, res) => {
  const residentId = req.params.id;
  try {
    const [rows] = await db.query(
      `SELECT id, item, quantity, date_from, date_to, time_from, time_to, status, reason
       FROM schedules
       WHERE user_id = ? AND status = 'Pending'
       ORDER BY date_from DESC`,
      [residentId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching resident schedules:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// Staff/Admin cancel schedule (soft cancel with reason)
router.put("/:id/cancel", authMiddleware(["staff", "admin"]), staffCancelSchedule);

module.exports = router;
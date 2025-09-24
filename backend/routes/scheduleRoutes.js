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
  getPendingSchedules, 
} = require("../controllers/scheduleController");

// Resident routes
router.post("/", authMiddleware(["resident"]), createSchedule); // create schedule
router.get("/", authMiddleware(["resident"]), getUserSchedules); // get logged-in resident schedules
router.delete("/:id", authMiddleware(["resident"]), deleteSchedule); // cancel schedule

// Admin routes
router.get("/all", authMiddleware(["admin"]), getAllSchedules); // admin: get all schedules
router.put("/:id/status", authMiddleware(["admin"]), updateScheduleStatus); // admin: approve/reject
// Staff route to get pending schedules
router.get("/pending", authMiddleware(["staff"]), getPendingSchedules);
// GET pending schedules of a specific resident (for staff)
router.get("/schedules/resident/:id", authMiddleware(["staff"]), async (req, res) => {
  const residentId = req.params.id;
  try {
    const [rows] = await db.query(
      `SELECT s.id, s.item, s.quantity, s.date_from, s.date_to, s.time_from, s.time_to, s.status
       FROM schedules s
       WHERE s.user_id = ? AND s.status = 'Pending'
       ORDER BY s.date_from DESC`,
      [residentId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching resident schedules:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});



module.exports = router;

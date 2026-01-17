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
// Add this route for residents to get their limits
router.get("/limits", async (req, res) => {
  try {
    const [limits] = await db.query(`
      SELECT type, value 
      FROM upload_limits 
      WHERE staff_id IS NULL AND type IN ('resident', 'global')
    `);
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Get resident's usage for today
    const [usage] = await db.query(
      `SELECT COALESCE(SUM(page_count), 0) as total_pages
       FROM resident_requests
       WHERE resident_id = ? 
         AND date_needed = ? 
         AND status IN ('pending', 'approved')`,
      [req.user.id, today]
    );
    
    res.json({ 
      success: true, 
      data: {
        limits,
        usage: usage[0].total_pages
      }
    });
  } catch (err) {
    console.error("Error fetching limits:", err);
    res.status(500).json({ error: "Failed to fetch limits" });
  }
});
module.exports = router;

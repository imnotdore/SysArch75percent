const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");

// Get user notifications
router.get("/user/notifications", authMiddleware(["resident"]), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [notifications] = await db.query(`
      SELECT 
        n.id,
        n.type,
        n.title,
        n.message,
        n.read,
        n.created_at,
        n.schedule_id,
        n.item_name,
        s.status as schedule_status,
        s.date_to as due_date,
        DATEDIFF(s.date_to, CURDATE()) as days_until_due
      FROM notifications n
      LEFT JOIN schedules s ON n.schedule_id = s.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `, [userId]);
    
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark notification as read
router.put("/:id/read", authMiddleware(["resident"]), async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const [result] = await db.query(
      "UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    res.json({ success: true, message: "Notification marked as read" });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Mark all notifications as read
router.put("/read-all", authMiddleware(["resident"]), async (req, res) => {
  try {
    const userId = req.user.id;
    
    await db.query(
      "UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0",
      [userId]
    );
    
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
});

module.exports = router;
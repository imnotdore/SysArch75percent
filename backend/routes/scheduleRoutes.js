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
// routes/scheduleRoutes.js - ADD THESE NEW ROUTES


// ------------------- NEW ROUTES FOR BORROWING FEATURES -------------------

// Get user's borrowings history
router.get("/user/borrowings", authMiddleware(["resident"]), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [borrowings] = await db.query(`
      SELECT 
        s.id,
        s.item,
        s.quantity,
        s.date_from,
        s.date_to,
        s.time_from,
        s.time_to,
        s.status,
        s.reason,
        s.approved_at,
        s.created_at,
        i.max_quantity,
        i.available,
        CASE 
          WHEN s.status = 'Approved' AND s.date_to >= CURDATE() THEN 'active'
          WHEN s.status = 'Approved' AND s.date_to < CURDATE() THEN 'overdue'
          WHEN s.status = 'Returned' THEN 'returned'
          WHEN s.status = 'Pending' THEN 'pending'
          ELSE 'other'
        END AS display_status,
        DATEDIFF(s.date_to, CURDATE()) as days_remaining,
        s.date_to < CURDATE() AND s.status = 'Approved' as is_overdue
      FROM schedules s
      LEFT JOIN items i ON s.item = i.item_name
      WHERE s.user_id = ?
      ORDER BY s.date_from DESC, s.created_at DESC
    `, [userId]);
    
    res.json(borrowings);
  } catch (err) {
    console.error("Error fetching user borrowings:", err);
    res.status(500).json({ error: "Failed to fetch borrowings" });
  }
});

// Get waitlist items for user
router.get("/user/waitlist", authMiddleware(["resident"]), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [waitlist] = await db.query(`
      SELECT 
        wl.id,
        wl.item_name as item,
        wl.position,
        wl.created_at as joined_date,
        wl.estimated_available,
        i.max_quantity,
        i.available,
        (SELECT COUNT(*) FROM waitlist wl2 WHERE wl2.item_name = wl.item_name AND wl2.created_at < wl.created_at) + 1 as calculated_position
      FROM waitlist wl
      LEFT JOIN items i ON wl.item_name = i.item_name
      WHERE wl.user_id = ?
      ORDER BY wl.created_at ASC
    `, [userId]);
    
    res.json(waitlist);
  } catch (err) {
    console.error("Error fetching waitlist:", err);
    res.status(500).json({ error: "Failed to fetch waitlist" });
  }
});

// Join waitlist
router.post("/waitlist", authMiddleware(["resident"]), async (req, res) => {
  try {
    const userId = req.user.id;
    const { item } = req.body;
    
    if (!item) {
      return res.status(400).json({ error: "Item is required" });
    }
    
    // Check if already in waitlist
    const [existing] = await db.query(
      "SELECT id FROM waitlist WHERE user_id = ? AND item_name = ?",
      [userId, item]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: "Already in waitlist for this item" });
    }
    
    // Get position
    const [count] = await db.query(
      "SELECT COUNT(*) as count FROM waitlist WHERE item_name = ?",
      [item]
    );
    
    const position = count[0].count + 1;
    
    // Insert into waitlist
    await db.query(
      "INSERT INTO waitlist (user_id, item_name, position, created_at) VALUES (?, ?, ?, NOW())",
      [userId, item, position]
    );
    
    res.json({ 
      success: true, 
      message: "Added to waitlist", 
      position,
      item 
    });
  } catch (err) {
    console.error("Error joining waitlist:", err);
    res.status(500).json({ error: "Failed to join waitlist" });
  }
});

// Leave waitlist
router.delete("/waitlist/:id", authMiddleware(["resident"]), async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const [result] = await db.query(
      "DELETE FROM waitlist WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Waitlist item not found" });
    }
    
    // Update positions for other users in the same waitlist
    // (This is optional but good for accurate positioning)
    
    res.json({ success: true, message: "Left waitlist" });
  } catch (err) {
    console.error("Error leaving waitlist:", err);
    res.status(500).json({ error: "Failed to leave waitlist" });
  }
});

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
        n.borrowing_id,
        n.item_name,
        s.item,
        s.status as schedule_status
      FROM notifications n
      LEFT JOIN schedules s ON n.borrowing_id = s.id
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
router.put("/notifications/:id/read", authMiddleware(["resident"]), async (req, res) => {
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
router.put("/notifications/read-all", authMiddleware(["resident"]), async (req, res) => {
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

// Get user borrowing statistics
router.get("/stats", authMiddleware(["resident"]), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM schedules WHERE user_id = ?) as total_borrowings,
        (SELECT COUNT(*) FROM schedules WHERE user_id = ? AND status = 'Approved') as completed_borrowings,
        (SELECT COUNT(*) FROM schedules WHERE user_id = ? AND status = 'Approved' AND date_to >= CURDATE()) as active_borrowings,
        (SELECT COUNT(*) FROM schedules WHERE user_id = ? AND status = 'Approved' AND date_to < CURDATE()) as late_returns
    `, [userId, userId, userId, userId]);
    
    // Get popular items
    const [popularItems] = await db.query(`
      SELECT 
        s.item as name,
        COUNT(*) as count
      FROM schedules s
      WHERE s.user_id = ? AND s.status = 'Approved'
      GROUP BY s.item
      ORDER BY count DESC
      LIMIT 5
    `, [userId]);
    
    res.json({
      ...stats[0],
      popular_items: popularItems
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// Renew borrowing request
router.post("/borrowings/:id/renew", authMiddleware(["resident"]), async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { new_return_date } = req.body;
    
    if (!new_return_date) {
      return res.status(400).json({ error: "New return date is required" });
    }
    
    // Check if borrowing exists and belongs to user
    const [borrowing] = await db.query(
      "SELECT * FROM schedules WHERE id = ? AND user_id = ? AND status = 'Approved'",
      [id, userId]
    );
    
    if (borrowing.length === 0) {
      return res.status(404).json({ error: "Borrowing not found or not eligible for renewal" });
    }
    
    const currentBorrowing = borrowing[0];
    const currentReturnDate = new Date(currentBorrowing.date_to);
    const newReturnDate = new Date(new_return_date);
    
    // Validate new return date
    if (newReturnDate <= currentReturnDate) {
      return res.status(400).json({ error: "New return date must be after current return date" });
    }
    
    // Check maximum extension (7 days)
    const maxExtension = new Date(currentReturnDate);
    maxExtension.setDate(maxExtension.getDate() + 7);
    
    if (newReturnDate > maxExtension) {
      return res.status(400).json({ 
        error: "Cannot extend more than 7 days",
        max_date: maxExtension.toISOString().split('T')[0]
      });
    }
    
    // Check item availability for extended dates
    const [availability] = await db.query(
      `SELECT COALESCE(SUM(quantity), 0) as total_booked
       FROM schedules
       WHERE item = ? 
       AND status IN ('Pending', 'Approved')
       AND id != ?
       AND (
         (date_from <= ? AND date_to >= ?) OR
         (date_from BETWEEN ? AND ?) OR
         (date_to BETWEEN ? AND ?)
       )`,
      [
        currentBorrowing.item,
        id,
        new_return_date, currentBorrowing.date_from,
        currentBorrowing.date_from, new_return_date,
        currentBorrowing.date_from, new_return_date
      ]
    );
    
    const [itemData] = await db.query(
      "SELECT max_quantity FROM items WHERE item_name = ?",
      [currentBorrowing.item]
    );
    
    const availableQty = itemData[0]?.max_quantity || 1;
    
    if (availability[0].total_booked + currentBorrowing.quantity > availableQty) {
      return res.status(400).json({ 
        error: "Not enough items available for extended period",
        available: availableQty - availability[0].total_booked
      });
    }
    
    // Create renewal request (or update directly if allowed)
    await db.query(
      `INSERT INTO renewal_requests 
       (schedule_id, user_id, item, current_return_date, requested_return_date, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'Pending', NOW())`,
      [id, userId, currentBorrowing.item, currentBorrowing.date_to, new_return_date]
    );
    
    res.json({ 
      success: true, 
      message: "Renewal request submitted",
      current_return_date: currentBorrowing.date_to,
      requested_return_date: new_return_date
    });
  } catch (err) {
    console.error("Error submitting renewal:", err);
    res.status(500).json({ error: "Failed to submit renewal request" });
  }
});

// Return item
router.post("/borrowings/:id/return", authMiddleware(["resident"]), async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // Check if borrowing exists and belongs to user
    const [borrowing] = await db.query(
      "SELECT * FROM schedules WHERE id = ? AND user_id = ? AND status = 'Approved'",
      [id, userId]
    );
    
    if (borrowing.length === 0) {
      return res.status(404).json({ error: "Borrowing not found or not eligible for return" });
    }
    
    // Update status to 'Returned'
    await db.query(
      "UPDATE schedules SET status = 'Returned', updated_at = NOW() WHERE id = ?",
      [id]
    );
    
    // Update item availability
    const currentBorrowing = borrowing[0];
    await db.query(
      "UPDATE items SET available = available + ? WHERE item_name = ?",
      [currentBorrowing.quantity, currentBorrowing.item]
    );
    
    // Create notification for staff
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, item_name, borrowing_id, created_at)
       VALUES (?, 'return', 'Item Returned', '${currentBorrowing.item} has been returned', ?, ?, NOW())`,
      [userId, currentBorrowing.item, id]
    );
    
    res.json({ 
      success: true, 
      message: "Item returned successfully",
      item: currentBorrowing.item,
      quantity: currentBorrowing.quantity
    });
  } catch (err) {
    console.error("Error returning item:", err);
    res.status(500).json({ error: "Failed to return item" });
  }
});

// Check waitlist position
router.get("/waitlist/position", authMiddleware(["resident"]), async (req, res) => {
  try {
    const userId = req.user.id;
    const { item } = req.query;
    
    if (!item) {
      return res.status(400).json({ error: "Item is required" });
    }
    
    const [position] = await db.query(`
      SELECT 
        wl.id,
        wl.position,
        (SELECT COUNT(*) FROM waitlist wl2 WHERE wl2.item_name = ? AND wl2.created_at < wl.created_at) as ahead
      FROM waitlist wl
      WHERE wl.user_id = ? AND wl.item_name = ?
    `, [item, userId, item]);
    
    if (position.length === 0) {
      return res.status(404).json({ error: "Not in waitlist for this item" });
    }
    
    res.json({
      position: position[0].position,
      ahead: position[0].ahead,
      total: position[0].ahead + 1
    });
  } catch (err) {
    console.error("Error checking waitlist position:", err);
    res.status(500).json({ error: "Failed to check waitlist position" });
  }
});


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
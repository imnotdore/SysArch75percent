const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");

// Get user's borrowings with status mapping
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
        s.returned_at,
        s.released_at,
        s.return_condition,
        s.damage_cost,
        i.max_quantity,
        i.available as item_available,
        i.can_renew,
        
        -- Calculate display status
        CASE 
          WHEN s.status = 'Approved' AND s.released_at IS NULL THEN 'approved_not_released'
          WHEN s.status = 'Approved' AND s.released_at IS NOT NULL AND s.returned_at IS NULL THEN 'active'
          WHEN s.status = 'Approved' AND s.returned_at IS NOT NULL THEN 'returned'
          WHEN s.status = 'Pending' THEN 'pending'
          WHEN s.status = 'Rejected' THEN 'rejected'
          WHEN s.status = 'Cancelled' THEN 'cancelled'
          ELSE 'other'
        END as display_status,
        
        -- Check if can renew
        CASE 
          WHEN s.status = 'Approved' 
            AND s.returned_at IS NULL 
            AND s.released_at IS NOT NULL
            AND i.can_renew = 1
            AND s.date_to >= CURDATE()
            AND DATEDIFF(s.date_to, CURDATE()) <= 2 
            THEN TRUE
          ELSE FALSE
        END as can_renew,
        
        DATEDIFF(s.date_to, CURDATE()) as days_remaining,
        s.date_to < CURDATE() AND s.returned_at IS NULL as is_overdue
        
      FROM schedules s
      LEFT JOIN items i ON s.item = i.item_name
      WHERE s.user_id = ?
      ORDER BY 
        CASE 
          WHEN s.returned_at IS NULL AND s.released_at IS NOT NULL THEN 1
          WHEN s.status = 'Pending' THEN 2
          WHEN s.status = 'Approved' AND s.released_at IS NULL THEN 3
          ELSE 4
        END,
        s.date_from DESC
    `, [userId]);
    
    res.json(borrowings);
  } catch (err) {
    console.error("Error fetching user borrowings:", err);
    res.status(500).json({ error: "Failed to fetch borrowings" });
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
    
    // Check if item exists
    const [itemExists] = await db.query(
      "SELECT id FROM items WHERE item_name = ?",
      [item]
    );
    
    if (itemExists.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    // Check if already in waitlist
    const [existing] = await db.query(
      "SELECT id FROM waitlist WHERE user_id = ? AND item_name = ?",
      [userId, item]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: "Already in waitlist for this item" });
    }
    
    // Check if user already has active borrowing for this item
    const [activeBorrowing] = await db.query(
      `SELECT id FROM schedules 
       WHERE user_id = ? AND item = ? 
       AND status IN ('Pending', 'Approved') 
       AND returned_at IS NULL`,
      [userId, item]
    );
    
    if (activeBorrowing.length > 0) {
      return res.status(400).json({ error: "You already have an active borrowing for this item" });
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

// Get user's waitlist items
router.get("/user/waitlist", authMiddleware(["resident"]), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [waitlist] = await db.query(`
      SELECT 
        wl.id,
        wl.item_name as item,
        wl.position,
        wl.created_at as joined_date,
        i.max_quantity,
        (SELECT COALESCE(SUM(quantity), 0) FROM schedules 
         WHERE item = wl.item_name 
         AND status IN ('Pending', 'Approved')
         AND date_to >= CURDATE()) as currently_borrowed,
        i.max_quantity - (SELECT COALESCE(SUM(quantity), 0) FROM schedules 
                          WHERE item = wl.item_name 
                          AND status IN ('Pending', 'Approved')
                          AND date_to >= CURDATE()) as estimated_available_count
      FROM waitlist wl
      LEFT JOIN items i ON wl.item_name = i.item_name
      WHERE wl.user_id = ?
      ORDER BY wl.position ASC
    `, [userId]);
    
    res.json(waitlist);
  } catch (err) {
    console.error("Error fetching waitlist:", err);
    res.status(500).json({ error: "Failed to fetch waitlist" });
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
    
    res.json({ success: true, message: "Left waitlist" });
  } catch (err) {
    console.error("Error leaving waitlist:", err);
    res.status(500).json({ error: "Failed to leave waitlist" });
  }
});

// Request renewal
router.post("/renew/:id", authMiddleware(["resident"]), async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { new_return_date } = req.body;
    
    if (!new_return_date) {
      return res.status(400).json({ error: "New return date is required" });
    }
    
    // Check if schedule exists and belongs to user
    const [schedule] = await db.query(`
      SELECT s.*, i.can_renew
      FROM schedules s
      LEFT JOIN items i ON s.item = i.item_name
      WHERE s.id = ? AND s.user_id = ? 
      AND s.status = 'Approved'
      AND s.released_at IS NOT NULL
      AND s.returned_at IS NULL
    `, [id, userId]);
    
    if (schedule.length === 0) {
      return res.status(404).json({ error: "Schedule not found or not eligible for renewal" });
    }
    
    const currentSchedule = schedule[0];
    
    if (!currentSchedule.can_renew) {
      return res.status(400).json({ error: "This item cannot be renewed" });
    }
    
    // Check if renewal is within 2 days of return date
    const daysUntilReturn = Math.ceil((new Date(currentSchedule.date_to) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilReturn > 2) {
      return res.status(400).json({ error: "Can only renew within 2 days of return date" });
    }
    
    const currentReturnDate = new Date(currentSchedule.date_to);
    const newReturnDate = new Date(new_return_date);
    
    // Validate new return date
    if (newReturnDate <= currentReturnDate) {
      return res.status(400).json({ error: "New return date must be after current return date" });
    }
    
    // Maximum 7 days extension
    const maxExtension = new Date(currentReturnDate);
    maxExtension.setDate(maxExtension.getDate() + 7);
    
    if (newReturnDate > maxExtension) {
      return res.status(400).json({ 
        error: "Cannot extend more than 7 days",
        max_date: maxExtension.toISOString().split('T')[0]
      });
    }
    
    // Check item availability for extended period
    const [availability] = await db.query(
      `SELECT COALESCE(SUM(quantity), 0) as total_booked
       FROM schedules
       WHERE item = ? 
       AND status IN ('Pending', 'Approved')
       AND id != ?
       AND returned_at IS NULL
       AND (
         (date_from <= ? AND date_to >= ?) OR
         (date_from BETWEEN ? AND ?) OR
         (date_to BETWEEN ? AND ?)
       )`,
      [
        currentSchedule.item,
        id,
        new_return_date, currentSchedule.date_from,
        currentSchedule.date_from, new_return_date,
        currentSchedule.date_from, new_return_date
      ]
    );
    
    const [itemData] = await db.query(
      "SELECT max_quantity FROM items WHERE item_name = ?",
      [currentSchedule.item]
    );
    
    const availableQty = itemData[0]?.max_quantity || 1;
    
    if (availability[0].total_booked + currentSchedule.quantity > availableQty) {
      return res.status(400).json({ 
        error: "Not enough items available for extended period",
        available: availableQty - availability[0].total_booked
      });
    }
    
    // Update schedule return date
    await db.query(
      "UPDATE schedules SET date_to = ?, updated_at = NOW() WHERE id = ?",
      [new_return_date, id]
    );
    
    res.json({ 
      success: true, 
      message: "Item renewed successfully",
      old_return_date: currentSchedule.date_to,
      new_return_date: new_return_date,
      extended_days: Math.ceil((newReturnDate - currentReturnDate) / (1000 * 60 * 60 * 24))
    });
  } catch (err) {
    console.error("Error renewing item:", err);
    res.status(500).json({ error: "Failed to renew item" });
  }
});

// User return item
router.post("/return/:id", authMiddleware(["resident"]), async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { condition, damage_description } = req.body;
    
    // Check if schedule exists and belongs to user
    const [schedule] = await db.query(
      "SELECT * FROM schedules WHERE id = ? AND user_id = ? AND status = 'Approved' AND released_at IS NOT NULL AND returned_at IS NULL",
      [id, userId]
    );
    
    if (schedule.length === 0) {
      return res.status(404).json({ error: "Schedule not found or not eligible for return" });
    }
    
    const currentSchedule = schedule[0];
    const now = new Date();
    
    // Calculate late fee if applicable
    let damageCost = 0;
    const returnDate = new Date(currentSchedule.date_to);
    const isLate = now > returnDate;
    const daysLate = isLate ? Math.ceil((now - returnDate) / (1000 * 60 * 60 * 24)) : 0;
    
    // Basic late fee: 50 pesos per day
    const lateFee = daysLate * 50;
    
    // Update schedule with return info
    await db.query(
      `UPDATE schedules 
       SET returned_at = NOW(), 
           return_condition = ?,
           damage_description = ?,
           damage_cost = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [condition || 'Good', damage_description || null, lateFee, id]
    );
    
    // Update item availability
    await db.query(
      "UPDATE items SET available = available + ? WHERE item_name = ?",
      [currentSchedule.quantity, currentSchedule.item]
    );
    
    res.json({ 
      success: true, 
      message: "Item returned successfully",
      item: currentSchedule.item,
      quantity: currentSchedule.quantity,
      late_fee: lateFee,
      days_late: daysLate,
      return_date: now.toISOString()
    });
  } catch (err) {
    console.error("Error returning item:", err);
    res.status(500).json({ error: "Failed to return item" });
  }
});

// Get user statistics
router.get("/stats", authMiddleware(["resident"]), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM schedules WHERE user_id = ?) as total_borrowings,
        (SELECT COUNT(*) FROM schedules WHERE user_id = ? AND status = 'Approved' AND returned_at IS NOT NULL) as completed_borrowings,
        (SELECT COUNT(*) FROM schedules WHERE user_id = ? AND status = 'Approved' AND released_at IS NOT NULL AND returned_at IS NULL) as active_borrowings,
        (SELECT COUNT(*) FROM schedules WHERE user_id = ? AND status = 'Approved' AND returned_at IS NOT NULL AND damage_cost > 0) as late_returns,
        (SELECT COUNT(*) FROM waitlist WHERE user_id = ?) as waitlist_count,
        (SELECT COUNT(*) FROM schedules WHERE user_id = ? AND status = 'Pending') as pending_requests
    `, [userId, userId, userId, userId, userId, userId]);
    
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

module.exports = router;
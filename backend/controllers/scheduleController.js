const db = require("../config/db");

// ------------------- Resident -------------------

// Create a schedule (resident)
// In createSchedule function, AFTER successful schedule creation:
const createSchedule = async (req, res) => {
  try {
    console.log("=== SCHEDULE CREATION DEBUG ===");
    console.log("Received schedule creation request:", req.body);
    console.log("User ID:", req.user.id);
    
    const userId = req.user.id;
    const { date_from, date_to, time_from, time_to, item, quantity, reason } = req.body;

    // Validate required fields
    if (!date_from || !date_to || !time_from || !time_to || !item) {
      console.log("Missing fields:", { date_from, date_to, time_from, time_to, item });
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("Checking availability for:", { item, date_from, date_to, requested_quantity: quantity || 1 });

    // FIXED: Check current bookings for the item in the selected date range
    const [existing] = await db.query(
      `SELECT COALESCE(SUM(quantity), 0) AS total_booked
       FROM schedules
       WHERE item = ? 
       AND status IN ('Pending', 'Approved')
       AND (
         (date_from <= ? AND date_to >= ?) OR
         (date_from BETWEEN ? AND ?) OR
         (date_to BETWEEN ? AND ?)
       )`,
      [item, date_to, date_from, date_from, date_to, date_from, date_to]
    );

    const bookedQty = existing[0].total_booked;
    console.log("Already booked quantity for date range:", bookedQty);

    // Get the max available quantity of the item
    const [itemData] = await db.query(
      `SELECT id, max_quantity, available FROM items WHERE item_name = ?`,
      [item]
    );

    console.log("Item data from database:", itemData[0]);

    if (!itemData[0]) {
      console.log("Item not found in database:", item);
      return res.status(404).json({ error: "Item not found" });
    }

    const maxQuantity = itemData[0].max_quantity;
    const currentAvailable = itemData[0].available || maxQuantity;
    const requestedQuantity = quantity || 1;
    
    console.log("Max quantity:", maxQuantity);
    console.log("Current available:", currentAvailable);
    console.log("Requested quantity:", requestedQuantity);
    console.log("Total after booking:", bookedQty + requestedQuantity);

    // Check if enough quantity is available
    if (bookedQty + requestedQuantity > maxQuantity) {
      console.log("❌ Not enough quantity available!");
      console.log(`Booked: ${bookedQty}, Requested: ${requestedQuantity}, Max: ${maxQuantity}`);
      return res.status(400).json({ 
        error: "Not enough quantity available",
        details: {
          booked: bookedQty,
          requested: requestedQuantity,
          max: maxQuantity,
          available: maxQuantity - bookedQty
        }
      });
    }

    console.log("✅ Quantity available, creating schedule...");

    // Insert new schedule
    const [result] = await db.query(
      `INSERT INTO schedules 
        (user_id, item, quantity, date_from, date_to, time_from, time_to, status, reason) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      [userId, item, requestedQuantity, date_from, date_to, time_from, time_to, reason || null]
    );

    console.log("✅ Schedule created successfully, ID:", result.insertId);

    // ✅ ✅ ✅ IMPORTANT: UPDATE ITEM AVAILABILITY ✅ ✅ ✅
    // Calculate new available quantity
    const newAvailable = currentAvailable - requestedQuantity;
    if (newAvailable < 0) {
      console.log("❌ Warning: Available quantity would be negative, setting to 0");
    }
    
    await db.query(
      `UPDATE items SET available = ? WHERE item_name = ?`,
      [Math.max(0, newAvailable), item]
    );
    
    console.log(`✅ Updated item availability: ${item} from ${currentAvailable} to ${Math.max(0, newAvailable)}`);

    res.json({
      id: result.insertId,
      user_id: userId,
      item,
      quantity: requestedQuantity,
      date_from,
      date_to,
      time_from,
      time_to,
      status: "Pending",
      reason: reason || null,
      item_available: Math.max(0, newAvailable) // Send back updated availability
    });
  } catch (err) {
    console.error("Error creating schedule:", err);
    res.status(500).json({ error: "Failed to create schedule" });
  }
};

// Get schedules for logged-in resident
const getUserSchedules = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT id, item, quantity, date_from, date_to, time_from, time_to, status, reason
       FROM schedules
       WHERE user_id = ?
       ORDER BY date_from DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching user schedules:", err);
    res.status(500).json({ error: "Failed to fetch user schedules" });
  }
};

// Delete/cancel schedule (resident)
const deleteSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await db.query(
      `DELETE FROM schedules WHERE id = ? AND user_id = ? AND status = 'Pending'`,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Schedule not found, not yours, or cannot cancel" });
    }

    res.json({ message: "Schedule cancelled successfully" });
  } catch (err) {
    console.error("Error deleting schedule:", err);
    res.status(500).json({ error: "Failed to delete schedule" });
  }
};

// ------------------- Admin -------------------

// Get all schedules (admin)
const getAllSchedules = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id, s.user_id, u.name AS resident_name, s.item, s.quantity,
             s.date_from, s.date_to, s.time_from, s.time_to, s.status, s.reason
      FROM schedules s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.date_from DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching schedules:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
};

// Update schedule status (approve/reject/cancel) (admin)
// In updateScheduleStatus function, add item availability updates:
const updateScheduleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { status, reason } = req.body;

    if (!["Pending", "Approved", "Rejected", "Cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // First get the schedule details
    const [schedule] = await db.query(
      "SELECT item, quantity FROM schedules WHERE id = ?",
      [id]
    );

    if (schedule.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const { item, quantity } = schedule[0];
    let query = "";
    let params = [];

    if (status === "Approved") {
      query = `
        UPDATE schedules
        SET status = ?, approved_at = NOW(), approved_by = ?, updated_at = NOW()
        WHERE id = ?`;
      params = [status, adminId, id];
    } else if (status === "Cancelled") {
      query = `
        UPDATE schedules
        SET status = ?, cancel_reason = ?, approved_by = ?, approved_at = NOW(), updated_at = NOW()
        WHERE id = ?`;
      params = [status, reason || null, adminId, id];
      
      // If cancelling a Pending request, return the quantity to available
      const [currentStatus] = await db.query(
        "SELECT status FROM schedules WHERE id = ?",
        [id]
      );
      
      if (currentStatus[0]?.status === 'Pending') {
        await db.query(
          `UPDATE items SET available = available + ? WHERE item_name = ?`,
          [quantity, item]
        );
        console.log(`✅ Returned ${quantity} ${item} to available stock`);
      }
    } else {
      // Rejected or Pending reset
      query = `
        UPDATE schedules
        SET status = ?, approved_by = NULL, approved_at = NULL, cancel_reason = ?, updated_at = NOW()
        WHERE id = ?`;
      params = [status, reason || null, id];
      
      // If rejecting a Pending request, return the quantity to available
      if (status === "Rejected") {
        await db.query(
          `UPDATE items SET available = available + ? WHERE item_name = ?`,
          [quantity, item]
        );
        console.log(`✅ Returned ${quantity} ${item} to available stock after rejection`);
      }
    }

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json({ id, status, reason: reason || null });
  } catch (err) {
    console.error("Error updating schedule status:", err);
    res.status(500).json({ error: "Failed to update schedule status" });
  }
};
// ------------------- Staff -------------------

// Get pending schedules (staff inbox)
const getPendingSchedules = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id, s.user_id, u.name AS resident_name, s.item, s.quantity,
             s.date_from, s.date_to, s.time_from, s.time_to, s.status, s.reason
      FROM schedules s
      JOIN users u ON s.user_id = u.id
      WHERE s.status = 'Pending'
      ORDER BY s.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching pending schedules:", err);
    res.status(500).json({ error: "Failed to fetch pending schedules" });
  }
};

// Staff/Admin cancel schedule (soft cancel with reason)
const staffCancelSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = req.user.id;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: "Cancel reason is required" });
    }

    const [result] = await db.query(
      `UPDATE schedules
       SET status = 'Cancelled',
           cancel_reason = ?,
           approved_by = ?,
           approved_at = NOW(),
           updated_at = NOW()
       WHERE id = ? AND status IN ('Pending', 'Approved')`,
      [reason, staffId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Schedule not found or cannot be cancelled" });
    }

    res.json({ id, status: "Cancelled", reason });
  } catch (err) {
    console.error("Error cancelling schedule by staff:", err);
    res.status(500).json({ error: "Failed to cancel schedule" });
  }
};

module.exports = {
  createSchedule,
  getUserSchedules,
  deleteSchedule,
  getAllSchedules,
  updateScheduleStatus,
  getPendingSchedules,
  staffCancelSchedule,
};

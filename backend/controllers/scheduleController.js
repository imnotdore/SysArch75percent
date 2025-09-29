const db = require("../config/db"); // just db

// Get pending schedules for staff inbox
const getPendingSchedules = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.id, s.user_id, u.name AS resident_name, s.item, s.quantity,
              s.date_from, s.date_to, s.time_from, s.time_to, s.status
       FROM schedules s
       JOIN users u ON s.user_id = u.id
       WHERE s.status = 'Pending'
       ORDER BY s.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching pending schedules:", err);
    res.status(500).json({ error: "Failed to fetch pending schedules" });
  }
};

// CREATE schedule
// CREATE schedule
const createSchedule = async (req, res) => {
  try {
    const userId = req.user.id; // galing JWT middleware
    const { date_from, date_to, time_from, time_to, item, quantity } = req.body;

    if (!date_from || !date_to || !time_from || !time_to || !item) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [result] = await db.query(
      `INSERT INTO schedules 
        (user_id, item, quantity, date_from, date_to, time_from, time_to, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [userId, item, quantity || 1, date_from, date_to, time_from, time_to]
    );

    res.json({
      id: result.insertId,
      user_id: userId,
      item,
      quantity: quantity || 1,
      date_from,
      date_to,
      time_from,
      time_to,
      status: "Pending",
    });
  } catch (err) {
    console.error("Error creating schedule:", err);
    res.status(500).json({ error: "Failed to create schedule" });
  }
};


// GET all schedules (for admin)
const getAllSchedules = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id, s.user_id, u.name AS user, s.item, s.quantity,
             s.date_from, s.date_to, s.time_from, s.time_to, s.status
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

// GET schedules for logged-in resident
const getUserSchedules = async (req, res) => {
  try {
    const userId = req.user.id; // galing JWT, hindi params
    const [rows] = await db.query(
      `SELECT s.id, s.item, s.quantity, s.date_from, s.date_to,
              s.time_from, s.time_to, s.status
       FROM schedules s
       WHERE s.user_id = ?
       ORDER BY s.date_from DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching user schedules:", err);
    res.status(500).json({ error: "Failed to fetch user schedules" });
  }
};

// UPDATE status (approve/reject) - admin use
const updateScheduleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approved_by } = req.body; // <- accept staff ID

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    if (status === "Approved") {
      await db.query(
        "UPDATE schedules SET status = ?, approved_at = NOW(), approved_by = ? WHERE id = ?",
        [status, approved_by || null, id]
      );
    } else {
      await db.query(
        "UPDATE schedules SET status = ?, approved_by = NULL WHERE id = ?",
        [status, id]
      );
    }

    res.json({ id, status });
  } catch (err) {
    console.error("Error updating schedule status:", err);
    res.status(500).json({ error: "Failed to update schedule status" });
  }
};


// DELETE schedule (cancel by resident)
const deleteSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await db.query(
      `DELETE FROM schedules WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Schedule not found or not yours" });
    }

    res.json({ message: "Schedule cancelled successfully" });
  } catch (err) {
    console.error("Error deleting schedule:", err);
    res.status(500).json({ error: "Failed to delete schedule" });
  }
};


module.exports = {
  createSchedule,
  getAllSchedules,
  getUserSchedules,
  updateScheduleStatus,
  deleteSchedule,
  getPendingSchedules, 
};

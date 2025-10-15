const db = require("../config/db");

// ------------------- Resident -------------------

// Create a new computer borrow request
const createRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pc, date, startTime, endTime } = req.body;

    if (!pc || !date || !startTime || !endTime) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const diffHours = (end - start) / (1000 * 60 * 60);

    if (diffHours <= 0) return res.status(400).json({ error: "End time must be after start time" });
    if (diffHours > 2) return res.status(400).json({ error: "You can borrow a PC for a maximum of 2 hours" });
    if (start.getHours() < 8 || end.getHours() > 22 || (end.getHours() === 22 && end.getMinutes() > 0)) {
      return res.status(400).json({ error: "PC can only be borrowed between 08:00 and 22:00" });
    }

    // Check if PC is already booked at that time
    const [existing] = await db.query(
      `SELECT COUNT(*) AS count
       FROM computer_schedule
       WHERE pc_name = ? AND status != 'Cancelled' AND date = ? AND
             ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
      [pc, date, startTime, startTime, endTime, endTime]
    );

    if (existing[0].count > 0) {
      return res.status(400).json({ error: "PC is already booked at that time" });
    }

    const [result] = await db.query(
      `INSERT INTO computer_schedule (user_id, pc_name, date, start_time, end_time, status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [userId, pc, date, startTime, endTime]
    );

    res.json({
      id: result.insertId,
      user_id: userId,
      pc_name: pc,
      date,
      startTime,
      endTime,
      status: "Pending",
    });
  } catch (err) {
    console.error("Error creating request:", err);
    res.status(500).json({ error: "Failed to create request" });
  }
};

// Get all requests of logged-in resident
const getUserRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT id, pc_name AS pc, date, start_time AS startTime, end_time AS endTime, status
       FROM computer_schedule
       WHERE user_id = ?
       ORDER BY date DESC, start_time DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching user requests:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

// Cancel pending request (resident)
const cancelRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await db.query(
      `DELETE FROM computer_schedule WHERE id = ? AND user_id = ? AND status = 'Pending'`,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Request not found or cannot cancel" });
    }

    res.json({ message: "Request cancelled successfully", id });
  } catch (err) {
    console.error("Error cancelling request:", err);
    res.status(500).json({ error: "Failed to cancel request" });
  }
};

// ------------------- Staff/Admin -------------------

// Get all requests (staff/admin)
const getAllRequests = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT cs.id, cs.user_id, u.name AS resident_name, cs.pc_name, cs.date,
              cs.start_time AS startTime, cs.end_time AS endTime, cs.status
       FROM computer_schedule cs
       JOIN users u ON cs.user_id = u.id
       ORDER BY cs.date DESC, cs.start_time DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching all requests:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

// Update request status (approve, done, cancel)
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Approved", "Done", "Cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const [result] = await db.query(
      `UPDATE computer_schedule SET status = ? WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json({ id, status });
  } catch (err) {
    console.error("Error updating request status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
};

module.exports = {
  createRequest,
  getUserRequests,
  cancelRequest,
  getAllRequests,
  updateRequestStatus,
};

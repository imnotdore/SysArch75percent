const db = require("../config/db");

// ---------------- Staff Inbox ----------------
const getStaffInbox = async (req, res) => {
  try {
    // Pending files
    const [fileRows] = await db.query(`
      SELECT fr.id, fr.resident_id AS user_id, r.username AS resident_name, fr.filename, fr.status, fr.created_at
      FROM resident_requests fr
      JOIN residents r ON fr.resident_id = r.id
      WHERE fr.status = 'Pending'
      ORDER BY fr.created_at DESC
    `);

    // Pending schedules
    const [scheduleRows] = await db.query(`
      SELECT s.id, s.user_id, r.username AS resident_name, s.item, s.quantity, s.date_from, s.date_to, s.time_from, s.time_to, s.status, s.created_at
      FROM schedules s
      JOIN residents r ON s.user_id = r.id
      WHERE s.status = 'Pending'
      ORDER BY s.created_at DESC
    `);

    res.json({
      pendingFiles: fileRows,
      pendingSchedules: scheduleRows,
    });
  } catch (err) {
    console.error("Error fetching staff inbox:", err);
    res.status(500).json({ error: "Failed to fetch staff inbox" });
  }
};

// ---------------- Release Schedule ----------------
const releaseSchedule = async (req, res) => {
  const { id } = req.params;

  if (!req.user || req.user.role !== "staff") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    await db.query(
      `UPDATE schedules
       SET status = 'Released', released_at = NOW(), released_by = ?
       WHERE id = ?`,
      [req.user.id, id]
    );

    res.json({ message: "Schedule released successfully." });
  } catch (err) {
    console.error("Error releasing schedule:", err);
    res.status(500).json({ error: "Failed to release schedule" });
  }
};

// ---------------- Return Schedule ----------------
const returnSchedule = async (req, res) => {
  const { id } = req.params;

  if (!req.user || req.user.role !== "staff") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    await db.query(
      `UPDATE schedules
       SET status = 'Returned', returned_at = NOW(), approved_by = ?
       WHERE id = ?`,
      [req.user.id, id]
    );

    res.json({ message: "Schedule marked as returned." });
  } catch (err) {
    console.error("Error returning schedule:", err);
    res.status(500).json({ error: "Failed to mark schedule as returned" });
  }
};

// ---------------- Get Returned Schedules ----------------
const getReturnedSchedules = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id, s.user_id, r.username AS resident_username, s.item, s.quantity,
             s.date_from, s.date_to, s.time_from, s.time_to, s.status,
             s.returned_at, st.username AS staff_username
      FROM schedules s
      JOIN residents r ON s.user_id = r.id
      LEFT JOIN staff st ON s.approved_by = st.id
      WHERE s.status = 'Returned'
      ORDER BY s.returned_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching returned schedules:", err);
    res.status(500).json({ error: "Failed to fetch returned schedules" });
  }
};

// ---------------- Get Released Schedules ----------------
const getReleasedSchedules = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id, s.user_id, r.username AS resident_username, s.item, s.quantity,
             s.date_from, s.date_to, s.time_from, s.time_to, s.status,
             s.released_at, st.username AS released_by_username
      FROM schedules s
      JOIN residents r ON s.user_id = r.id
      LEFT JOIN staff st ON s.released_by = st.id
      WHERE s.status = 'Released'
      ORDER BY s.released_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching released schedules:", err);
    res.status(500).json({ error: "Failed to fetch released schedules" });
  }
};

module.exports = {
  getStaffInbox,
  releaseSchedule,
  returnSchedule,
  getReleasedSchedules,
  getReturnedSchedules,
};

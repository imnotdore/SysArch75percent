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

// ---------------- Mark File as Printed ----------------
const markFileAsPrinted = async (req, res) => {
  const fileId = req.params.id;

  if (!req.user || req.user.role !== "staff") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const [result] = await db.query(
      `UPDATE resident_requests
       SET status = 'Printed',
           approved_by = ?,
           approved_at = NOW()
       WHERE id = ?`,
      [req.user.id, fileId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json({ message: "File marked as printed successfully." });
  } catch (err) {
    console.error("Error marking file as printed:", err);
    res.status(500).json({ error: "Failed to mark as printed" });
  }
};

// ---------------- Mark File as Claimed ----------------
const markFileAsClaimed = async (req, res) => {
  const fileId = req.params.id;

  if (!req.user || req.user.role !== "staff") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const [result] = await db.query(
      `UPDATE resident_requests
       SET status = 'claimed',
           claimed_at = NOW(),
           claimed_by = ?
       WHERE id = ? AND status = 'go_to_pickup'`,
      [req.user.id, fileId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "File not found or not ready for claim" });

    res.json({ message: "File marked as claimed successfully." });
  } catch (err) {
    console.error("Error marking file as claimed:", err);
    res.status(500).json({ error: "Failed to mark file as claimed" });
  }
};


// ---------------- Get Printed Files ----------------
const getPrintedFiles = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        rr.id,
        rr.filename,
        rr.original_name,
        rr.status,
        rr.approved_at AS printed_at,
        r.username AS resident_username,
        s.username AS staff_username
      FROM resident_requests rr
      JOIN residents r ON rr.resident_id = r.id
      LEFT JOIN staff s ON rr.approved_by = s.id
      WHERE rr.status = 'Printed'
      ORDER BY rr.approved_at DESC
    `);

    const formatted = rows.map(row => ({
      ...row,
      printed_at: row.printed_at
        ? new Date(row.printed_at).toLocaleString("en-PH", { hour12: true })
        : "N/A",
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching printed files:", err);
    res.status(500).json({ error: "Failed to fetch printed files" });
  }
};
// ---------------- Notify Resident ----------------
const notifyResident = async (req, res) => {
  const fileId = req.params.id;

  if (!req.user || req.user.role !== "staff") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const [result] = await db.query(
      `UPDATE resident_requests
       SET status = 'go_to_pickup', notified_at = NOW(), notified_by = ?
       WHERE id = ? AND status = 'Printed'`,
      [req.user.id, fileId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "File not found or not ready to notify" });
    }

    res.json({ message: "Resident notified successfully." });
  } catch (err) {
    console.error("Error notifying resident:", err);
    res.status(500).json({ error: "Failed to notify resident" });
  }
};

// ---------------- Cancel File Request ----------------
const cancelFileRequest = async (req, res) => {
  const fileId = req.params.id;

  if (!req.user || req.user.role !== "resident") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const [result] = await db.query(
      `UPDATE resident_requests
       SET status = 'Cancelled', cancelled_at = NOW()
       WHERE id = ? AND status = 'Pending'`,
      [fileId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "File not found or cannot be cancelled" });
    }

    res.json({ message: "Request cancelled successfully." });
  } catch (err) {
    console.error("Error cancelling file request:", err);
    res.status(500).json({ error: "Failed to cancel request" });
  }
};

module.exports = {
  getStaffInbox,
  releaseSchedule,
  returnSchedule,
  getReleasedSchedules,
  getReturnedSchedules,
  markFileAsPrinted,
  markFileAsClaimed,
  getPrintedFiles,
  notifyResident,
  cancelFileRequest,
};

const db = require("../config/db");

// ---------------- Staff Inbox ---------------- //
// Unified inbox: schedules + file requests
const getStaffInbox = async (req, res) => {
  try {
    // ----- Pending Schedules -----
    const [schedules] = await db.query(
      `SELECT s.id, s.user_id, r.username AS resident_name, 'schedule' AS type,
              s.item, s.quantity, s.date_from, s.date_to, s.time_from, s.time_to,
              s.status, s.created_at
       FROM schedules s
       JOIN residents r ON s.user_id = r.id
       WHERE s.status = 'Pending'
       ORDER BY s.created_at DESC`
    );

    // ----- Pending File Requests -----
    const [files] = await db.query(
      `SELECT f.id, f.resident_id AS user_id, r.username AS resident_name, 'file' AS type,
              f.filename AS item, f.page_count AS quantity, f.date_needed AS date_from,
              f.date_needed AS date_to, NULL AS time_from, NULL AS time_to,
              f.status, f.created_at
       FROM resident_requests f
       JOIN residents r ON f.resident_id = r.id
       WHERE f.status = 'pending'
       ORDER BY f.created_at DESC`
    );

    // Merge both arrays and sort by created_at descending
    const inbox = [...schedules, ...files].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    res.json({ inbox });
  } catch (err) {
    console.error("Error fetching staff inbox:", err);
    res.status(500).json({ error: "Failed to fetch staff inbox" });
  }
};

module.exports = { getStaffInbox };

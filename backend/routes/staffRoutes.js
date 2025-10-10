const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");

const fileController = require("../controllers/fileController");
const staffController = require("../controllers/staffController");
const { getStaffInbox } = require("../controllers/StaffInboxController");
const { returnedSchedulesController } = require("../controllers/returnedSchedulesController");
const { getReleasedSchedules } = require("../controllers/staffController");

// ---------------- Middleware ----------------
// All staff routes require authentication
router.use(authMiddleware(["staff"]));

// ---------------- Staff Inbox ----------------
router.get("/inbox", getStaffInbox);

// ---------------- Residents ----------------
// Get all residents
router.get("/residents", fileController.getAllResidents);

// Residents with pending requests (files + schedules)
router.get("/residents/pending", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.id, r.username,
             (COALESCE(f.pending_files, 0) + COALESCE(s.pending_schedules, 0)) AS pending_count
      FROM residents r
      LEFT JOIN (
        SELECT resident_id, COUNT(*) AS pending_files
        FROM resident_requests
        WHERE status = 'Pending'
        GROUP BY resident_id
      ) f ON r.id = f.resident_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS pending_schedules
        FROM schedules
        WHERE status = 'Pending'
        GROUP BY user_id
      ) s ON r.id = s.user_id
      HAVING pending_count > 0
      ORDER BY r.username
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching residents with pending requests:", err);
    res.status(500).json({ error: "Failed to fetch residents with pending requests" });
  }
});

// ---------------- Files ----------------
// Get files of a specific resident
router.get("/files/resident/:residentId", fileController.getFilesByResident);

// Update file status (accept/reject)
router.put("/files/:id", fileController.updateFileStatus);

// Get all accepted files
router.get("/accepted", fileController.getAcceptedFiles);

// ---------------- Schedules ----------------
// Get schedules of a specific resident (pending only)
router.get("/schedules/resident/:residentId", async (req, res) => {
  const { residentId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT s.id, s.item, s.quantity, s.date_from, s.date_to, s.time_from, s.time_to, s.status
       FROM schedules s
       WHERE s.user_id = ? AND s.status = 'Pending'
       ORDER BY s.date_from DESC`,
      [residentId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching resident schedules:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// Get all accepted schedules
router.get("/accepted-schedules", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id AS schedule_id, s.user_id, r.username AS resident_username, s.item, s.quantity,
             s.date_from, s.date_to, s.time_from, s.time_to, s.status, s.approved_at, s.approved_by,
             st.username AS staff_username
      FROM schedules s
      JOIN residents r ON s.user_id = r.id
      LEFT JOIN staff st ON s.approved_by = st.id
      WHERE s.status = 'Approved'
      ORDER BY s.approved_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching accepted schedules:", err);
    res.status(500).json({ error: "Failed to fetch accepted schedules" });
  }
});

// Get all released schedules
router.get("/released-schedules", getReleasedSchedules);

// Update schedule status (approve/reject)
router.put("/schedules/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, approved_by } = req.body;

  if (!req.user || req.user.role !== "staff") {
    return res.status(403).json({ error: "Access denied" });
  }

  const now = new Date();
  try {
    await db.query(
      `UPDATE schedules 
       SET status = ?, approved_by = ?, approved_at = ? 
       WHERE id = ?`,
      [status, approved_by, now, id]
    );
    res.json({ message: `Schedule ${status.toLowerCase()} successfully.` });
  } catch (err) {
    console.error("Error updating schedule status:", err);
    res.status(500).json({ error: "Failed to update schedule status" });
  }
});

// ---------------- Release / Return ----------------
// Mark schedule as Released
router.put("/schedules/:id/release", staffController.releaseSchedule);

// Mark schedule as Returned
router.put("/schedules/:id/return", staffController.returnSchedule);

// ---------------- Returned Schedules ----------------
router.get("/returned-schedules", returnedSchedulesController);

// Mark a file as printed
// ---------------- Files ----------------

// Mark a file as printed (matches frontend POST)
router.post("/print/file/:id", staffController.markFileAsPrinted);


// Get all printed files
router.get("/printed-files", staffController.getPrintedFiles);

// Mark file as claimed (staff only)
router.post("/claimed-file/:id", staffController.markFileAsClaimed);
// Notify resident that their file is ready
router.put("/printed-files/:id/notify", staffController.notifyResident);

// Mark printed file as claimed
router.put("/printed-files/:id/claim", staffController.markFileAsClaimed);

module.exports = router;

const db = require("../config/db");

// ---------------- Resident Routes ---------------- //

// Get total pages for a specific date (query param: ?date=YYYY-MM-DD)
exports.getDailyTotal = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "date is required" });

  try {
    const [rows] = await db.query(
      `SELECT SUM(page_count) AS totalPages
       FROM resident_requests
       WHERE date_needed = ? AND status IN ('pending', 'approved')`,
      [date]
    );
    res.json({ date, totalPages: rows[0].totalPages || 0 });
  } catch (err) {
    console.error("Daily total error:", err);
    res.status(500).json({ error: "Failed to fetch daily total" });
  }
};

// Get files uploaded by the logged-in resident
exports.getResidentFiles = async (req, res) => {
  const residentId = req.user.id;
  try {
    const [rows] = await db.query(
      `SELECT id, filename, status, created_at, date_needed, page_count
       FROM resident_requests
       WHERE resident_id = ?
       ORDER BY created_at DESC`,
      [residentId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

// Upload a new file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const residentId = req.user.id;
    const { dateNeeded, pageCount } = req.body;
    const pages = Number(pageCount);

    if (!dateNeeded || !pages || pages <= 0) {
      return res.status(400).json({ error: "Invalid page count or date" });
    }

    // Fetch dynamic limits
    const [limitRows] = await db.query("SELECT type, value FROM upload_limits");
    const limits = Object.fromEntries(limitRows.map(r => [r.type, r.value]));

    // Defaults updated to 30 per resident, 100 global
    const MAX_RESIDENT_DAILY = limits.resident || 30;
    const MAX_TOTAL_DAILY = limits.global || 100;

    // Check resident daily total
    const [residentRows] = await db.query(
      `SELECT SUM(page_count) AS total FROM resident_requests
       WHERE date_needed = ? AND resident_id = ? AND status IN ('pending','approved')`,
      [dateNeeded, residentId]
    );
    const residentTotal = residentRows[0].total || 0;
    const remainingResident = MAX_RESIDENT_DAILY - residentTotal;
    if (pages > remainingResident) {
      return res.status(400).json({
        error: `❌ You can only upload ${remainingResident} more pages for ${dateNeeded}. Already uploaded: ${residentTotal}.`
      });
    }

    // Check global daily total
    const [globalRows] = await db.query(
      `SELECT SUM(page_count) AS total FROM resident_requests
       WHERE date_needed = ? AND status IN ('pending','approved')`,
      [dateNeeded]
    );
    const globalTotal = globalRows[0].total || 0;
    const remainingGlobal = MAX_TOTAL_DAILY - globalTotal;
    if (pages > remainingGlobal) {
      return res.status(400).json({
        error: `❌ Only ${remainingGlobal} pages left for ${dateNeeded}. Total limit: ${MAX_TOTAL_DAILY}.`
      });
    }

    // Insert record
    await db.query(
      `INSERT INTO resident_requests
       (resident_id, filename, status, created_at, date_needed, page_count)
       VALUES (?, ?, 'pending', NOW(), ?, ?)`,
      [residentId, req.file.filename, dateNeeded, pages]
    );

    res.json({
      message: "✅ File uploaded",
      filename: req.file.filename,
      status: "pending",
      date_needed: dateNeeded,
      page_count: pages,
      remainingResident,
      remainingGlobal,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

// Check availability for a single date
exports.checkAvailability = async (req, res) => {
  const { date } = req.params;
  const residentId = req.user.id;
  if (!date) return res.status(400).json({ error: "date is required" });

  try {
    const [limitRows] = await db.query("SELECT type, value FROM upload_limits");
    const limits = Object.fromEntries(limitRows.map(r => [r.type, r.value]));

    const MAX_TOTAL_DAILY = limits.global || 100;
    const MAX_RESIDENT_DAILY = limits.resident || 30;

    const [globalRows] = await db.query(
      `SELECT SUM(page_count) AS total FROM resident_requests
       WHERE date_needed = ? AND status IN ('pending','approved')`,
      [date]
    );
    const [residentRows] = await db.query(
      `SELECT SUM(page_count) AS total FROM resident_requests
       WHERE date_needed = ? AND resident_id = ? AND status IN ('pending','approved')`,
      [date, residentId]
    );

    res.json({
      date,
      totalPages: globalRows[0].total || 0,
      residentPages: residentRows[0].total || 0,
      slotsLeft: Math.max(0, MAX_TOTAL_DAILY - (globalRows[0].total || 0)),
      residentSlotsLeft: Math.max(0, MAX_RESIDENT_DAILY - (residentRows[0].total || 0)),
      isFull: (globalRows[0].total || 0) >= MAX_TOTAL_DAILY,
      residentFull: (residentRows[0].total || 0) >= MAX_RESIDENT_DAILY,
    });
  } catch (err) {
    console.error("Error checking availability:", err);
    res.status(500).json({ error: "Failed to check availability" });
  }
};

// Get availability for all dates
exports.getAvailability = async (req, res) => {
  const residentId = req.user.id;
  try {
    const [rows] = await db.query(
      `SELECT date_needed,
              SUM(page_count) AS totalPages,
              SUM(CASE WHEN resident_id = ? THEN page_count ELSE 0 END) AS residentPages
       FROM resident_requests
       WHERE status IN ('pending','approved')
       GROUP BY date_needed`,
      [residentId]
    );

    const [limitRows] = await db.query("SELECT type, value FROM upload_limits");
    const limits = Object.fromEntries(limitRows.map(r => [r.type, r.value]));

    const MAX_TOTAL_DAILY = limits.global || 100;
    const MAX_RESIDENT_DAILY = limits.resident || 30;

    const availability = rows.map(r => ({
      date_needed: r.date_needed,
      totalPages: r.totalPages,
      residentPages: r.residentPages,
      slotsLeft: Math.max(0, MAX_TOTAL_DAILY - r.totalPages),
      residentSlotsLeft: Math.max(0, MAX_RESIDENT_DAILY - r.residentPages),
      isFull: r.totalPages >= MAX_TOTAL_DAILY,
      residentFull: r.residentPages >= MAX_RESIDENT_DAILY,
    }));

    res.json({ limits: { resident: MAX_RESIDENT_DAILY, global: MAX_TOTAL_DAILY }, dates: availability });
  } catch (err) {
    console.error("Error fetching availability:", err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
};


// ---------------- Staff Routes ---------------- //

// Get all resident requests (for staff)
exports.getAllFilesForStaff = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, res.username AS resident_username
       FROM resident_requests r
       JOIN residents res ON r.resident_id = res.id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching all files:", err);
    res.status(500).json({ error: "Failed to fetch all files" });
  }
};

// Get files of a specific resident
exports.getFilesByResident = async (req, res) => {
  const { residentId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT r.*, res.username AS resident_username
       FROM resident_requests r
       JOIN residents res ON r.resident_id = res.id
       WHERE r.resident_id = ?
       ORDER BY r.created_at DESC`,
      [residentId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching resident files:", err);
    res.status(500).json({ error: "Failed to fetch resident files" });
  }
};

// Update file status (approve/reject)
exports.updateFileStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const staffId = req.user.id;
    const fileId = req.params.id;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const [result] = await db.query(
      `UPDATE resident_requests 
       SET status = ?, approved_by = ?, approved_at = NOW() 
       WHERE id = ?`,
      [status, staffId, fileId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json({ message: "File status updated successfully" });
  } catch (err) {
    console.error("Error updating file status:", err);
    res.status(500).json({ error: "Failed to update file status" });
  }
};

// Get all residents
exports.getAllResidents = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT id, username FROM residents`);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching residents:", err);
    res.status(500).json({ error: "Failed to fetch residents" });
  }
};

// Get accepted files (with staff and resident info)
exports.getAcceptedFiles = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.id AS request_id, r.filename, r.resident_id, r.approved_by, r.approved_at,
              res.username AS resident_username,
              s.username AS staff_username
       FROM resident_requests r
       JOIN residents res ON r.resident_id = res.id
       LEFT JOIN staff s ON r.approved_by = s.id
       WHERE r.status = 'approved'
       ORDER BY r.approved_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching accepted files:", err);
    res.status(500).json({ error: "Failed to fetch accepted files" });
  }
};

// Get residents with pending requests (for staff inbox)
exports.getResidentsWithPending = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.id, r.username, COUNT(rr.id) AS pending_count
       FROM residents r
       JOIN resident_requests rr ON r.id = rr.resident_id
       WHERE rr.status = 'pending'
       GROUP BY r.id, r.username
       ORDER BY r.username`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching residents with pending:", err);
    res.status(500).json({ error: "Failed to fetch pending residents" });
  }
};

// Get schedules of a specific resident (pending only)
exports.getSchedulesByResident = async (req, res) => {
  const { residentId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT * FROM resident_schedules
       WHERE resident_id = ? AND status = 'Pending'
       ORDER BY created_at DESC`,
      [residentId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching resident schedules:", err);
    res.status(500).json({ error: "Failed to fetch resident schedules" });
  }
};

// Get all approved schedules (for staff accepted list)
exports.getAcceptedSchedules = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.id AS schedule_id, s.user_id, s.item, s.quantity,
              s.date_from, s.date_to, s.time_from, s.time_to,
              s.status, s.approved_by, s.approved_at,
              u.username AS resident_username,
              st.username AS staff_username
       FROM resident_schedules s
       JOIN residents u ON s.user_id = u.id
       LEFT JOIN staff st ON s.approved_by = st.id
       WHERE s.status = 'Approved'
       ORDER BY s.approved_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching accepted schedules:", err);
    res.status(500).json({ error: "Failed to fetch accepted schedules" });
  }
};

const db = require("../config/db");

// ---------------- Resident Routes ---------------- //


// Cancel/delete a file request (resident only)
exports.cancelFileRequest = async (req, res) => {
  try {
    const fileId = req.params.id;
    const residentId = req.user.id;

    // Check if file exists and belongs to resident
    const [fileRows] = await db.query(
      `SELECT * FROM resident_requests 
       WHERE id = ? AND resident_id = ? AND status = 'pending'`,
      [fileId, residentId]
    );

    if (fileRows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "File not found or cannot be cancelled" 
      });
    }

    // Delete the file request
    await db.query(
      `DELETE FROM resident_requests 
       WHERE id = ? AND resident_id = ?`,
      [fileId, residentId]
    );

    // Also delete the actual file from uploads folder
    const file = fileRows[0];
    const filePath = path.join(__dirname, "../uploads", file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: "Request cancelled successfully"
    });
  } catch (err) {
    console.error("Cancel error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to cancel request" 
    });
  }
};

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
  try {
    const residentId = req.user.id;
    
    const [rows] = await db.query(
      `SELECT 
        id,
        filename,
        original_name,
        status,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
        date_needed,
        page_count,
        purpose,
        special_instructions,
        approved_by,
        DATE_FORMAT(approved_at, '%Y-%m-%d %H:%i:%s') as approved_at,
        released_by,
        DATE_FORMAT(released_at, '%Y-%m-%d %H:%i:%s') as released_at,
        claimed_by,
        DATE_FORMAT(claimed_at, '%Y-%m-%d %H:%i:%s') as claimed_at,
        printed_by,
        DATE_FORMAT(printed_at, '%Y-%m-%d %H:%i:%s') as printed_at,
        notified_by,
        DATE_FORMAT(notified_at, '%Y-%m-%d %H:%i:%s') as notified_at
       FROM resident_requests 
       WHERE resident_id = ?
       ORDER BY created_at DESC`,
      [residentId]
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    console.error("Error fetching resident files:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch files" 
    });
  }
};


// Upload a new file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const residentId = req.user.id;
    const { purpose, dateNeeded, pageCount, specialInstructions } = req.body;

    // Validate required fields
    if (!purpose || !dateNeeded || !pageCount) {
      return res.status(400).json({ 
        error: "Purpose, date needed, and page count are required" 
      });
    }

    const pages = parseInt(pageCount);
    if (isNaN(pages) || pages <= 0) {
      return res.status(400).json({ error: "Invalid page count" });
    }

    // Check resident daily limit (30 pages)
    const [residentRows] = await db.query(
      `SELECT COALESCE(SUM(page_count), 0) AS total 
       FROM resident_requests 
       WHERE resident_id = ? 
         AND date_needed = ? 
         AND status IN ('pending', 'approved')`,
      [residentId, dateNeeded]
    );

    const residentUsed = residentRows[0].total || 0;
    const residentLimit = 30; // Daily limit per resident
    const residentRemaining = residentLimit - residentUsed;

    if (pages > residentRemaining) {
      return res.status(400).json({
        error: `You can only upload ${residentRemaining} more pages for ${dateNeeded}`,
        limit: residentLimit,
        used: residentUsed,
        remaining: residentRemaining,
        requested: pages
      });
    }

    // Check system daily limit (100 pages total)
    const [globalRows] = await db.query(
      `SELECT COALESCE(SUM(page_count), 0) AS total 
       FROM resident_requests 
       WHERE date_needed = ? 
         AND status IN ('pending', 'approved')`,
      [dateNeeded]
    );

    const globalUsed = globalRows[0].total || 0;
    const systemLimit = 100; // System-wide daily limit
    const systemRemaining = systemLimit - globalUsed;

    if (pages > systemRemaining) {
      return res.status(400).json({
        error: `Only ${systemRemaining} pages left in system for ${dateNeeded}`,
        limit: systemLimit,
        used: globalUsed,
        remaining: systemRemaining,
        requested: pages
      });
    }

    // Insert the file request
    const [result] = await db.query(
      `INSERT INTO resident_requests 
       (resident_id, filename, original_name, status, created_at, 
        date_needed, page_count, purpose, special_instructions)
       VALUES (?, ?, ?, 'pending', NOW(), ?, ?, ?, ?)`,
      [
        residentId,
        req.file.filename,
        req.file.originalname,
        dateNeeded,
        pages,
        purpose,
        specialInstructions || null
      ]
    );

    // Get the inserted record
    const [newRecord] = await db.query(
      `SELECT * FROM resident_requests WHERE id = ?`,
      [result.insertId]
    );

    res.json({
      success: true,
      message: "✅ File uploaded successfully!",
      data: newRecord[0],
      limits: {
        resident: {
          limit: residentLimit,
          used: residentUsed + pages,
          remaining: residentRemaining - pages
        },
        system: {
          limit: systemLimit,
          used: globalUsed + pages,
          remaining: systemRemaining - pages
        }
      }
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ 
      success: false,
      error: "Upload failed. Please try again." 
    });
  }
};

// Check availability for a single date
// Sa checkAvailability function
exports.checkAvailability = async (req, res) => {
  try {
    const { date } = req.params;
    const residentId = req.user.id;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const residentLimit = 30;
    const systemLimit = 100;

    // Get resident's usage for the date
    const [residentRows] = await db.query(
      `SELECT COALESCE(SUM(page_count), 0) AS total 
       FROM resident_requests 
       WHERE resident_id = ? 
         AND date_needed = ? 
         AND status IN ('pending', 'approved')`,
      [residentId, date]
    );

    // Get system-wide usage for the date
    const [globalRows] = await db.query(
      `SELECT COALESCE(SUM(page_count), 0) AS total 
       FROM resident_requests 
       WHERE date_needed = ? 
         AND status IN ('pending', 'approved')`,
      [date]
    );

    const residentUsed = residentRows[0].total || 0;
    const systemUsed = globalRows[0].total || 0;

    res.json({
      date,
      residentLimit,
      systemLimit,
      residentUsed,
      systemUsed,
      residentRemaining: Math.max(0, residentLimit - residentUsed),
      systemRemaining: Math.max(0, systemLimit - systemUsed),
      residentFull: residentUsed >= residentLimit,
      systemFull: systemUsed >= systemLimit
    });
  } catch (err) {
    console.error("Availability check error:", err);
    res.status(500).json({ error: "Failed to check availability" });
  }
};


// Get all dates availability (for calendar)
exports.getAllAvailability = async (req, res) => {
  try {
    const residentId = req.user.id;
    const residentLimit = 30;
    const systemLimit = 100;

    const [rows] = await db.query(
      `SELECT 
        date_needed,
        COALESCE(SUM(page_count), 0) as total_pages,
        COALESCE(SUM(CASE WHEN resident_id = ? THEN page_count ELSE 0 END), 0) as resident_pages
       FROM resident_requests
       WHERE status IN ('pending', 'approved')
       GROUP BY date_needed
       ORDER BY date_needed`,
      [residentId]
    );

    const availability = rows.map(row => ({
      date_needed: row.date_needed,
      total_pages: row.total_pages,
      resident_pages: row.resident_pages,
      system_remaining: Math.max(0, systemLimit - row.total_pages),
      resident_remaining: Math.max(0, residentLimit - row.resident_pages),
      system_full: row.total_pages >= systemLimit,
      resident_full: row.resident_pages >= residentLimit
    }));

    res.json({
      success: true,
      data: availability,
      limits: {
        resident: residentLimit,
        system: systemLimit
      }
    });
  } catch (err) {
    console.error("Error fetching all availability:", err);
    res.status(500).json({ error: "Failed to fetch availability" });
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

    // Get limits from database
    const [limitRows] = await db.query(`
      SELECT 
        MAX(CASE WHEN type = 'global' AND staff_id IS NULL THEN value END) as system_limit,
        MAX(CASE WHEN type = 'resident' AND staff_id IS NULL THEN value END) as resident_limit
      FROM upload_limits
    `);

    const MAX_TOTAL_DAILY = limitRows[0].system_limit || 100;
    const MAX_RESIDENT_DAILY = limitRows[0].resident_limit || 30;

    const availability = rows.map(r => ({
      date_needed: r.date_needed,
      totalPages: r.totalPages,
      residentPages: r.residentPages,
      slotsLeft: Math.max(0, MAX_TOTAL_DAILY - r.totalPages),
      residentSlotsLeft: Math.max(0, MAX_RESIDENT_DAILY - r.residentPages),
      systemLimit: MAX_TOTAL_DAILY,      // IMPORTANT: Include the limit
      residentLimit: MAX_RESIDENT_DAILY, // IMPORTANT: Include the limit
      isFull: r.totalPages >= MAX_TOTAL_DAILY,
      residentFull: r.residentPages >= MAX_RESIDENT_DAILY,
    }));

    res.json({ 
      limits: { 
        system: MAX_TOTAL_DAILY, 
        resident: MAX_RESIDENT_DAILY 
      }, 
      dates: availability 
    });
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
       LEFT JOIN staff s ON r.approved_by = s.id  -- siguraduhing approved_by ang column ng staff ID
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


// Get upload limits
exports.getLimits = async (req, res) => {
  try {
    // You can store limits in a database table or use hardcoded values
    const [limitRows] = await db.query(
      `SELECT type, value FROM upload_limits WHERE staff_id IS NULL`
    );

    // If no limits in database, use defaults
    let limits = [];
    if (limitRows.length > 0) {
      limits = limitRows;
    } else {
      // Default limits
      limits = [
        { type: 'resident', value: 30, description: 'Daily page limit per resident' },
        { type: 'global', value: 100, description: 'Daily system-wide page limit' }
      ];
    }

    res.json({
      success: true,
      data: {
        limits: limits
      }
    });
  } catch (err) {
    console.error("Error fetching limits:", err);
    res.json({
      success: true,
      data: {
        limits: [
          { type: 'resident', value: 30 },
          { type: 'global', value: 100 }
        ]
      }
    });
  }
};
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



// ---------------- Get Accepted Schedules ----------------
const getAcceptedSchedules = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, r.username AS resident_username, st.username AS staff_username
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
};

// ---------------- Release Schedule ----------------
const releaseSchedule = async (req, res) => {
  const { id } = req.params;

  if (!req.user || req.user.role !== "staff") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const [result] = await db.query(
      `UPDATE schedules
       SET status = 'Released', released_at = NOW(), released_by = ?
       WHERE id = ? AND status = 'Approved'`,
      [req.user.id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Schedule not found or not approved" });
    }

    res.json({ message: "Schedule released successfully." });
  } catch (err) {
    console.error("Error releasing schedule:", err);
    res.status(500).json({ error: "Failed to release schedule" });
  }
};

// ---------------- Return Schedule ----------------
// In staffController.js or wherever returnSchedule function is:
const returnSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { return_condition, damage_description } = req.body;
    
    // Get schedule details first
    const [schedule] = await db.query(
      "SELECT item, quantity FROM schedules WHERE id = ?",
      [id]
    );
    
    if (schedule.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    
    const { item, quantity } = schedule[0];
    
    // Update schedule as returned
    const [result] = await db.query(
      `UPDATE schedules 
       SET status = 'Returned', 
           returned_at = NOW(),
           return_condition = ?,
           damage_description = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [return_condition || 'Good', damage_description || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    
    // ✅ ✅ ✅ IMPORTANT: RETURN QUANTITY TO AVAILABLE STOCK ✅ ✅ ✅
    await db.query(
      `UPDATE items SET available = available + ? WHERE item_name = ?`,
      [quantity, item]
    );
    
    console.log(`✅ Returned ${quantity} ${item} to available stock`);
    
    res.json({ 
      success: true, 
      message: "Schedule returned successfully",
      item,
      quantity_returned: quantity
    });
  } catch (err) {
    console.error("Error returning schedule:", err);
    res.status(500).json({ error: "Failed to return schedule" });
  }
};

// ---------------- Get Released Schedules ----------------
const getReleasedSchedules = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, r.username AS resident_username, st.username AS released_by_username
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

// ---------------- Get Returned Schedules ----------------
const getReturnedSchedules = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, r.username AS resident_username, st.username AS returned_by_username
      FROM schedules s
      JOIN residents r ON s.user_id = r.id
      LEFT JOIN staff st ON s.returned_by = st.id
      WHERE s.status = 'Returned'
      ORDER BY s.returned_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching returned schedules:", err);
    res.status(500).json({ error: "Failed to fetch returned schedules" });
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
// StaffInboxController.js - Add at the top
const emailService = require('../services/emailService'); // Make sure path is correct

// ---------------- Notify Resident ----------------
const notifyResident = async (req, res) => {
  const fileId = req.params.id;

  if (!req.user || req.user.role !== "staff") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    // Gamitin ang full_name (STORED GENERATED column)
    const [files] = await db.query(`
      SELECT rr.*, 
             r.username, 
             r.email, 
             r.full_name as resident_name,
             r.first_name,
             r.last_name,
             CONCAT(r.first_name, ' ', r.last_name) as simple_name
      FROM resident_requests rr
      JOIN residents r ON rr.resident_id = r.id
      WHERE rr.id = ? AND rr.status = 'Printed'
    `, [fileId]);

    if (files.length === 0) {
      return res.status(404).json({ error: "File not found or not ready to notify" });
    }

    const file = files[0];
    const residentEmail = file.email;
    
    // Gamitin ang full_name, kung wala, gumamit ng CONCAT ng first at last name
    const residentName = file.resident_name || 
                        file.simple_name || 
                        `${file.first_name} ${file.last_name}` || 
                        file.username;
    
    const fileName = file.filename || file.original_name;

    // Update file status
    const [result] = await db.query(
      `UPDATE resident_requests
       SET status = 'go_to_pickup', notified_at = NOW(), notified_by = ?
       WHERE id = ? AND status = 'Printed'`,
      [req.user.id, fileId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "File not found or not ready to notify" });
    }

    // Send email notification
    try {
      await emailService.sendPickupNotification(
        residentEmail,
        residentName,
        fileName,
        {
          requestDate: file.created_at ? new Date(file.created_at).toLocaleDateString('en-PH') : null,
          instructions: file.special_instructions || null,
          pickupDeadline: null
        }
      );
      
      console.log(`✅ Pickup email sent to ${residentEmail} for file ${fileName}`);
      
      res.json({ 
        success: true, 
        message: "Resident notified successfully. Email sent!",
        data: {
          fileId: file.id,
          status: 'go_to_pickup',
          notifiedAt: new Date(),
          resident: {
            name: residentName,
            email: residentEmail
          }
        }
      });
      
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError);
      
      // Still return success but with warning
      res.json({ 
        success: true, 
        message: "Resident notified but email failed to send.",
        warning: "Email notification failed",
        data: {
          fileId: file.id,
          status: 'go_to_pickup',
          notifiedAt: new Date()
        }
      });
    }
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
// ---------------- Page Limits Management ----------------

// Get all page limits
const getLimits = async (req, res) => {
  try {
    const [limits] = await db.query(`
      SELECT 
        ul.id,
        ul.type,
        ul.value,
        ul.staff_id,
        ul.description,
        ul.updated_at,
        s.username as staff_username,
        s.name as staff_name,
        st.username as updated_by_username
      FROM upload_limits ul
      LEFT JOIN staff s ON ul.staff_id = s.id
      LEFT JOIN staff st ON ul.updated_by = st.id
      ORDER BY 
        CASE 
          WHEN ul.staff_id IS NULL THEN 0 
          ELSE 1 
        END,
        ul.type
    `);
    
    res.json({ success: true, data: limits });
  } catch (err) {
    console.error("Error fetching limits:", err);
    res.status(500).json({ success: false, error: "Failed to fetch limits" });
  }
};

// Update or create limit
const updateLimit = async (req, res) => {
  try {
    const { type, value, staff_id, description } = req.body;
    const updated_by = req.user.id; // Current staff making the change

    if (!type || !value || value <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: "INVALID_PARAMETERS",
        message: "Type and value are required" 
      });
    }

    // Check if limit exists
    const [existing] = await db.query(
      `SELECT * FROM upload_limits 
       WHERE type = ? AND (staff_id <=> ?)`,
      [type, staff_id || null]
    );

    if (existing.length > 0) {
      // Update existing
      await db.query(
        `UPDATE upload_limits 
         SET value = ?, description = ?, updated_by = ?, updated_at = NOW()
         WHERE type = ? AND (staff_id <=> ?)`,
        [value, description, updated_by, type, staff_id || null]
      );
    } else {
      // Insert new
      await db.query(
        `INSERT INTO upload_limits (type, value, staff_id, description, updated_by)
         VALUES (?, ?, ?, ?, ?)`,
        [type, value, staff_id || null, description, updated_by]
      );
    }

    res.json({ 
      success: true, 
      message: "✅ Limit updated successfully",
      data: { type, value, staff_id, description }
    });
  } catch (err) {
    console.error("Error updating limit:", err);
    res.status(500).json({ 
      success: false, 
      error: "UPDATE_FAILED",
      message: "Failed to update limit" 
    });
  }
};

// Delete a staff limit
const deleteStaffLimit = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query(
      `DELETE FROM upload_limits WHERE id = ? AND staff_id IS NOT NULL`,
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "NOT_FOUND",
        message: "Staff limit not found or cannot delete global limits" 
      });
    }
    
    res.json({ success: true, message: "✅ Staff limit deleted successfully" });
  } catch (err) {
    console.error("Error deleting limit:", err);
    res.status(500).json({ 
      success: false, 
      error: "DELETE_FAILED",
      message: "Failed to delete limit" 
    });
  }
};

// Get staff members for management
const getStaffForManagement = async (req, res) => {
  try {
    const [staff] = await db.query(`
      SELECT 
        s.id,
        s.username,
        s.name,
        s.email,
        s.role,
        COALESCE(ul.value, 50) as page_limit,
        ul.id as limit_id,
        ul.description as limit_description,
        COUNT(DISTINCT ra.resident_id) as assigned_residents
      FROM staff s
      LEFT JOIN upload_limits ul ON s.id = ul.staff_id AND ul.type = 'staff_daily'
      LEFT JOIN resident_assignments ra ON s.id = ra.staff_id
      WHERE s.role = 'staff'
      GROUP BY s.id
      ORDER BY s.name
    `);
    
    res.json({ success: true, data: staff });
  } catch (err) {
    console.error("Error fetching staff:", err);
    res.status(500).json({ 
      success: false, 
      error: "FETCH_FAILED",
      message: "Failed to fetch staff data" 
    });
  }
};
module.exports = {
  getStaffInbox,
  releaseSchedule,
  returnSchedule,
  getAcceptedSchedules, 
  getReleasedSchedules,
  getReturnedSchedules,
  markFileAsPrinted,
  markFileAsClaimed,
  getPrintedFiles,
  notifyResident,
  cancelFileRequest,
  // Add these new exports for page limits
  getLimits,
  updateLimit,
  deleteStaffLimit,
  getStaffForManagement,
};
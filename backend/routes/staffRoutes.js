const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");

const fileController = require("../controllers/fileController");
const staffController = require("../controllers/staffController");
const { getStaffInbox } = require("../controllers/StaffInboxController");
const { returnedSchedulesController } = require("../controllers/returnedSchedulesController");
const { getReleasedSchedules } = require("../controllers/staffController");
const authController = require("../controllers/authController");

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

// Email notification for schedules
router.post("/schedules/:id/email", async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message } = req.body;
    const staffId = req.user.id;

    console.log(`📧 Sending email for schedule ${id}`);

    // Get schedule details
    const [schedule] = await db.query(`
      SELECT s.*, 
             r.username as resident_username, 
             r.full_name as resident_name,
             r.email,
             st.username as staff_username
      FROM schedules s
      LEFT JOIN residents r ON s.user_id = r.id
      LEFT JOIN staff st ON s.approved_by = st.id
      WHERE s.id = ?
    `, [id]);

    if (!schedule || schedule.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const scheduleData = schedule[0];
    
    // Check if email exists
    if (!scheduleData.email) {
      return res.status(400).json({ 
        error: 'Resident has no email address',
        details: 'Cannot send notification without email'
      });
    }

    // Send email using EmailService
    const emailService = require("../services/emailService");
    
    try {
      await emailService.sendScheduleNotification(
        scheduleData.email,
        scheduleData.resident_name || scheduleData.resident_username,
        {
          item: scheduleData.item,
          quantity: scheduleData.quantity,
          date_from: scheduleData.date_from,
          date_to: scheduleData.date_to,
          time_from: scheduleData.time_from,
          time_to: scheduleData.time_to
        }
      );
      
      console.log('✅ Email sent successfully');
      
      // Update schedule status to "Ready"
      await db.query(
        'UPDATE schedules SET status = ?, updated_at = NOW() WHERE id = ?',
        ['Ready', id]
      );

      res.json({ 
        success: true, 
        message: 'Resident notified successfully via email',
        details: {
          resident: scheduleData.resident_username,
          item: scheduleData.item,
          email: scheduleData.email,
          status: 'Ready'
        }
      });
      
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Still update status but inform about email failure
      await db.query(
        'UPDATE schedules SET status = ?, updated_at = NOW() WHERE id = ?',
        ['Ready', id]
      );
      
      res.status(207).json({ // 207 Multi-Status
        success: true,
        warning: 'Status updated but email failed to send',
        message: 'Schedule status updated to Ready',
        details: {
          resident: scheduleData.resident_username,
          item: scheduleData.item,
          email_error: emailError.message
        }
      });
    }

  } catch (error) {
    console.error('Email notification error:', error);
    res.status(500).json({ 
      error: 'Failed to notify resident',
      details: error.message 
    });
  }
});
// Notify resident schedule is ready
router.put("/schedules/:id/notify", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'UPDATE schedules SET status = "Ready", updated_at = NOW() WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json({ 
      success: true, 
      message: "Schedule status updated to Ready" 
    });
  } catch (err) {
    console.error("Notify error:", err);
    res.status(500).json({ error: "Failed to update schedule status" });
  }
});

// ---------------- Page Limits Management ----------------
// Get all page limits
router.get("/page-limits", staffController.getLimits);

// Update or create page limit
router.post("/page-limits", staffController.updateLimit);

// Delete staff-specific limit
router.delete("/page-limits/staff/:id", staffController.deleteStaffLimit);

// Get staff members for management
router.get("/staff/manage", staffController.getStaffForManagement);

// Assign resident to staff
router.post("/assign-resident", async (req, res) => {
  try {
    const { resident_id, staff_id } = req.body;
    
    // Check if assignment exists
    const [existing] = await db.query(
      `SELECT * FROM resident_assignments WHERE resident_id = ?`,
      [resident_id]
    );
    
    if (existing.length > 0) {
      // Update existing assignment
      await db.query(
        `UPDATE resident_assignments SET staff_id = ? WHERE resident_id = ?`,
        [staff_id, resident_id]
      );
    } else {
      // Create new assignment
      await db.query(
        `INSERT INTO resident_assignments (resident_id, staff_id) VALUES (?, ?)`,
        [resident_id, staff_id]
      );
    }
    
    res.json({ success: true, message: "Resident assigned successfully" });
  } catch (err) {
    console.error("Error assigning resident:", err);
    res.status(500).json({ error: "Failed to assign resident" });
  }
});

// Get assigned residents for a staff
router.get("/assigned-residents/:staff_id", async (req, res) => {
  try {
    const { staff_id } = req.params;
    
    const [residents] = await db.query(`
      SELECT 
        r.id,
        r.username,
        r.name,
        r.email,
        ra.assigned_at,
        COALESCE(SUM(rr.page_count), 0) as total_pages,
        COUNT(rr.id) as total_requests
      FROM resident_assignments ra
      JOIN residents r ON ra.resident_id = r.id
      LEFT JOIN resident_requests rr ON r.id = rr.resident_id
        AND rr.date_needed = CURDATE()
        AND rr.status IN ('pending', 'approved')
      WHERE ra.staff_id = ?
      GROUP BY r.id
      ORDER BY ra.assigned_at DESC
    `, [staff_id]);
    
    res.json({ success: true, data: residents });
  } catch (err) {
    console.error("Error fetching assigned residents:", err);
    res.status(500).json({ error: "Failed to fetch assigned residents" });
  }
});

// Get today's page usage
router.get("/usage/today", async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [usage] = await db.query(`
      SELECT 
        COALESCE(SUM(page_count), 0) as total_pages,
        COUNT(DISTINCT resident_id) as total_residents,
        COUNT(*) as total_requests
      FROM resident_requests
      WHERE date_needed = ? 
        AND status IN ('pending', 'approved')
    `, [today]);
    
    // Get limits
    const [limits] = await db.query(`
      SELECT 
        MAX(CASE WHEN type = 'global' AND staff_id IS NULL THEN value END) as system_limit,
        MAX(CASE WHEN type = 'resident' AND staff_id IS NULL THEN value END) as resident_limit
      FROM upload_limits
    `);
    
    res.json({
      ...usage[0],
      ...limits[0],
      system_usage_percentage: limits[0].system_limit 
        ? Math.round((usage[0].total_pages / limits[0].system_limit) * 100) 
        : 0
    });
  } catch (err) {
    console.error("Error fetching today's usage:", err);
    res.status(500).json({ error: "Failed to fetch usage data" });
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
  
  console.log("Approving schedule:", {
    scheduleId: id,
    status: status,
    approved_by: approved_by,
    staffId: req.user.id,
    staffRole: req.user.role
  });

  if (!req.user || req.user.role !== "staff") {
    return res.status(403).json({ error: "Access denied" });
  }

  const staffId = req.user.id;
  const now = new Date();
  
  try {
    // First, verify the staff exists
    const [staff] = await db.query(
      "SELECT id, name, username FROM staff WHERE id = ?",
      [staffId]
    );
    
    console.log("Staff found:", staff[0]);
    
    // Update the schedule
    const [result] = await db.query(
      `UPDATE schedules 
       SET status = ?, approved_by = ?, approved_at = ? 
       WHERE id = ?`,
      [status.toUpperCase(), staffId, now, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    
    // Get the updated schedule with staff info
    const [updatedSchedule] = await db.query(`
      SELECT s.*, r.username as resident_username,
             st.name as staff_name, st.username as staff_username
      FROM schedules s
      JOIN residents r ON s.user_id = r.id
      LEFT JOIN staff st ON s.approved_by = st.id
      WHERE s.id = ?
    `, [id]);
    
    res.json({ 
      success: true,
      message: `Schedule ${status.toLowerCase()} successfully.`,
      data: updatedSchedule[0]
    });
    
  } catch (err) {
    console.error("Error updating schedule status:", err);
    res.status(500).json({ error: "Failed to update schedule status" });
  }
});

// Resident account management
router.put("/residents/:id/status", authController.approveResident);
router.get("/residents/accounts", authController.getPendingResidents);

// ---------------- Release / Return ----------------
router.put("/schedules/:id/release", staffController.releaseSchedule);
router.put("/schedules/:id/return", staffController.returnSchedule);

// ---------------- Returned Schedules ----------------
router.get("/returned-schedules", returnedSchedulesController);

// ---------------- Printed Files ----------------
router.post("/print/file/:id", staffController.markFileAsPrinted);
router.get("/printed-files", staffController.getPrintedFiles);
router.post("/claimed-file/:id", staffController.markFileAsClaimed);
router.put("/printed-files/:id/notify", staffController.notifyResident);
router.put("/printed-files/:id/claim", staffController.markFileAsClaimed);

module.exports = router;
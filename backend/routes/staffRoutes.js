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

router.get("/residents/pending", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.id, 
        r.username,
        r.created_at,
        CONCAT(r.first_name, ' ', r.last_name) as full_name,
        
        -- File requests only
        COALESCE(f.pending_files, 0) AS pending_files,
        
        -- Schedule requests only  
        COALESCE(s.pending_schedules, 0) AS pending_schedules,
        
        -- Computer requests (for reference, but not counted)
        COALESCE(c.pending_computer_requests, 0) AS pending_computer_requests,
        
        -- Calculate only file + schedule for inbox
        (COALESCE(f.pending_files, 0) + COALESCE(s.pending_schedules, 0)) AS pending_count,
        
        -- Get latest request time from files or schedules only
        GREATEST(
          COALESCE(f.latest_file, '1970-01-01'),
          COALESCE(s.latest_schedule, '1970-01-01')
        ) AS latest_request
        
      FROM residents r
      
      LEFT JOIN (
        SELECT resident_id, 
               COUNT(*) AS pending_files,
               MAX(created_at) AS latest_file
        FROM resident_requests
        WHERE status = 'Pending'
        GROUP BY resident_id
      ) f ON r.id = f.resident_id
      
      LEFT JOIN (
        SELECT user_id, 
               COUNT(*) AS pending_schedules,
               MAX(created_at) AS latest_schedule
        FROM schedules
        WHERE status = 'Pending'
        GROUP BY user_id
      ) s ON r.id = s.user_id
      
      LEFT JOIN (
        SELECT user_id, 
               COUNT(*) AS pending_computer_requests
        FROM computer_schedule
        WHERE status = 'Pending'
        GROUP BY user_id
      ) c ON r.id = c.user_id
      
      -- Only include residents with pending files OR schedules (NOT computer)
      WHERE COALESCE(f.pending_files, 0) > 0 
         OR COALESCE(s.pending_schedules, 0) > 0
      
      ORDER BY latest_request DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching residents with pending requests:", err);
    res.status(500).json({ error: "Failed to fetch residents with pending requests" });
  }
});
// ---------------- Computer Borrowing ----------------
// Get all computer borrowing requests
router.get("/computer-requests", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT cs.*, 
             r.username AS resident_username,
             CONCAT(r.first_name, ' ', r.last_name) AS resident_full_name,
             r.email_address AS resident_email
      FROM computer_schedule cs
      LEFT JOIN residents r ON cs.user_id = r.id
      ORDER BY cs.date DESC, cs.start_time DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching computer requests:", err);
    res.status(500).json({ error: "Failed to fetch computer requests" });
  }
});

// Get computer requests by resident
router.get("/computer-requests/resident/:residentId", async (req, res) => {
  try {
    const { residentId } = req.params;
    const [rows] = await db.query(`
      SELECT cs.* 
      FROM computer_schedule cs
      WHERE cs.user_id = ?
      ORDER BY cs.date DESC, cs.start_time DESC
    `, [residentId]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching resident computer requests:", err);
    res.status(500).json({ error: "Failed to fetch computer requests" });
  }
});

router.put("/computer-requests/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const staffId = req.user.id;

    const validStatuses = ['Pending', 'Approved', 'Done', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // If cancelling, check for reason
    if (status === 'Cancelled' && !reason) {
      return res.status(400).json({ error: "Cancellation reason is required" });
    }

    // Check for conflicts if approving
    if (status === 'Approved') {
      const [request] = await db.query(
        `SELECT pc_name, date, start_time, end_time 
         FROM computer_schedule 
         WHERE id = ?`,
        [id]
      );
      
      if (request.length > 0) {
        const { pc_name, date, start_time, end_time } = request[0];
        
        const [conflicts] = await db.query(
          `SELECT COUNT(*) as count
           FROM computer_schedule
           WHERE pc_name = ? AND date = ? AND id != ? AND status = 'Approved'
           AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
          [pc_name, date, id, start_time, start_time, end_time, end_time]
        );
        
        if (conflicts[0].count > 0) {
          return res.status(400).json({ error: "PC is already booked at this time" });
        }
      }
    }

    // Build update query
    let query = `UPDATE computer_schedule SET status = ?`;
    let params = [status];
    
    // Add approved_by if approving
    if (status === 'Approved') {
      query += `, approved_by = ?`;
      params.push(staffId);
    }
    
    // Add updated_at if column exists
    const [columns] = await db.query(`SHOW COLUMNS FROM computer_schedule LIKE 'updated_at'`);
    if (columns.length > 0) {
      query += `, updated_at = NOW()`;
    }
    
    query += ` WHERE id = ?`;
    params.push(id);

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Computer request not found" });
    }

    // Get updated request for response
    const [updatedRequest] = await db.query(`
      SELECT cs.*, 
             r.email_address, 
             CONCAT(r.first_name, ' ', r.last_name) as resident_name,
             s.username as staff_username
      FROM computer_schedule cs
      LEFT JOIN residents r ON cs.user_id = r.id
      LEFT JOIN staff s ON cs.approved_by = s.id
      WHERE cs.id = ?
    `, [id]);

    // Send email notification
    if ((status === 'Approved' || status === 'Cancelled') && updatedRequest.length > 0 && updatedRequest[0].email_address) {
      try {
        const emailService = require("../services/emailService");
        await emailService.sendComputerBorrowingNotification(
          updatedRequest[0].email_address,
          updatedRequest[0].resident_name,
          {
            pc: updatedRequest[0].pc_name,
            date: updatedRequest[0].date,
            startTime: updatedRequest[0].start_time,
            endTime: updatedRequest[0].end_time,
            status: status,
            ...(reason && { reason })
          }
        );
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        // Continue even if email fails
      }
    }

    res.json({ 
      success: true, 
      message: `Computer request ${status.toLowerCase()} successfully`,
      data: updatedRequest[0] || null
    });
  } catch (err) {
    console.error("Error updating computer request status:", err);
    res.status(500).json({ error: "Failed to update computer request status" });
  }
});

// Get computer availability
router.get("/computer-availability", async (req, res) => {
  try {
    const { date, pc } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const query = `
      SELECT cs.pc_name, cs.start_time, cs.end_time, cs.status
      FROM computer_schedule cs
      WHERE cs.date = ? 
        AND cs.status IN ('Approved', 'Pending')
        ${pc ? 'AND cs.pc_name = ?' : ''}
      ORDER BY cs.pc_name, cs.start_time
    `;

    const params = pc ? [date, pc] : [date];
    const [bookings] = await db.query(query, params);

    // Generate available time slots
    const availableSlots = generateAvailableSlots(bookings, pc);
    
    res.json({
      date,
      bookings,
      availableSlots
    });
  } catch (err) {
    console.error("Error fetching computer availability:", err);
    res.status(500).json({ error: "Failed to fetch computer availability" });
  }
});

function generateAvailableSlots(bookings, specificPC = null) {
  const pcs = ["PC 1", "PC 2", "PC 3", "PC 4", "PC 5"];
  const slots = [];
  
  pcs.forEach(pc => {
    if (specificPC && specificPC !== pc) return;
    
    // Filter bookings for this PC
    const pcBookings = bookings.filter(b => b.pc_name === pc)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    
    // Start from 8:00 AM
    let currentTime = "08:00";
    const endTime = "22:00";
    
    pcBookings.forEach(booking => {
      if (booking.start_time > currentTime) {
        slots.push({
          pc,
          start_time: currentTime,
          end_time: booking.start_time,
          duration: calculateDuration(currentTime, booking.start_time),
          status: 'available'
        });
      }
      currentTime = booking.end_time;
    });
    
    // Add remaining time until 22:00
    if (currentTime < endTime) {
      slots.push({
        pc,
        start_time: currentTime,
        end_time: endTime,
        duration: calculateDuration(currentTime, endTime),
        status: 'available'
      });
    }
  });
  
  return slots;
}

function calculateDuration(start, end) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  
  return (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
}

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
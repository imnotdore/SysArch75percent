// controllers/adminController.js
const db = require("../config/db");

exports.getPageLimits = async (req, res) => {
  try {
    console.log("Admin fetching page limits...");
    
    // Since your table doesn't have 'resident' and 'global' types,
    // we need to check what types exist or use default values
    const [limits] = await db.query(`
      SELECT 
        id,
        type,
        value,
        updated_at,
        updated_by
      FROM upload_limits
      ORDER BY type
    `);
    
    console.log("Found limits:", limits);
    
    // If no limits exist in database, return defaults
    if (limits.length === 0) {
      return res.json({ 
        success: true, 
        data: [
          { type: 'resident', value: 30 },
          { type: 'global', value: 100 }
        ] 
      });
    }
    
    res.json({ 
      success: true, 
      data: limits 
    });
  } catch (err) {
    console.error("Error fetching page limits:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch page limits" 
    });
  }
};


// In controllers/adminController.js, update the updatePageLimit function:
// In controllers/adminController.js, update the updatePageLimit function:
exports.updatePageLimit = async (req, res) => {
  try {
    const { type, value } = req.body;
    const updated_by = req.user ? req.user.id : 'system';

    console.log("Updating limit:", { type, value, updated_by });

    if (!type || !value || value <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Type and positive value are required" 
      });
    }

    // Check if limit exists - use the correct column name
    const [existing] = await db.query(
      `SELECT * FROM upload_limits WHERE type = ?`,
      [type]
    );

    if (existing.length > 0) {
      // Update existing
      await db.query(
        `UPDATE upload_limits 
         SET value = ?, updated_by = ?, updated_at = NOW()
         WHERE type = ?`,
        [value, updated_by, type]
      );
      console.log(`Updated limit for type: ${type} to value: ${value}`);
    } else {
      // Insert new
      await db.query(
        `INSERT INTO upload_limits (type, value, updated_by)
         VALUES (?, ?, ?)`,
        [type, value, updated_by]
      );
      console.log(`Created new limit for type: ${type} with value: ${value}`);
    }

    res.json({ 
      success: true, 
      message: "✅ Limit updated successfully",
      data: { type, value }
    });
  } catch (err) {
    console.error("Error updating limit:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to update limit" 
    });
  }
};

// Optional: Get admin dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get item stats
    const [itemStats] = await db.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(available) as total_available,
        SUM(CASE WHEN available = 0 THEN 1 ELSE 0 END) as out_of_stock
      FROM items
    `);
    
    // Get user stats
    const [userStats] = await db.query(`
      SELECT 
        COUNT(*) as total_residents,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_residents,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_residents
      FROM residents
    `);
    
    // Get recent requests
    const [recentRequests] = await db.query(`
      SELECT 
        COUNT(*) as pending_requests,
        (SELECT COUNT(*) FROM schedules WHERE status = 'Pending') as pending_schedules
      FROM resident_requests 
      WHERE status = 'Pending'
    `);
    
    // Get page limits
    const [limits] = await db.query(`
      SELECT type, value 
      FROM upload_limits 
      WHERE type IN ('resident', 'global')
    `);
    
    const residentLimit = limits.find(l => l.type === 'resident')?.value || 30;
    const globalLimit = limits.find(l => l.type === 'global')?.value || 100;
    
    res.json({
      success: true,
      data: {
        items: itemStats[0],
        users: userStats[0],
        requests: recentRequests[0],
        limits: {
          resident: residentLimit,
          global: globalLimit
        }
      }
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch dashboard statistics" 
    });
  }
};

// controllers/adminController.js - Update getTodayUsage
exports.getTodayUsage = async (req, res) => {
  try {
    const userId = req.params.userId;
    const today = new Date().toISOString().split('T')[0];
    
    console.log("Fetching today's usage for user:", userId, "Date:", today);
    
    let userTodayPages = 0;
    let systemTodayPages = 0;
    
    try {
      // Get user's today usage - use user_id column
      const [userUsage] = await db.query(`
        SELECT COALESCE(SUM(page_count), 0) as today_pages
        FROM uploaded_files
        WHERE user_id = ?
          AND DATE(uploaded_at) = ?
          AND status NOT IN ('cancelled', 'rejected')
      `, [userId, today]);
      
      console.log("User usage query result:", userUsage);
      
      // Get total system usage today
      const [systemUsage] = await db.query(`
        SELECT COALESCE(SUM(page_count), 0) as system_today_pages
        FROM uploaded_files
        WHERE DATE(uploaded_at) = ?
          AND status NOT IN ('cancelled', 'rejected')
      `, [today]);
      
      console.log("System usage query result:", systemUsage);
      
      userTodayPages = userUsage[0]?.today_pages || 0;
      systemTodayPages = systemUsage[0]?.system_today_pages || 0;
      
      console.log("Calculated usage:", {
        userTodayPages,
        systemTodayPages
      });
      
    } catch (dbError) {
      console.error("Database query error:", dbError.message);
      console.error("SQL error details:", {
        code: dbError.code,
        sqlMessage: dbError.sqlMessage,
        sql: dbError.sql
      });
      // Continue with 0 values
    }
    
    // Get limits from upload_limits table
    const [limits] = await db.query(`
      SELECT type, value 
      FROM upload_limits 
      WHERE type IN ('resident', 'global')
    `);
    
    console.log("Limits from DB:", limits);
    
    // Default values if limits don't exist
    let residentLimit = 30;
    let systemLimit = 100;
    
    // Extract limits from database
    limits.forEach(limit => {
      if (limit.type === 'resident') residentLimit = parseInt(limit.value);
      if (limit.type === 'global') systemLimit = parseInt(limit.value);
    });
    
    console.log("Final calculation:", {
      userTodayPages,
      systemTodayPages,
      residentLimit,
      systemLimit,
      remainingResident: Math.max(0, residentLimit - userTodayPages),
      remainingSystem: Math.max(0, systemLimit - systemTodayPages)
    });
    
    res.json({
      success: true,
      data: {
        userUsage: userTodayPages,
        systemUsage: systemTodayPages,
        limits: {
          resident: residentLimit,
          global: systemLimit
        },
        remaining: {
          resident: Math.max(0, residentLimit - userTodayPages),
          system: Math.max(0, systemLimit - systemTodayPages)
        }
      }
    });
    
  } catch (err) {
    console.error("Error in getTodayUsage:", err);
    // Provide fallback response
    res.json({
      success: true,
      data: {
        userUsage: 0,
        systemUsage: 0,
        limits: {
          resident: 30,
          global: 100
        },
        remaining: {
          resident: 30,
          system: 100
        }
      }
    });
  }
};
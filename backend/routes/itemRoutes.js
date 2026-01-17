// routes/itemRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const itemController = require("../controllers/itemController");

// Public: Get all items with overall availability
router.get("/", itemController.getItems);

// Public: Get overall availability (global stock)
router.get("/overall-availability", itemController.getOverallAvailability);

// Protected: Check availability per date and per time slot (requires login))))
router.get("/availability", authMiddleware(), itemController.getAvailability);


// routes/itemRoutes.js - CREATE NEW FILE

// Get all items with availability info
router.get("/", authMiddleware(["resident", "staff", "admin"]), async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT 
        i.*,
        COALESCE(w.waitlist_count, 0) as waitlist_count,
        (SELECT COUNT(*) FROM schedules s 
         WHERE s.item = i.item_name 
         AND s.status IN ('Pending', 'Approved')
         AND s.date_to >= CURDATE()) as currently_borrowed
      FROM items i
      LEFT JOIN (
        SELECT item_name, COUNT(*) as waitlist_count 
        FROM waitlist 
        GROUP BY item_name
      ) w ON i.item_name = w.item_name
      ORDER BY i.item_name ASC
    `);
    res.json(items);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// Get item availability for specific dates
// In itemRoutes.js - /api/items/availability
router.get("/availability", authMiddleware(["resident", "staff", "admin"]), async (req, res) => {
  try {
    const { item } = req.query;
    
    if (!item) {
      return res.status(400).json({ error: "Item is required" });
    }
    
    // Get item info
    const [itemData] = await db.query(
      "SELECT id, item_name, max_quantity, available FROM items WHERE item_name = ?",
      [item]
    );
    
    if (itemData.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    const maxQty = itemData[0].max_quantity;
    const currentAvailable = itemData[0].available || maxQty;
    
    // Calculate availability for next 30 days
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Get bookings for this date
      const [bookings] = await db.query(`
        SELECT COALESCE(SUM(quantity), 0) as booked
        FROM schedules
        WHERE item = ?
          AND status IN ('Pending', 'Approved')
          AND date_from <= ?
          AND date_to >= ?
      `, [item, dateStr, dateStr]);
      
      const availableForDate = maxQty - bookings[0].booked;
      
      dates.push({
        date: dateStr,
        booked: bookings[0].booked,
        available: availableForDate > 0 ? availableForDate : 0,
        status: availableForDate > 0 ? 'available' : 'unavailable'
      });
    }
    
    res.json({
      item: item,
      max_quantity: maxQty,
      current_available: currentAvailable, // This is from items.available column
      dates: dates,
      real_time_available: currentAvailable // Added for clarity
    });
  } catch (err) {
    console.error("Error fetching item availability:", err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// Get items with filters
router.get("/filter", authMiddleware(["resident", "staff", "admin"]), async (req, res) => {
  try {
    const { category, available, search } = req.query;
    
    let query = "SELECT * FROM items WHERE 1=1";
    const params = [];
    
    if (category) {
      query += " AND category = ?";
      params.push(category);
    }
    
    if (available === 'true') {
      query += " AND available > 0";
    }
    
    if (search) {
      query += " AND (item_name LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += " ORDER BY item_name ASC";
    
    const [items] = await db.query(query, params);
    res.json(items);
  } catch (err) {
    console.error("Error filtering items:", err);
    res.status(500).json({ error: "Failed to filter items" });
  }
});




module.exports = router;

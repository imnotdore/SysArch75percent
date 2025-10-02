// controllers/itemController.js
const db = require("../config/db");


// GET all items with overall availability (stock reduced globally)
exports.getItems = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        i.id,
        i.item_name,
        i.description,
        i.max_quantity,
        IFNULL(SUM(
          CASE 
            WHEN s.status = 'Approved' AND s.returned_at IS NULL 
            THEN s.quantity 
            ELSE 0 
          END
        ), 0) AS total_booked,
        i.max_quantity - IFNULL(SUM(
          CASE 
            WHEN s.status = 'Approved' AND s.returned_at IS NULL 
            THEN s.quantity 
            ELSE 0 
          END
        ), 0) AS available
      FROM items i
      LEFT JOIN schedules s 
        ON s.item = i.item_name
      GROUP BY i.id, i.item_name, i.description, i.max_quantity
      ORDER BY i.item_name ASC
    `);

    // Ensure availability is not negative
    const updatedRows = rows.map(item => ({
      ...item,
      available: Math.max(0, item.available)
    }));

    res.json(updatedRows);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
};


// GET availability per day for a specific item (90 days)
exports.getAvailability = async (req, res) => {
  try {
    const { item } = req.query;
    if (!item) return res.status(400).json({ error: "Missing item parameter" });

    // Get the item and max quantity
    const [itemRows] = await db.query(
      "SELECT id, item_name, IFNULL(max_quantity,0) AS max_quantity FROM items WHERE item_name=?",
      [item]
    );
    if (itemRows.length === 0) return res.status(404).json({ error: "Item not found" });

    const max_quantity = itemRows[0].max_quantity;

    // Sum of all approved bookings for this item (returned_at IS NULL)
    const [bookedRows] = await db.query(
      `SELECT IFNULL(SUM(quantity), 0) AS total_booked
       FROM schedules
       WHERE item = ? AND status = 'Approved' AND returned_at IS NULL`,
      [item]
    );
    const totalBooked = bookedRows[0].total_booked;

    // Generate availability for next 90 days
    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate() + 90);

    const availability = [];
    for (let d = new Date(today); d <= end; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().split("T")[0];
      availability.push({ date: iso, available: Math.max(0, max_quantity - totalBooked) });
    }

    res.json({ max_quantity, dates: availability });
  } catch (err) {
    console.error("getAvailability error:", err);
    res.status(500).json({ error: "Failed to get availability" });
  }
};



// ✅ Get overall availability of items
exports.getOverallAvailability = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        i.id, 
        i.item_name, 
        i.description,  
        i.max_quantity,
        IFNULL(SUM(
          CASE 
            WHEN s.status = 'Approved' AND s.returned_at IS NULL 
            THEN s.quantity 
            ELSE 0 
          END
        ), 0) AS total_booked,
        i.max_quantity - IFNULL(SUM(
          CASE 
            WHEN s.status = 'Approved' AND s.returned_at IS NULL 
            THEN s.quantity 
            ELSE 0 
          END
        ), 0) AS available
      FROM items i
      LEFT JOIN schedules s 
        ON s.item = i.item_name 
      GROUP BY i.id, i.item_name, i.description, i.max_quantity
      ORDER BY i.item_name ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching overall availability:", err);
    res.status(500).json({ error: "Failed to fetch overall availability" });
  }
};

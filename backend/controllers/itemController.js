// controllers/itemController.js
const db = require("../config/db");

// ✅ Get all items with current availability
exports.getItems = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        i.id,
        i.item_name,
        i.description,
        i.max_quantity,
        COALESCE(i.max_quantity - SUM(
          CASE 
            WHEN s.status = 'Approved' AND s.returned_at IS NULL 
            THEN s.quantity 
            ELSE 0 
          END
        ), i.max_quantity) AS available
      FROM items i
      LEFT JOIN schedules s 
        ON s.item = i.item_name
      GROUP BY i.id, i.item_name, i.description, i.max_quantity
      ORDER BY i.item_name ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching items with availability:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
};

// ✅ Get availability per item (consider full booking range)
// ✅ Get availability per item (future dates)
exports.getAvailability = async (req, res) => {
  try {
    const { item } = req.query;
    if (!item) return res.status(400).json({ error: "Missing item parameter" });

    const [itemRows] = await db.query(
      "SELECT id, item_name, IFNULL(max_quantity,0) AS max_quantity FROM items WHERE item_name=?",
      [item]
    );
    if (itemRows.length === 0) return res.status(404).json({ error: "Item not found" });

    const max_quantity = itemRows[0].max_quantity;

    // Get all bookings (approved and pending) that affect availability
    const [rows] = await db.query(
      `SELECT date_from, SUM(quantity) AS booked
       FROM schedules
       WHERE item=? AND date_from >= CURDATE()
       AND status IN ('Pending', 'Approved') AND returned_at IS NULL
       GROUP BY date_from`,
      [item]
    );

    const availability = [];
    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate() + 90);

    while (today <= end) {
      const iso = today.toISOString().split("T")[0];
      const bookedRow = rows.find((r) => r.date_from.toISOString().split("T")[0] === iso);
      const booked = bookedRow ? bookedRow.booked : 0;

      availability.push({
        date: iso,
        available: Math.max(0, max_quantity - booked),
      });

      today.setDate(today.getDate() + 1);
    }

    res.json({ max_quantity, dates: availability });
  } catch (err) {
    console.error(err);
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

// controllers/itemController.js
const db = require("../config/db");

exports.getItems = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, item_name, description, IFNULL(max_quantity, 0) AS max_quantity
       FROM items`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
};
exports.getAvailability = async (req, res) => {
  try {
    const { item, dateFrom, dateTo } = req.query;
    if (!item || !dateFrom || !dateTo) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // kunin total quantity kung meron (optional column max_quantity sa items)
    const [itemRows] = await db.query(
      "SELECT id, item_name FROM items WHERE item_name = ?",
      [item]
    );
    if (itemRows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    // bilangin booked per date
    const [rows] = await db.query(
      `SELECT date_from AS date_needed, SUM(quantity) AS booked
       FROM schedules
       WHERE item = ? 
       AND date_from BETWEEN ? AND ?
       GROUP BY date_from`,
      [item, dateFrom, dateTo]
    );

    const availability = [];
    let current = new Date(dateFrom);
    const end = new Date(dateTo);

    while (current <= end) {
      const iso = current.toISOString().split("T")[0];
      const bookedRow = rows.find((r) => r.date_needed === iso);
      const booked = bookedRow ? bookedRow.booked : 0;

      availability.push({
        date_needed: iso,
        available: Math.max(0, 50 - booked), // default 50 units if walang max_quantity
      });

      current.setDate(current.getDate() + 1);
    }

    res.json({ dates: availability });
  } catch (err) {
    console.error("Error checking availability:", err);
    res.status(500).json({ error: "Failed to check availability" });
  }
};

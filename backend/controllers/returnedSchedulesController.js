// controllers/staffController.js
const db = require("../config/db");

const returnedSchedulesController = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.id, s.user_id, r.username AS resident_username, s.item, s.quantity,
              s.approved_by, s.approved_at, s.returned_at, st.username AS staff_username
       FROM schedules s
       JOIN residents r ON s.user_id = r.id
       LEFT JOIN staff st ON s.approved_by = st.id
       WHERE s.status = 'Returned'`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch returned schedules" });
  }
};

module.exports = { returnedSchedulesController };

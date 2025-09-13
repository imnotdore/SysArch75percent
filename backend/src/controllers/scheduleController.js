const db = require('../config/db');

// GET schedules
const getSchedules = async (req, res) => {
  try {
    console.log("Fetching schedules for user:", req.user); // debug
    const residentId = req.user.id;
    const [results] = await db.query('SELECT * FROM schedules WHERE resident_id = ?', [residentId]);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// POST new schedule
const createSchedule = async (req, res) => {
  try {
    console.log("Creating schedule for user:", req.user); // debug
    const residentId = req.user.id;
    const { dateFrom, dateTo, time, item, quantity, status } = req.body;

    const [result] = await db.query(
      'INSERT INTO schedules (resident_id, dateFrom, dateTo, time, item, quantity, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [residentId, dateFrom, dateTo, time, item, quantity, status || 'Pending']
    );

    res.status(201).json({ message: 'Schedule created', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = { getSchedules, createSchedule };

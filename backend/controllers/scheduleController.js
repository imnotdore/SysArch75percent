const db = require("../db");

exports.createSchedule = (req, res) => {
  const { user_id, item_id, schedule_date } = req.body;
  const sql = "INSERT INTO schedules (user_id, item_id, schedule_date) VALUES (?, ?, ?)";
  db.query(sql, [user_id, item_id, schedule_date], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Schedule request created" });
  });
};

exports.getUserSchedules = (req, res) => {
  const { user_id } = req.params;
  const sql = `SELECT s.*, i.item_name FROM schedules s 
               JOIN items i ON s.item_id = i.id WHERE user_id = ?`;
  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getAllSchedules = (req, res) => {
  const sql = `SELECT s.*, u.full_name, i.item_name FROM schedules s 
               JOIN users u ON s.user_id = u.id 
               JOIN items i ON s.item_id = i.id ORDER BY s.schedule_date DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.updateScheduleStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const sql = "UPDATE schedules SET status = ? WHERE id = ?";
  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Schedule status updated" });
  });
};

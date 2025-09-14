const db = require("../db");

exports.addAnnouncement = (req, res) => {
  const { title, content, created_by } = req.body;
  const sql = "INSERT INTO announcements (title, content, created_by) VALUES (?, ?, ?)";
  db.query(sql, [title, content, created_by], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Announcement posted" });
  });
};

exports.getAnnouncements = (req, res) => {
  const sql = "SELECT * FROM announcements ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

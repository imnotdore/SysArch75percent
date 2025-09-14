const db = require("../db");

exports.uploadDisclosure = (req, res) => {
  const { created_by } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const sql = "INSERT INTO disclosures (filename, url, created_by) VALUES (?, ?, ?)";
  db.query(sql, [file.filename, `/uploads/${file.filename}`, created_by], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Disclosure uploaded", file: file.filename });
  });
};

exports.getDisclosures = (req, res) => {
  const sql = "SELECT * FROM disclosures ORDER BY uploaded_at DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

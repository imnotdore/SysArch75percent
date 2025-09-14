const db = require("../db");

exports.addItem = (req, res) => {
  const { item_name, description } = req.body;
  const sql = "INSERT INTO items (item_name, description) VALUES (?, ?)";
  db.query(sql, [item_name, description], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Item added successfully" });
  });
};

exports.getItems = (req, res) => {
  const sql = "SELECT * FROM items";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.updateItem = (req, res) => {
  const { id } = req.params;
  const { item_name, description } = req.body;
  const sql = "UPDATE items SET item_name = ?, description = ? WHERE id = ?";
  db.query(sql, [item_name, description, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Item updated" });
  });
};

exports.deleteItem = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM items WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Item deleted" });
  });
};

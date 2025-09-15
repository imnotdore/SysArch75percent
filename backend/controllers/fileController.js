const db = require("../config/db");

// ---------------- Resident Routes ---------------- //

// Get files uploaded by the logged-in resident
exports.getResidentFiles = async (req, res) => {
  const residentId = req.user.id;
  try {
    const [rows] = await db.query(
      "SELECT id, filename, status, created_at FROM resident_requests WHERE resident_id = ? ORDER BY created_at DESC",
      [residentId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

// Upload a new file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const residentId = req.user.id;
    await db.query(
      "INSERT INTO resident_requests (resident_id, filename, status) VALUES (?, ?, 'pending')",
      [residentId, req.file.filename]
    );

    res.json({ message: "File uploaded", filename: req.file.filename, status: "pending" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

// ---------------- Staff Routes ---------------- //

// Get all resident requests (for staff dashboard)
exports.getAllFilesForStaff = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT rr.id, rr.resident_id, rr.filename, rr.status, rr.created_at, r.fullname AS resident_name
       FROM resident_requests rr
       JOIN residents r ON rr.resident_id = r.id
       ORDER BY rr.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching all files:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

// Update file status (accept/reject)
exports.updateFileStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const [result] = await db.query(
      "UPDATE resident_requests SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Request not found" });

    res.json({ message: `Request ${status}` });
  } catch (err) {
    console.error("Error updating request:", err);
    res.status(500).json({ error: "Failed to update request" });
  }
};

// Get all residents (for staff dashboard)
exports.getAllResidents = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, username FROM residents ORDER BY username ASC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching residents:", err);
    res.status(500).json({ error: "Failed to fetch residents" });
  }
};

// Get files by a specific resident (for staff)
exports.getFilesByResident = async (req, res) => {
  const residentId = req.params.residentId;
  try {
    const [rows] = await db.query(
      "SELECT id, filename, status, created_at FROM resident_requests WHERE resident_id = ? ORDER BY created_at DESC",
      [residentId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching resident files:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

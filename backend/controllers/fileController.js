const db = require("../config/db");

// Get files uploaded by the logged-in resident
exports.getResidentFiles = async (req, res) => {
  const residentId = req.user.id; // from authMiddleware
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

// Upload file & save to database
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const residentId = req.user.id; // from authMiddleware

    // Save to database
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

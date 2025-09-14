// controllers/uploadController.js
const db = require("../config/db");

// Upload file
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileName = req.file.filename;

    const [result] = await db.query(
      "INSERT INTO uploaded_files (file_name, status) VALUES (?, 'Pending')",
      [fileName]
    );

    res.json({
      message: "File uploaded successfully",
      file: fileName,
      id: result.insertId,
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

// Get uploaded files
const getFiles = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM uploaded_files ORDER BY uploaded_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

// Download file
const downloadFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = `uploads/${filename}`;
    res.download(filePath);
  } catch (err) {
    console.error("❌ Download error:", err);
    res.status(500).json({ error: "Failed to download file" });
  }
};

module.exports = { uploadFile, getFiles, downloadFile };

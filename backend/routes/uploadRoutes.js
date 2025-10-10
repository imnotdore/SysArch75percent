const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../config/db'); // adjust kung saan naka-config db mo
const router = express.Router();
const fs = require("fs");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");
// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Upload route
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { role, userId } = req.body;

    if (!role || !userId) {
      return res.status(400).json({ error: 'role and userId are required' });
    }

    // Decide which column to insert into based on role
    let column = null;
    if (role === 'resident') column = 'resident_id';
    else if (role === 'admin') column = 'admin_id';
    else if (role === 'staff') column = 'staff_id';
    else return res.status(400).json({ error: 'Invalid role' });

    // File details
    const filename = req.file.filename;
    const url = `/uploads/${filename}`;

    // Insert query
    const query = `
      INSERT INTO uploaded_files (${column}, filename, url)
      VALUES (?, ?, ?)
    `;
    await pool.query(query, [userId, filename, url]);

    res.json({ message: 'File uploaded successfully', filename, url });
  } catch (err) {
    console.error('DB insert error:', err);
    res.status(500).json({ error: 'Database insert failed' });
  }
});

// Fetch all files
router.get('/files', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM uploaded_files ORDER BY uploaded_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('DB fetch error:', err);
    res.status(500).json({ error: 'Database fetch failed' });
  }
});

module.exports = router;

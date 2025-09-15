const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fileController = require("../controllers/fileController");
const authMiddleware = require("../middlewares/authMiddleware");

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ---------------- Resident Routes ---------------- //
router.get("/", authMiddleware(), fileController.getResidentFiles);
router.post("/upload", authMiddleware(), upload.single("file"), fileController.uploadFile);
router.get("/download/:fileName", authMiddleware(), (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(uploadDir, fileName);

  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).json({ error: "Failed to download file" });
    }
  });
});

// ---------------- Staff Routes ---------------- //
router.get("/all", authMiddleware(), fileController.getAllFilesForStaff);
router.put("/:id", authMiddleware(), fileController.updateFileStatus);

module.exports = router;

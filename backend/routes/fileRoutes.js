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

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and Word documents (.doc, .docx) are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB

});


// ---------------- Resident Routes ---------------- //

// Get files uploaded by the logged-in resident
router.get("/", authMiddleware(), fileController.getResidentFiles);

// Upload a file
router.post(
  "/upload",
  authMiddleware(),
  upload.single("file"),
  (req, res, next) => {
    // If no file uploaded
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Convert and validate form fields safely
    req.body.dateNeeded = req.body.dateNeeded?.trim();
    req.body.pageCount = Number(req.body.pageCount);

    if (!req.body.dateNeeded) {
      return res.status(400).json({ error: "dateNeeded is required" });
    }
    if (!req.body.pageCount || req.body.pageCount <= 0) {
      return res.status(400).json({ error: "pageCount must be greater than 0" });
    }

    next();
  },
  fileController.uploadFile
);


// Download a file
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

// Check availability for a single date (resident)
router.get("/availability/:date", authMiddleware(), fileController.checkAvailability);

// Get all availability for the calendar
router.get("/availability", authMiddleware(), fileController.getAvailability);

// Get daily total pages for a specific date
router.get("/daily-total", authMiddleware(), fileController.getDailyTotal);

// ---------------- Staff Routes ---------------- //

// Get all resident requests (staff only)
router.get("/all", authMiddleware(["staff"]), fileController.getAllFilesForStaff);

// Get files by a specific resident (staff only)
router.get("/resident/:residentId", authMiddleware(["staff"]), fileController.getFilesByResident);

// Update file status (accept/reject) (staff only)
router.put("/:id", authMiddleware(["staff"]), fileController.updateFileStatus);

module.exports = router;

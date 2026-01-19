const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fileController = require("../controllers/fileController");
const authMiddleware = require("../middlewares/authMiddleware");
const authController = require("../controllers/authController");
// Configure upload directory
const uploadDir = path.join(__dirname, "../uploads/files");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/jpg"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, Word, JPEG, and PNG files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Resident routes
router.post("/upload", 
  authMiddleware(["resident"]), 
  upload.single("file"), 
  fileController.uploadFile
);

router.get("/", 
  authMiddleware(["resident"]), 
  fileController.getResidentFiles
);

router.delete("/:id", 
  authMiddleware(["resident"]), 
  fileController.cancelFileRequest
);

router.get("/availability", 
  authMiddleware(["resident"]), 
  fileController.getAllAvailability
);

router.get("/availability/:date", 
  authMiddleware(["resident"]), 
  fileController.checkAvailability
);

// Download file
router.get("/download/:filename", authMiddleware(["resident"]), (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadDir, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  
  res.download(filePath, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).json({ error: "Failed to download file" });
    }
  });
});
// fileRoutes.js - ADD THIS BEFORE module.exports
router.get("/limits", 
  authMiddleware(["resident"]), 
  async (req, res) => {
    try {
      // Simple hardcoded response muna
      res.json({
        success: true,
        data: {
          limits: [
            { type: 'resident', value: 30 },
            { type: 'global', value: 100 }
          ]
        }
      });
    } catch (err) {
      console.error("Error in limits endpoint:", err);
      res.status(500).json({ error: "Failed to fetch limits" });
    }
  }
);
router.get("/limits/resident",
  authController.verifyToken,
  fileController.getLimitsForResident
)

module.exports = router;
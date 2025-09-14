const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { registerResident, loginResident } = require("../controllers/authController");
const { uploadFile, getUserFiles } = require("../controllers/fileController");

// Register
router.post("/register", registerResident);

// Login
router.post("/login", loginResident);

// Upload file (protected, only resident)
router.post("/upload", authMiddleware(["resident"]), uploadFile);

// View own files (protected, only resident)
router.get("/files/:userId", authMiddleware(["resident"]), getUserFiles);

module.exports = router;

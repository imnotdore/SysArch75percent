const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const fileController = require("../controllers/fileController");

// All staff routes require authentication
router.use(authMiddleware()); // note the parentheses

// Get all residents
router.get("/residents", fileController.getAllResidents);

// Get files of a specific resident
router.get("/files/resident/:residentId", fileController.getFilesByResident);

// Update file status (accept/reject)
router.put("/files/:id", fileController.updateFileStatus);

module.exports = router;

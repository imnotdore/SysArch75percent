// routes/itemRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const itemController = require("../controllers/itemController");

// Public: Get all items with overall availability
router.get("/", itemController.getItems);

// Public: Get overall availability (global stock)
router.get("/overall-availability", itemController.getOverallAvailability);

// Protected: Check availability per date and per time slot (requires login))))
router.get("/availability", authMiddleware(), itemController.getAvailability);

module.exports = router;

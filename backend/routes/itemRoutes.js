// routes/itemRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const itemController = require("../controllers/itemController");

// ✅ Get all items with availability (public)
router.get("/", itemController.getItems);



// routes/itemRoutes.js
router.get("/overall-availability", itemController.getOverallAvailability);



// ✅ Check availability by date range (requires login)
router.get(
  "/availability",
  authMiddleware(),
  itemController.getAvailability
);

module.exports = router;

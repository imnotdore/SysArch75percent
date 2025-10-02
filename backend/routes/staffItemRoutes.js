const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const itemController = require("../controllers/itemController");

// lahat ng staff routes require staff auth
router.use(authMiddleware(["staff"]));

// GET all items with availability
router.get("/availability", itemController.getAllItemsWithAvailability);

// POST set manual availability
router.post("/availability", itemController.setAvailability);

// GET availability of one item across 90 days
router.get("/availability/range", itemController.getAvailability);

// GET overall availability summary
router.get("/overall-availability", itemController.getOverallAvailability);

module.exports = router;

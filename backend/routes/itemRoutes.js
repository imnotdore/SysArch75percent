// routes/itemRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");
const itemController = require("../controllers/itemController");

// ✅ Get all items (public for residents)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, item_name, description FROM items ORDER BY item_name ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// ✅ Check availability (requires login)
router.get(
  "/availability",
  authMiddleware(),
  itemController.getAvailability
);

module.exports = router;

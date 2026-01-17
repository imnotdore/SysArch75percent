const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const itemAdminController = require("../controllers/itemAdminController");

// All routes require admin authentication
router.use(authMiddleware(["admin"]));

// Get all items with detailed info
router.get("/", itemAdminController.getItemsAdmin);

// Create new item
router.post("/", itemAdminController.createItem);

// Update item
router.put("/:id", itemAdminController.updateItem);

// Delete item
router.delete("/:id", itemAdminController.deleteItem);

// Restock item to max quantity
router.put("/:id/restock", itemAdminController.restockItem);

// Adjust item quantity manually
router.put("/:id/adjust", itemAdminController.adjustQuantity);

// Get item statistics
router.get("/stats", itemAdminController.getItemStats);

module.exports = router;
const db = require("../config/db");

// Get all items (admin view with detailed info)
exports.getItemsAdmin = async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT 
        i.*,
        (SELECT COALESCE(SUM(s.quantity), 0) FROM schedules s 
         WHERE s.item = i.item_name 
         AND s.status IN ('Pending', 'Approved')
         AND s.date_to >= CURDATE()) as currently_borrowed
      FROM items i
      ORDER BY i.item_name ASC
    `);
    
    res.json(items);
  } catch (err) {
    console.error("Error fetching items for admin:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
};

// Create new item
exports.createItem = async (req, res) => {
  try {
    const { 
      item_name, 
      description, 
      max_quantity, 
      available,
      category, 
      borrowing_duration,
      can_renew
    } = req.body;
    
    if (!item_name || !max_quantity || available === undefined) {
      return res.status(400).json({ 
        error: "Item name, max quantity, and available quantity are required" 
      });
    }
    
    // Validate available doesn't exceed max
    const availableQty = parseInt(available);
    const maxQty = parseInt(max_quantity);
    
    if (availableQty > maxQty) {
      return res.status(400).json({ 
        error: "Available quantity cannot exceed maximum quantity" 
      });
    }
    
    // Check if item already exists
    const [existing] = await db.query(
      "SELECT id FROM items WHERE item_name = ?",
      [item_name]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ 
        error: "Item with this name already exists" 
      });
    }
    
    // Insert new item
    const [result] = await db.query(
      `INSERT INTO items 
       (item_name, description, max_quantity, available, category, 
        borrowing_duration, can_renew, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        item_name, 
        description || null, 
        maxQty,
        availableQty,
        category || null, 
        borrowing_duration || 7,
        can_renew !== undefined ? can_renew : 1
      ]
    );
    
    res.status(201).json({
      id: result.insertId,
      item_name,
      description,
      max_quantity: maxQty,
      available: availableQty,
      category,
      borrowing_duration: borrowing_duration || 7,
      can_renew: can_renew !== undefined ? can_renew : 1,
      created_at: new Date(),
      updated_at: new Date()
    });
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ error: "Failed to create item" });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      item_name, 
      description, 
      max_quantity, 
      available,
      category, 
      borrowing_duration,
      can_renew
    } = req.body;
    
    if (!item_name || !max_quantity || available === undefined) {
      return res.status(400).json({ 
        error: "Item name, max quantity, and available quantity are required" 
      });
    }
    
    // Check if item exists
    const [existing] = await db.query(
      "SELECT id FROM items WHERE id = ?",
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        error: "Item not found" 
      });
    }
    
    // Check if item name already exists (excluding current item)
    const [nameCheck] = await db.query(
      "SELECT id FROM items WHERE item_name = ? AND id != ?",
      [item_name, id]
    );
    
    if (nameCheck.length > 0) {
      return res.status(400).json({ 
        error: "Another item with this name already exists" 
      });
    }
    
    // Validate available doesn't exceed max
    const availableQty = parseInt(available);
    const maxQty = parseInt(max_quantity);
    
    if (availableQty > maxQty) {
      return res.status(400).json({ 
        error: "Available quantity cannot exceed maximum quantity" 
      });
    }
    
    // Update item
    const [result] = await db.query(
      `UPDATE items SET 
        item_name = ?, 
        description = ?, 
        max_quantity = ?, 
        available = ?, 
        category = ?, 
        borrowing_duration = ?,
        can_renew = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [
        item_name, 
        description || null, 
        maxQty,
        availableQty,
        category || null, 
        borrowing_duration || 7,
        can_renew !== undefined ? can_renew : 1,
        id
      ]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    res.json({ 
      success: true,
      message: "Item updated successfully" 
    });
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: "Failed to update item" });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if item has active bookings
    const [activeBookings] = await db.query(
      `SELECT COUNT(*) as count FROM schedules 
       WHERE item = (SELECT item_name FROM items WHERE id = ?) 
       AND status IN ('Pending', 'Approved') 
       AND date_to >= CURDATE()`,
      [id]
    );
    
    if (activeBookings[0].count > 0) {
      return res.status(400).json({ 
        error: "Cannot delete item with active or upcoming bookings" 
      });
    }
    
    // Get item name before deleting
    const [item] = await db.query(
      "SELECT item_name FROM items WHERE id = ?",
      [id]
    );
    
    // Delete item
    const [result] = await db.query(
      "DELETE FROM items WHERE id = ?",
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    // Delete related waitlist entries
    if (item.length > 0) {
      await db.query(
        "DELETE FROM waitlist WHERE item_name = ?",
        [item[0].item_name]
      );
    }
    
    res.json({ 
      success: true,
      message: "Item deleted successfully" 
    });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
};

// Restock item to max quantity
exports.restockItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get item info
    const [item] = await db.query(
      "SELECT * FROM items WHERE id = ?",
      [id]
    );
    
    if (item.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    const currentItem = item[0];
    
    // If already at max quantity
    if (currentItem.available >= currentItem.max_quantity) {
      return res.status(400).json({ 
        error: "Item is already at maximum quantity" 
      });
    }
    
    // Restock to max quantity
    await db.query(
      "UPDATE items SET available = max_quantity, updated_at = NOW() WHERE id = ?",
      [id]
    );
    
    res.json({ 
      success: true,
      message: "Item restocked successfully",
      available: currentItem.max_quantity
    });
  } catch (err) {
    console.error("Error restocking item:", err);
    res.status(500).json({ error: "Failed to restock item" });
  }
};

// Adjust item quantity manually
exports.adjustQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (quantity === undefined || isNaN(quantity)) {
      return res.status(400).json({ 
        error: "Valid quantity is required" 
      });
    }
    
    const qty = parseInt(quantity);
    
    // Get item info
    const [item] = await db.query(
      "SELECT * FROM items WHERE id = ?",
      [id]
    );
    
    if (item.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    const currentItem = item[0];
    
    // Validate quantity
    if (qty < 0 || qty > currentItem.max_quantity) {
      return res.status(400).json({ 
        error: `Quantity must be between 0 and ${currentItem.max_quantity}` 
      });
    }
    
    // Update quantity
    await db.query(
      "UPDATE items SET available = ?, updated_at = NOW() WHERE id = ?",
      [qty, id]
    );
    
    res.json({ 
      success: true,
      message: "Quantity adjusted successfully",
      available: qty
    });
  } catch (err) {
    console.error("Error adjusting quantity:", err);
    res.status(500).json({ error: "Failed to adjust quantity" });
  }
};

// Get item statistics
exports.getItemStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(max_quantity) as total_capacity,
        SUM(available) as total_available,
        SUM(CASE WHEN available = 0 THEN 1 ELSE 0 END) as out_of_stock,
        SUM(CASE WHEN available < max_quantity * 0.2 THEN 1 ELSE 0 END) as low_stock,
        AVG(borrowing_duration) as avg_borrowing_days,
        SUM(can_renew) as renewable_items
      FROM items
    `);
    
    // Get most borrowed items
    const [popular] = await db.query(`
      SELECT 
        s.item,
        COUNT(*) as borrow_count,
        SUM(s.quantity) as total_quantity
      FROM schedules s
      WHERE s.status = 'Approved'
      GROUP BY s.item
      ORDER BY borrow_count DESC
      LIMIT 5
    `);
    
    // Get categories breakdown
    const [categories] = await db.query(`
      SELECT 
        COALESCE(category, 'Uncategorized') as category,
        COUNT(*) as item_count,
        SUM(max_quantity) as capacity,
        SUM(available) as available_count
      FROM items
      GROUP BY category
    `);
    
    res.json({
      ...stats[0],
      popular_items: popular,
      categories: categories
    });
  } catch (err) {
    console.error("Error fetching item stats:", err);
    res.status(500).json({ error: "Failed to fetch item statistics" });
  }
};
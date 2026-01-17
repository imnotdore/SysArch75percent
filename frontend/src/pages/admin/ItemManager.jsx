import { useState, useEffect } from "react";
import axios from "axios";
import "./ItemManager.css";

export default function ItemManager() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    item_name: "",
    description: "",
    max_quantity: 1,
    category: "",
    location: "",
    image_url: ""
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/items/admin`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setItems(res.data);
    } catch (err) {
      console.error("Error fetching items:", err);
      alert("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      if (!newItem.item_name || !newItem.max_quantity) {
        alert("Item name and quantity are required");
        return;
      }

      const res = await axios.post(
        `${API_URL}/api/items/admin`,
        newItem,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.status === 201) {
        alert("Item added successfully!");
        setShowAddModal(false);
        setNewItem({
          item_name: "",
          description: "",
          max_quantity: 1,
          category: "",
          location: "",
          image_url: ""
        });
        fetchItems();
      }
    } catch (err) {
      console.error("Error adding item:", err);
      alert(err.response?.data?.error || "Failed to add item");
    }
  };

  const handleEditItem = async () => {
    try {
      if (!editingItem.item_name || !editingItem.max_quantity) {
        alert("Item name and quantity are required");
        return;
      }

      const res = await axios.put(
        `${API_URL}/api/items/admin/${editingItem.id}`,
        editingItem,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.status === 200) {
        alert("Item updated successfully!");
        setShowEditModal(false);
        setEditingItem(null);
        fetchItems();
      }
    } catch (err) {
      console.error("Error updating item:", err);
      alert(err.response?.data?.error || "Failed to update item");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await axios.delete(
        `${API_URL}/api/items/admin/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.status === 200) {
        alert("Item deleted successfully!");
        fetchItems();
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      alert(err.response?.data?.error || "Failed to delete item");
    }
  };

  const handleUpdateAvailability = async (itemId, action) => {
    try {
      const res = await axios.put(
        `${API_URL}/api/items/admin/${itemId}/availability`,
        { action }, // 'restock' or 'adjust'
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.status === 200) {
        alert("Availability updated successfully!");
        fetchItems();
      }
    } catch (err) {
      console.error("Error updating availability:", err);
      alert(err.response?.data?.error || "Failed to update availability");
    }
  };

  return (
    <div className="item-manager-container">
      <div className="item-manager-header">
        <h1>📦 Item Management</h1>
        <button 
          className="btn-add-item"
          onClick={() => setShowAddModal(true)}
        >
          ➕ Add New Item
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading items...</div>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-card-header">
                <h3>{item.item_name}</h3>
                <div className="item-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => {
                      setEditingItem({...item});
                      setShowEditModal(true);
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
              
              <div className="item-details">
                <p><strong>Description:</strong> {item.description || "No description"}</p>
                <p><strong>Category:</strong> {item.category || "Uncategorized"}</p>
                <p><strong>Location:</strong> {item.location || "Not specified"}</p>
              </div>
              
              <div className="item-stats">
                <div className="stat">
                  <span className="stat-label">Max Quantity:</span>
                  <span className="stat-value">{item.max_quantity}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Available:</span>
                  <span className={`stat-value ${item.available === 0 ? 'out-of-stock' : ''}`}>
                    {item.available}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Currently Borrowed:</span>
                  <span className="stat-value">{item.currently_borrowed || 0}</span>
                </div>
              </div>
              
              <div className="item-availability-controls">
                <button 
                  className="btn-restock"
                  onClick={() => handleUpdateAvailability(item.id, 'restock')}
                >
                  📦 Restock to Max
                </button>
                <button 
                  className="btn-adjust"
                  onClick={() => {
                    const newQty = prompt(`Enter new available quantity (Max: ${item.max_quantity}):`, item.available);
                    if (newQty !== null && !isNaN(newQty)) {
                      axios.put(
                        `${API_URL}/api/items/admin/${item.id}/availability`,
                        { 
                          action: 'adjust',
                          quantity: parseInt(newQty) 
                        },
                        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                      ).then(() => fetchItems());
                    }
                  }}
                >
                  🔧 Adjust Manually
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>➕ Add New Item</h2>
            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                value={newItem.item_name}
                onChange={(e) => setNewItem({...newItem, item_name: e.target.value})}
                placeholder="Enter item name"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                placeholder="Enter item description"
                rows="3"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Max Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={newItem.max_quantity}
                  onChange={(e) => setNewItem({...newItem, max_quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Tools">Tools</option>
                  <option value="Sports">Sports</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={newItem.location}
                onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                placeholder="e.g., Storage Room A, Shelf 3"
              />
            </div>
            <div className="form-group">
              <label>Image URL (Optional)</label>
              <input
                type="text"
                value={newItem.image_url}
                onChange={(e) => setNewItem({...newItem, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleAddItem}>
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>✏️ Edit Item</h2>
            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                value={editingItem.item_name}
                onChange={(e) => setEditingItem({...editingItem, item_name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={editingItem.description}
                onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                rows="3"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Max Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={editingItem.max_quantity}
                  onChange={(e) => setEditingItem({...editingItem, max_quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Tools">Tools</option>
                  <option value="Sports">Sports</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={editingItem.location}
                onChange={(e) => setEditingItem({...editingItem, location: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleEditItem}>
                Update Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
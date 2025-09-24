import { useState, useEffect } from "react";
import axios from "axios";

function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", total_quantity: 0 });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get("/api/admin/items");
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (item = null) => {
    setEditItem(item);
    if (item) setForm({ name: item.name, description: item.description, total_quantity: item.total_quantity });
    else setForm({ name: "", description: "", total_quantity: 0 });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editItem) {
        await axios.put(`/api/admin/items/${editItem.id}`, form);
      } else {
        await axios.post("/api/admin/items", form);
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("Failed to save item.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`/api/admin/items/${id}`);
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("Failed to delete item.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard - Manage Items</h2>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => openModal()}
      >
        Add New Item
      </button>

      <table className="w-full border border-gray-300 rounded overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Item Name</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">Total Quantity</th>
            <th className="p-2 border">Available Quantity</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="p-2 border">{item.name}</td>
              <td className="p-2 border">{item.description}</td>
              <td className="p-2 border">{item.total_quantity}</td>
              <td className="p-2 border">{item.available_quantity}</td>
              <td className="p-2 border flex gap-2">
                <button
                  className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={() => openModal(item)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editItem ? "Edit Item" : "Add New Item"}</h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Item Name"
                className="border p-2 rounded"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <textarea
                placeholder="Description"
                className="border p-2 rounded"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <input
                type="number"
                placeholder="Total Quantity"
                className="border p-2 rounded"
                value={form.total_quantity}
                onChange={(e) => setForm({ ...form, total_quantity: Number(e.target.value) })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

import StaffLayout from "./StaffLayout";
import { useState, useEffect } from "react";
import axios from "axios";

function Schedule() {
  const [requests, setRequests] = useState([]);
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    fetchRequests();
    fetchItems();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("/api/staff/requests");
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get("/api/staff/items/availability");
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (req) => {
    const item = items.find((i) => i.id === req.item_id);
    if (!item || item.available_quantity < req.quantity) {
      alert("Not enough items available!");
      return;
    }

    try {
      await axios.put(`/api/staff/requests/${req.id}`, { status: "Approved" });
      alert("Request approved!");
      fetchRequests();
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("Failed to approve request");
    }
  };

  const handleReject = async (req) => {
    try {
      await axios.put(`/api/staff/requests/${req.id}`, { status: "Rejected" });
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <StaffLayout>
      <h2 className="text-2xl font-bold mb-4">Resident Requests</h2>
      <table className="w-full border border-gray-300 bg-white">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">Resident</th>
            <th className="p-2 border">Item</th>
            <th className="p-2 border">Quantity</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => {
            const item = items.find(i => i.id === req.item_id);
            const unavailable = item && item.available_quantity < req.quantity;
            return (
              <tr key={req.id} className={unavailable ? "bg-red-100" : ""}>
                <td className="p-2 border">{req.resident_name}</td>
                <td className="p-2 border">{item?.name || "Unknown"}</td>
                <td className="p-2 border">{req.quantity}</td>
                <td className="p-2 border">{req.status}</td>
                <td className="p-2 border">
                  {req.status === "Pending" && (
                    <>
                      <button
                        className="px-2 py-1 bg-green-500 text-white rounded mr-2"
                        onClick={() => handleApprove(req)}
                        disabled={unavailable}
                      >
                        Approve
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded"
                        onClick={() => handleReject(req)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </StaffLayout>
  );
}

export default Schedule;

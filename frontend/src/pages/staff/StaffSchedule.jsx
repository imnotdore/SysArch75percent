import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config";

export default function StaffSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [filter, setFilter] = useState("all"); // all, available, booked
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`${API_URL}/staff/schedules`);
      setSchedules(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
      setLoading(false);
    }
  };

  const toggleStatus = async (scheduleId, currentStatus) => {
    const newStatus = currentStatus === "available" ? "booked" : "available";
    try {
      await axios.put(`${API_URL}/staff/schedules/${scheduleId}`, { status: newStatus });
      // Update local state immediately
      setSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status. Try again.");
    }
  };

  const filteredSchedules = schedules.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  if (loading) return <p>Loading schedules...</p>;

  return (
    <div>
      <h2>Staff Schedule</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>Filter by status: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="booked">Booked</option>
        </select>
      </div>

      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredSchedules.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No schedules found.
              </td>
            </tr>
          ) : (
            filteredSchedules.map((s) => (
              <tr key={s.id}>
                <td>{s.item}</td>
                <td>{s.quantity}</td>
                <td>
                  {s.date_from} - {s.date_to}
                </td>
                <td>
                  {s.time_from} - {s.time_to}
                </td>
                <td style={{ color: s.status === "available" ? "green" : "red", fontWeight: "bold" }}>
                  {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                </td>
                <td>
                  <button
                    onClick={() => toggleStatus(s.id, s.status)}
                    style={{
                      padding: "4px 8px",
                      cursor: "pointer",
                      backgroundColor: s.status === "available" ? "#f44336" : "#4CAF50",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                    }}
                  >
                    {s.status === "available" ? "Mark as Booked" : "Mark as Available"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

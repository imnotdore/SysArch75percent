import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function AcceptedList() {
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [highlightedIds, setHighlightedIds] = useState([]);
  const [filter, setFilter] = useState("All"); // All | Files | Schedules
  const prevRequestsRef = useRef([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/staff/accepted", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const files = res.data.files || [];
        const schedules = res.data.schedules || [];

        // Combine files and schedules into one array
        const combined = [
          ...files.map(f => ({
            id: `file-${f.id}`,
            type: "File",
            resident: f.resident_username || `Resident#${f.resident_id}`,
            item: f.filename,
            quantity: "-",
            dateFrom: "-",
            dateTo: "-",
            approvedAt: f.approved_at ? new Date(f.approved_at) : null,
            approvedBy: f.staff_username || `Staff#${f.approved_by}`,
          })),
          ...schedules.map(s => ({
            id: `schedule-${s.id}`,
            type: "Schedule",
            resident: s.user || `Resident#${s.user_id}`,
            item: s.item,
            quantity: s.quantity,
            dateFrom: s.date_from,
            dateTo: s.date_to,
            approvedAt: s.approved_at ? new Date(s.approved_at) : null,
            approvedBy: s.staff_username || `Staff#${s.approved_by || "-"}`,
          })),
        ];

        // Sort by approvedAt descending
        combined.sort((a, b) => {
          if (!a.approvedAt) return 1;
          if (!b.approvedAt) return -1;
          return b.approvedAt - a.approvedAt;
        });

        // Highlight new rows
        const newRows = combined.filter(
          r => !prevRequestsRef.current.some(prev => prev.id === r.id)
        );
        if (newRows.length > 0) {
          setHighlightedIds(newRows.map(r => r.id));
          setTimeout(() => setHighlightedIds([]), 3000);
        }

        setAcceptedRequests(combined);
        prevRequestsRef.current = combined;
      } catch (err) {
        console.error("Error fetching accepted requests:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const cellStyle = {
    border: "1px solid #ccc",
    padding: "8px",
    textAlign: "center",
  };

  // Filter requests based on toggle
  const displayedRequests =
    filter === "All"
      ? acceptedRequests
      : acceptedRequests.filter(r => r.type === filter);

  return (
    <div style={{ padding: "20px", fontFamily: '"Lexend", sans-serif' }}>
      <h2>Accepted Requests</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Filter: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="File">Files</option>
          <option value="Schedule">Schedules</option>
        </select>
      </div>

      {displayedRequests.length === 0 ? (
        <p>No accepted requests.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#F4BE2A" }}>
              <th style={cellStyle}>Type</th>
              <th style={cellStyle}>Resident</th>
              <th style={cellStyle}>Item / File</th>
              <th style={cellStyle}>Quantity</th>
              <th style={cellStyle}>Date From</th>
              <th style={cellStyle}>Date To</th>
              <th style={cellStyle}>Date Approved</th>
              <th style={cellStyle}>Approved By</th>
            </tr>
          </thead>
          <tbody>
            {displayedRequests.map(r => (
              <tr
                key={r.id}
                style={{
                  backgroundColor: highlightedIds.includes(r.id) ? "#d4edda" : "transparent",
                  transition: "background-color 1s ease",
                }}
              >
                <td style={cellStyle}>{r.type}</td>
                <td style={cellStyle}>{r.resident}</td>
                <td style={cellStyle}>{r.item}</td>
                <td style={cellStyle}>{r.quantity}</td>
                <td style={cellStyle}>{r.dateFrom}</td>
                <td style={cellStyle}>{r.dateTo}</td>
                <td style={cellStyle}>
                  {r.approvedAt
                    ? r.approvedAt.toLocaleString("en-PH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "N/A"}
                </td>
                <td style={cellStyle}>{r.approvedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

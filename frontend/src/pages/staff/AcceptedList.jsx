// src/pages/staff/AcceptedList.jsx
import { useState, useEffect } from "react";
import { 
  FaFileAlt, FaCalendarAlt, FaEye, FaPrint, FaUser, FaUserCheck 
} from "react-icons/fa";
import "./StaffDashboard.css";
import axios from "axios";

// Create Axios instance (uses backend running on port 5000)
const token = localStorage.getItem("token");

const API = axios.create({
  baseURL: "http://localhost:5000/api",  // ✅ switched from 3000 → 5000
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const AcceptedList = () => {
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [filter, setFilter] = useState("Accepted"); // Accepted | Printed
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchAcceptedRequests();
    const interval = setInterval(fetchAcceptedRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAcceptedRequests = async () => {
    try {
      const resFiles = await API.get("/staff/accepted");
      const resSchedules = await API.get("/staff/accepted-schedules");

      const combined = [
        ...resFiles.data.map(f => ({ ...f, type: "File" })),
        ...resSchedules.data.map(s => ({ ...s, type: "Schedule" })),
      ];

      setAcceptedRequests(combined);
    } catch (error) {
      console.error("Error fetching accepted requests:", error);
    }
  };

  // Mark file as printed or schedule as released
  const handleMarkAsPrinted = async (request) => {
    try {
      console.log("Printing to:", `/staff/print/file/${request.id}`, "baseURL:", API.defaults.baseURL);

      if (request.type === "File") {
        await API.post(`/staff/print/file/${request.id}`); // ✅ hits backend correctly now
      } else {
        await API.put(`/staff/schedules/${request.id}/release`);
      }

      setAcceptedRequests(prev => prev.filter(r => r.id !== request.id));
      setSelectedRequest(null);
      alert(`${request.type} marked as printed successfully!`);
    } catch (error) {
      console.error("Error marking as printed:", error);
      alert("Failed to mark as printed");
    }
  };

  const acceptedOnly = acceptedRequests.filter(r => 
    r.type === "File" ? r.status === "approved" : r.status === "Approved"
  );
  const printedOnly = acceptedRequests.filter(r => 
    r.type === "File" ? r.status === "printed" : r.status === "Released"
  );
  const displayedRequests = filter === "Accepted" ? acceptedOnly : printedOnly;

  return (
    <div className="staff-container">
      <h1>{filter === "Accepted" ? "Accepted Requests" : "Printed Files"}</h1>

      <div className="filter-buttons">
        {["Accepted", "Printed"].map(f => (
          <button
            key={f}
            className={filter === f ? "btn btn-active" : "btn"}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <table className="staff-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>{filter === "Accepted" ? "Item / Schedule" : "Filename"}</th>
            <th>{filter === "Accepted" ? "Requested By" : "Resident"}</th>
            {filter === "Printed" && <th>Printed By / Date</th>}
            {filter === "Accepted" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {displayedRequests.map(r => (
            <tr key={r.id}>
              <td>
                {r.type === "File" ? <FaFileAlt style={{ color: "#2c7" }} /> : <FaCalendarAlt style={{ color: "#37c" }} />}{" "}
                {r.type}
              </td>
              <td>{r.type === "File" ? r.filename : r.item}</td>
              <td>
                <FaUser style={{ marginRight: "5px", color: "#555" }} />
                {r.resident_username}
              </td>
              {filter === "Printed" && (
                <td>
                  <FaPrint style={{ marginRight: "5px", color: "#888" }} />
                  <FaUserCheck style={{ marginRight: "3px", color: "#555" }} />
                  {r.staff_username || r.released_by_username} <br />
                  <span style={{ fontSize: "0.8rem", color: "#666" }}>
                    {new Date(r.released_at).toLocaleString()}
                  </span>
                </td>
              )}
              {filter === "Accepted" && (
                <td>
                  <button
                    onClick={() => setSelectedRequest(r)}
                    style={{ display: "flex", alignItems: "center", gap: "5px" }}
                  >
                    <FaEye /> Preview
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Preview Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>{selectedRequest.item || selectedRequest.filename}</h2>
              <div style={{ textAlign: "right", fontSize: "0.75rem", color: "#999", fontStyle: "italic" }}>
                {selectedRequest.approved_at && <div>{`Approved: ${new Date(selectedRequest.approved_at).toLocaleString()}`}</div>}
                {selectedRequest.released_at && <div>{`Printed: ${new Date(selectedRequest.released_at).toLocaleString()}`}</div>}
              </div>
            </div>

            {selectedRequest.type === "File" ? (
              <iframe
                src={`http://localhost:5000/uploads/${selectedRequest.filename}`} // ✅ matches backend port
                width="100%"
                height="400px"
                title="File Preview"
              />
            ) : (
              <div>
                <p><strong>Schedule Details:</strong></p>
                <p>{`From: ${selectedRequest.date_from} ${selectedRequest.time_from}`}</p>
                <p>{`To: ${selectedRequest.date_to} ${selectedRequest.time_to}`}</p>
                <p>{`Item: ${selectedRequest.item}, Quantity: ${selectedRequest.quantity}`}</p>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn-yellow"
                onClick={() => handleMarkAsPrinted(selectedRequest)}
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <FaPrint /> Print & Mark
              </button>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <FaEye /> Close
              </button>
            </div>
          </div>
        </div>  
      )}
    </div>
  );
};

export default AcceptedList;

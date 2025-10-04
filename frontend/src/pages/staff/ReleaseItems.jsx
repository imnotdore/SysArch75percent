// src/pages/staff/ReleasedItems.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";

export default function ReleasedItems() {
  const [releasedFiles, setReleasedFiles] = useState([]);
  const [releasedSchedules, setReleasedSchedules] = useState([]);
  const token = localStorage.getItem("token");

  const axiosAuth = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    const fetchReleasedItems = async () => {
      try {
        const [filesRes, schedulesRes] = await Promise.all([
          axiosAuth.get("/api/staff/released-files"),
          axiosAuth.get("/api/staff/released-schedules"),
        ]);
        setReleasedFiles(filesRes.data || []);
        setReleasedSchedules(schedulesRes.data || []);
      } catch (err) {
        console.error("Failed to fetch released items:", err);
      }
    };

    fetchReleasedItems();
  }, []);

  const handleNotifyResident = async (residentId, fileId = null, scheduleId = null) => {
    try {
      await axiosAuth.post("/api/staff/notify-resident", {
        residentId,
        fileId,
        scheduleId,
        note: "Bring a plastic bottle to exchange to claim this file.",
      });
      alert("Resident notified successfully!");
    } catch (err) {
      console.error("Failed to notify resident:", err);
      alert("Failed to notify resident.");
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    const dt = new Date(dateStr);
    return dt.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <div style={{ padding: "20px", fontFamily: '"Lexend", sans-serif' }}>
      <h2>Released Files</h2>
      {releasedFiles.length === 0 ? (
        <p>No released files yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#F4BE2A" }}>
              <th style={styles.cell}>Resident</th>
              <th style={styles.cell}>Filename</th>
              <th style={styles.cell}>Released By</th>
              <th style={styles.cell}>Released At</th>
              <th style={styles.cell}>Action</th>
            </tr>
          </thead>
          <tbody>
            {releasedFiles.map((f) => (
              <tr key={`released-file-${f.id}`}>
                <td style={styles.cell}>{f.resident_username || `Resident#${f.resident_id}`}</td>
                <td style={styles.cell}>{f.filename}</td>
                <td style={styles.cell}>{f.released_by_username}</td>
                <td style={styles.cell}>{formatDateTime(f.released_at)}</td>
                <td style={styles.cell}>
                  <button
                    style={styles.notifyBtn}
                    onClick={() => handleNotifyResident(f.resident_id, f.id, null)}
                  >
                    Notify Resident
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: 40 }}>Released Schedules</h2>
      {releasedSchedules.length === 0 ? (
        <p>No released schedules yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#F4BE2A" }}>
              <th style={styles.cell}>Resident</th>
              <th style={styles.cell}>Item</th>
              <th style={styles.cell}>Quantity</th>
              <th style={styles.cell}>Released By</th>
              <th style={styles.cell}>Released At</th>
              <th style={styles.cell}>Action</th>
            </tr>
          </thead>
          <tbody>
            {releasedSchedules.map((s) => (
              <tr key={`released-schedule-${s.id}`}>
                <td style={styles.cell}>{s.user || `Resident#${s.user_id}`}</td>
                <td style={styles.cell}>{s.item}</td>
                <td style={styles.cell}>{s.quantity}</td>
                <td style={styles.cell}>{s.released_by_username}</td>
                <td style={styles.cell}>{formatDateTime(s.released_at)}</td>
                <td style={styles.cell}>
                  <button
                    style={styles.notifyBtn}
                    onClick={() => handleNotifyResident(s.user_id, null, s.id)}
                  >
                    Notify Resident
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: 20, fontStyle: "italic", color: "#555" }}>
        Note for residents: Bring a plastic bottle to exchange to claim this file.
      </p>
    </div>
  );
}

const styles = {
  cell: { border: "1px solid #ccc", padding: 8, textAlign: "center" },
  notifyBtn: { padding: "5px 10px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" },
};

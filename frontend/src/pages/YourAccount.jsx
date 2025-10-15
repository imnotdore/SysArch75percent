import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaFileAlt,
  FaSignOutAlt,
  FaHome,
  FaCalendarAlt,
  FaConciergeBell,
  FaBars,
  FaUserCircle,
} from "react-icons/fa";
import { API_URL } from "../config";
import { FileContext } from "../context/Filecontext";
import { ScheduleContext } from "../context/ScheduleContext";

// Cancel Request Modal (for uploaded files)
const CancelRequestModal = ({ show, onClose, request, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  if (!request) return null;

  const handleCancel = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/files/${request.id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Cancel failed", err);
      alert("Failed to cancel request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal fade ${show ? "show d-block" : ""}`} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3 shadow">
          <div className="modal-header">
            <h5 className="modal-title">Cancel Request</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p><strong>Filename:</strong> {request.original_name || request.filename}</p>
            <p><strong>Date Needed:</strong> {request.date_needed}</p>
            <p><strong>Purpose:</strong> {request.purpose}</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              className="btn btn-danger"
              onClick={handleCancel}
              disabled={loading}
            >
              {loading ? "Cancelling..." : "Cancel Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function YourAccount() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { schedules, fetchSchedules, cancelSchedule } = useContext(ScheduleContext);
  const { fetchFiles: fetchContextFiles } = useContext(FileContext);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const [showCancel, setShowCancel] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // Load logged-in user info
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  // Handle mobile resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // Fetch uploaded files
  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");
      const res = await axios.get(`${API_URL}/api/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUploadedFiles(res.data);
      fetchContextFiles();
    } catch (err) {
      console.error("Failed to fetch files:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Fetch schedules
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setLoading(true);
    fetchSchedules()
      .catch((err) => {
        console.error(err);
        if (err.response && [401, 403].includes(err.response.status)) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to load schedules.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":");
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const getStatusStyle = (status) => {
    let color = "#000";
    let bgColor = "#fff";
    if (status?.toLowerCase() === "completed" || status?.toLowerCase() === "approved") {
      color = "green";
      bgColor = "#d4edda";
    } else if (status?.toLowerCase() === "pending") {
      color = "orange";
      bgColor = "#fff3cd";
    } else if (status?.toLowerCase() === "rejected") {
      color = "red";
      bgColor = "#f8d7da";
    }
    return { ...styles.tableCell, color, backgroundColor: bgColor, fontWeight: "bold" };
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        {isMobile && (
          <FaBars size={24} style={{ cursor: "pointer", marginRight: "15px" }} onClick={() => setSidebarOpen(!sidebarOpen)} />
        )}
        <div style={{ flex: 1, textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? "18px" : "clamp(20px, 2vw, 30px)", fontWeight: 800, letterSpacing: "1px" }}>
            YOUR ACCOUNT
          </h1>
          {user && <p style={{ margin: 0, fontStyle: "italic", fontSize: "14px", color: "#555" }}>Welcome, {user.username}</p>}
        </div>
      </header>

      <div style={{ display: "flex", position: "relative" }}>
        {/* Sidebar */}
        <aside ref={sidebarRef} style={{ ...styles.sidebar, left: sidebarOpen || !isMobile ? 0 : "-240px", position: isMobile ? "fixed" : "relative" }}>
          <div style={styles.accountBox} onClick={() => navigate("/resident/youraccount")}>
            <FaUserCircle size={50} color="black" />
            <p style={{ fontWeight: "bold", marginTop: 10 }}>Your Account</p>
            {user && <p style={{ fontSize: 14, fontStyle: "italic", marginTop: 5 }}>Welcome, {user.username}</p>}
          </div>

          <div style={{ ...styles.menuItem, backgroundColor: "#F4BE2A", color: "black" }} onClick={() => navigate("/resident/dashboard")}>
            <FaHome style={styles.icon} /> Home
          </div>

          <div>
            <div style={{ ...styles.menuItem, backgroundColor: "#F4BE2A", color: "black" }} onClick={() => setServicesOpen(!servicesOpen)}>
              <FaConciergeBell style={styles.icon} /> Services
            </div>
            {servicesOpen && (
              <div style={{ marginLeft: 15, display: "flex", flexDirection: "column", gap: 5, marginTop: 5 }}>
                <div style={{ ...styles.submenu, backgroundColor: "#1E90FF", color: "white" }} onClick={() => navigate("/resident/request")}>
                  <FaFileAlt style={styles.icon} /> Requests
                </div>
                <div style={{ ...styles.submenu, backgroundColor: "#1E90FF", color: "white" }} onClick={() => navigate("/resident/schedule")}>
                  <FaCalendarAlt style={styles.icon} /> Schedule
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: "auto", paddingTop: 20 }}>
            <button onClick={handleLogout} style={{ ...styles.menuItem, backgroundColor: "#ff0000", color: "white", width: "100%", justifyContent: "center", fontWeight: "bold" }}>
              <FaSignOutAlt style={styles.icon} /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ ...styles.mainContent, padding: isMobile ? "15px 10px" : "20px" }}>
          {/* Uploaded Files */}
          <section style={{ marginTop: 40 }}>
            <h2 style={{ color: "#1E90FF" }}>Your Uploaded Files</h2>
            {uploadedFiles.length === 0 ? (
              <p>No uploaded files yet.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={{ backgroundColor: "#1E90FF", color: "black" }}>
                    <th style={styles.tableCell}>Filename</th>
                    <th style={styles.tableCell}>Date Needed</th>
                    <th style={styles.tableCell}>Page Count</th>
                    <th style={styles.tableCell}>Uploaded At</th>
                    <th style={styles.tableCell}>Status</th>
                    <th style={styles.tableCell}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedFiles.map((f) => {
                    let statusColor = "#555"; // default gray
                    if (f.status?.toLowerCase() === "approved") statusColor = "green";
                    if (f.status?.toLowerCase() === "rejected") statusColor = "red";
                    if (f.status?.toLowerCase() === "cancelled") statusColor = "gray";
                    if (f.status?.toLowerCase() === "pending") statusColor = "orange";

                    return (
                      <tr key={f.id}>
                        <td style={styles.tableCell}>{f.original_name || f.filename}</td>
                        <td style={styles.tableCell}>{formatDate(f.date_needed)}</td>
                        <td style={styles.tableCell}>{f.page_count}</td>
                        <td style={styles.tableCell}>{formatDate(f.created_at)}</td>
                        <td style={{ ...styles.tableCell, color: statusColor, fontWeight: "bold" }}>{f.status || "Pending"}</td>
                        <td style={styles.tableCell}>
                          {f.status?.toLowerCase() === "pending" && (
                            <button
                              onClick={() => {
                                setSelectedFile(f);
                                setShowCancel(true);
                              }}
                              style={styles.cancelBtn}
                            >
                              Cancel Request
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>

          {/* Schedules */}
          <section style={{ marginTop: 30 }}>
            <h2 style={{ color: "#28D69F" }}>Your Schedules</h2>
            {loading ? (
              <p>Loading schedules...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : schedules.length === 0 ? (
              <p>No schedules yet.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={{ backgroundColor: "#F4BE2A" }}>
                    <th style={styles.tableCell}>Item</th>
                    <th style={styles.tableCell}>Date Issued</th>
                    <th style={styles.tableCell}>Due Date</th>
                    <th style={styles.tableCell}>Time</th>
                    <th style={styles.tableCell}>Quantity</th>
                    <th style={styles.tableCell}>Status</th>
                    <th style={styles.tableCell}>Reason</th>
                    <th style={styles.tableCell}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => {
                    const dateIssued = new Date(s.date_from);
                    const durationDays = s.duration ?? 2;
                    const dueDate = new Date(dateIssued);
                    dueDate.setDate(dueDate.getDate() + durationDays);

                    return (
                      <tr key={s.id}>
                        <td style={styles.tableCell}>{s.item}</td>
                        <td style={styles.tableCell}>{formatDate(dateIssued)}</td>
                        <td style={styles.tableCell}>{formatDate(dueDate)}</td>
                        <td style={styles.tableCell}>{`${formatTime(s.time_from)} - ${formatTime(s.time_to)}`}</td>
                        <td style={styles.tableCell}>{s.quantity}</td>
                        <td style={getStatusStyle(s.status)}>{s.status}</td>
                        <td style={styles.tableCell}>{s.reason || "-"}</td>
                        <td style={styles.tableCell}>
                          {s.status.toLowerCase() === "pending" && (
                            <button onClick={() => cancelSchedule(s.id)} style={styles.cancelBtn}>
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>
        </main>
      </div>

      {/* Cancel Request Modal */}
      <CancelRequestModal
        show={showCancel}
        onClose={() => setShowCancel(false)}
        request={selectedFile}
        onSuccess={fetchFiles}
      />
    </div>
  );
}

// Styles
const styles = {
  container: { fontFamily: '"Lexend", sans-serif', width: "100%", minHeight: "100%", backgroundColor: "#f5f6fa", color: "#333" },
  header: { backgroundColor: "#FFC107", color: "#000", padding: "20px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 999, boxShadow: "0 3px 8px rgba(0,0,0,0.1)", borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  sidebar: { height: "100vh", width: 220, backgroundColor: "#A43259", color: "white", transition: "left 0.3s ease", zIndex: 1000, padding: "20px 10px", display: "flex", flexDirection: "column" },
  accountBox: { textAlign: "center", marginBottom: 20, padding: 10, backgroundColor: "#fff", borderRadius: 8, color: "black", cursor: "pointer" },
  menuItem: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: 10, fontSize: 15, borderRadius: 6, marginBottom: 10, transition: "all 0.3s" },
  submenu: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: 6, fontSize: 13, borderRadius: 6, width: "90%" },
  icon: { fontSize: 16 },
  mainContent: { flex: 1, overflowY: "auto", minHeight: "100vh", boxSizing: "border-box" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableCell: { border: "1px solid #ccc", padding: 8, textAlign: "center" },
  cancelBtn: { backgroundColor: "#ff4d4f", color: "#fff", border: "none", padding: "5px 10px", borderRadius: 5, cursor: "pointer" },
};

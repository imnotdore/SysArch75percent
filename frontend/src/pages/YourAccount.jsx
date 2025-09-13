import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

export default function YourAccount() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [mySchedules, setMySchedules] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewSchedule, setPreviewSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Load logged-in user info
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  // Mobile detection
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

  // Load uploaded files (demo)
  useEffect(() => {
    setUploadedFiles([
      { id: 1, name: "RequestForm1.pdf", status: "Completed" },
      { id: 2, name: "RequestForm2.docx", status: "Pending" },
      { id: 3, name: "RequestForm3.docx", status: "Rejected" },
    ]);
  }, []);

  // Fetch schedules from backend
  useEffect(() => {
    const fetchSchedules = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/"); // redirect if no token
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/schedules`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMySchedules(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch schedules:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
        } else {
          setError("Failed to load schedules.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getMenuStyle = (path) => ({
    ...menuStyle,
    backgroundColor: location.pathname === path ? "#FFC107" : "transparent",
    color: location.pathname === path ? "black" : "white",
  });

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
    return { ...tableCellStyle, color, backgroundColor: bgColor, fontWeight: "bold", cursor: "pointer" };
  };

  return (
    <div style={{ fontFamily: '"Lexend", sans-serif', width: "100%", minHeight: "100%" }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: "#F4BE2A",
          color: "black",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 999,
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
        }}
      >
        {isMobile && (
          <FaBars size={24} style={{ cursor: "pointer", marginRight: "10px" }} onClick={() => setSidebarOpen(!sidebarOpen)} />
        )}
        <div style={{ flex: 1, textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? "16px" : "clamp(18px, 2vw, 28px)", fontWeight: "bold" }}>
            YOUR ACCOUNT
          </h1>
          {user && (
            <p style={{ margin: 0, fontStyle: "italic", fontSize: "14px", color: "#333" }}>
              Welcome, {user.username}
            </p>
          )}
        </div>
      </header>

      <div style={{ display: "flex", position: "relative" }}>
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          style={{
            position: isMobile ? "fixed" : "relative",
            top: 0,
            left: sidebarOpen || !isMobile ? 0 : "-240px",
            height: "100vh",
            width: "220px",
            backgroundColor: "#A43259",
            color: "white",
            transition: "left 0.3s ease",
            zIndex: 1000,
            padding: "20px 10px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Your Account Box */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "20px",
              padding: "10px",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              color: "black",
              cursor: "pointer",
            }}
            onClick={() => navigate("/resident/youraccount")}
          >
            <FaUserCircle size={50} color="black" />
            <p style={{ fontWeight: "bold", marginTop: "10px" }}>Your Account</p>
            {user && <p style={{ fontSize: "14px", fontStyle: "italic", marginTop: "5px" }}>Welcome, {user.username}</p>}
          </div>

          {/* Menu */}
          <div
            style={{ ...getMenuStyle("/resident/dashboard"), backgroundColor: "#F4BE2A", borderRadius: "8px", padding: "10px", textAlign: "center", marginBottom: "10px" }}
            onClick={() => navigate("/resident/dashboard")}
          >
            <FaHome style={{ marginRight: "5px" }} /> Home
          </div>

          <div>
            <div style={{ ...menuStyle, backgroundColor: "#F4BE2A", color: "black" }} onClick={() => setServicesOpen(!servicesOpen)}>
              <FaConciergeBell style={iconStyle} /> Services
            </div>
            {servicesOpen && (
              <div style={{ marginLeft: "15px", display: "flex", flexDirection: "column", gap: "5px", marginTop: "5px" }}>
                <div
                  style={{ ...submenuStyle, backgroundColor: "#1E90FF", color: "white" }}
                  onClick={() => navigate("/resident/request")}
                >
                  <FaFileAlt style={iconStyle} /> Requests
                </div>
                <div
                  style={{ ...submenuStyle, backgroundColor: "#1E90FF", color: "white" }}
                  onClick={() => navigate("/resident/schedule")}
                >
                  <FaCalendarAlt style={iconStyle} /> Schedule
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: "auto", paddingTop: "20px" }}>
            <button onClick={handleLogout} style={{ ...menuStyle, backgroundColor: "#ff0000", color: "white", width: "100%", justifyContent: "center", fontWeight: "bold" }}>
              <FaSignOutAlt style={iconStyle} /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: isMobile ? "15px 10px" : "20px", overflowY: "auto", minHeight: "100vh", boxSizing: "border-box" }}>
          {/* Uploaded Files */}
          <section style={{ marginTop: "20px" }}>
            <h2 style={{ color: "#28D69F" }}>Uploaded Requests</h2>
            {uploadedFiles.length === 0 ? (
              <p>No uploaded requests yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F4BE2A" }}>
                    <th style={tableCellStyle}>File Name</th>
                    <th style={tableCellStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedFiles.map((file) => (
                    <tr key={file.id}>
                      <td style={{ ...tableCellStyle, cursor: "pointer", textDecoration: "underline", color: "#007bff" }} onClick={() => setPreviewFile(file)}>
                        {file.name}
                      </td>
                      <td style={getStatusStyle(file.status)}>{file.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Schedules */}
          <section style={{ marginTop: "30px" }}>
            <h2 style={{ color: "#28D69F" }}>Your Schedules</h2>
            {loading ? (
              <p>Loading schedules...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : mySchedules.length === 0 ? (
              <p>No schedules yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F4BE2A" }}>
                    <th style={tableCellStyle}>Item</th>
                    <th style={tableCellStyle}>Date From</th>
                    <th style={tableCellStyle}>Date To</th>
                    <th style={tableCellStyle}>Time</th>
                    <th style={tableCellStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mySchedules.map((s) => (
                    <tr key={s.id} onClick={() => setPreviewSchedule(s)}>
                      <td style={tableCellStyle}>{s.item}</td>
                      <td style={tableCellStyle}>{s.dateFrom}</td>
                      <td style={tableCellStyle}>{s.dateTo}</td>
                      <td style={tableCellStyle}>{s.time}</td>
                      <td style={getStatusStyle(s.status)}>{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </main>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>{previewFile.name}</h3>
            {previewFile.name.endsWith(".pdf") ? (
              <iframe src={URL.createObjectURL(previewFile)} style={{ width: "100%", height: "500px" }} />
            ) : (
              <p>No preview available for this file type.</p>
            )}
            <button onClick={() => setPreviewFile(null)} style={modalCloseBtn}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Schedule Preview Modal */}
      {previewSchedule && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Schedule Details</h3>
            <p><strong>Item:</strong> {previewSchedule.item}</p>
            <p><strong>Date From:</strong> {previewSchedule.dateFrom}</p>
            <p><strong>Date To:</strong> {previewSchedule.dateTo}</p>
            <p><strong>Time:</strong> {previewSchedule.time}</p>
            <p><strong>Status:</strong> {previewSchedule.status}</p>
            <button onClick={() => setPreviewSchedule(null)} style={modalCloseBtn}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const menuStyle = { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "10px", fontSize: "15px", borderRadius: "6px", marginBottom: "10px", transition: "all 0.3s" };
const submenuStyle = { ...menuStyle, fontSize: "13px", width: "90%", padding: "6px" };
const iconStyle = { fontSize: "16px" };
const tableCellStyle = { border: "1px solid #ccc", padding: "8px", textAlign: "center" };
const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 };
const modalContent = { backgroundColor: "#fff", padding: "20px", borderRadius: "8px", maxWidth: "400px", width: "90%", maxHeight: "80%", overflowY: "auto" };
const modalCloseBtn = { marginTop: "15px", padding: "8px 12px", borderRadius: "5px", border: "none", backgroundColor: "#A43259", color: "#fff", fontWeight: "bold", cursor: "pointer" };

import { useContext, useState, useEffect, useRef } from "react";
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
  FaDownload,
} from "react-icons/fa";
import { API_URL } from "../config";
import { FileContext } from "../context/Filecontext";

export default function YourAccount() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [mySchedules, setMySchedules] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [previewFile, setPreviewFile] = useState(null); // the file to preview
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const { files, fetchFiles: fetchContextFiles } = useContext(FileContext);

  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Fetch uploaded files
  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");
      const res = await axios.get(`${API_URL}/api/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUploadedFiles(res.data);
      fetchContextFiles(); // update context too
    } catch (err) {
      console.error("Failed to fetch files:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Fetch schedules
 

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleDownload = async (fileName) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/download/${fileName}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download file.");
    }
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
    return { ...tableCellStyle, color, backgroundColor: bgColor, fontWeight: "bold" };
  };

  return (
   <div style={{ fontFamily: '"Lexend", sans-serif', width: "100%", minHeight: "100%", backgroundColor: "#f5f6fa", color: "#333" }}>
  <header style={{
    backgroundColor: "#FFC107",
    color: "#000",
    padding: "20px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 999,
    boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
    borderBottomLeftRadius: "8px",
    borderBottomRightRadius: "8px"
  }}>
    {isMobile && (
      <FaBars size={24} style={{ cursor: "pointer", marginRight: "15px" }} onClick={() => setSidebarOpen(!sidebarOpen)} />
    )}
    <div style={{ flex: 1, textAlign: "center" }}>
      <h1 style={{ margin: 0, fontSize: isMobile ? "18px" : "clamp(20px, 2vw, 30px)", fontWeight: "800", letterSpacing: "1px" }}>
        YOUR ACCOUNT
      </h1>
      {user && <p style={{ margin: 0, fontStyle: "italic", fontSize: "14px", color: "#555" }}>Welcome, {user.username}</p>}
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
    backgroundColor: "#A43259", // match ResidentDashboard
    color: "white",
    transition: "left 0.3s ease",
    zIndex: 1000,
    padding: "20px 10px",
    display: "flex",
    flexDirection: "column",
  }}
>
  {/* Your Account box */}
  <div
    style={{
      textAlign: "center",
      marginBottom: "20px",
      padding: "10px",
      backgroundColor: "#f9f9f9",
      borderRadius: "8px",
      color: "black",
      cursor: "pointer",
      transition: "transform 0.3s ease",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    onClick={() => navigate("/resident/youraccount")}
  >
    <FaUserCircle size={50} color="black" />
    <p style={{ fontWeight: "bold", marginTop: "10px" }}>Your Account</p>
    {user && (
      <p style={{ fontSize: "14px", fontStyle: "italic", marginTop: "5px" }}>
        Welcome, {user.username}
      </p>
    )}
  </div>

  {/* Home */}
  <div
    style={{
      ...menuStyle,
      backgroundColor: "#F4BE2A", // same yellow as dashboard
      color: "black",
      borderRadius: "8px",
      padding: "10px",
      textAlign: "center",
      marginBottom: "10px",
      transition: "transform 0.2s ease",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(10px)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
    onClick={() => navigate("/resident/dashboard")}
  >
    <FaHome style={{ marginRight: "5px" }} /> Home
  </div>

  {/* Services */}
  <div>
    <div
      style={{
        ...menuStyle,
        backgroundColor: "#F4BE2A", // yellow permanent
        color: "black",
        transition: "transform 0.3s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(10px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
      onClick={() => setServicesOpen(!servicesOpen)}
    >
      <FaConciergeBell style={iconStyle} /> Services
    </div>

    {servicesOpen && (
      <div
        style={{
          marginLeft: "15px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          marginTop: "5px",
        }}
      >
        <div
          style={{
            ...submenuStyle,
            backgroundColor: "#1E90FF", // blue permanent
            color: "white",
            transition: "transform 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(10px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
          onClick={() => navigate("/resident/request")}
        >
          <FaFileAlt style={iconStyle} /> Requests
        </div>
        <div
          style={{
            ...submenuStyle,
            backgroundColor: "#1E90FF",
            color: "white",
            transition: "transform 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(10px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
          onClick={() => navigate("/resident/schedule")}
        >
          <FaCalendarAlt style={iconStyle} /> Schedule
        </div>
      </div>
    )}
  </div>

  {/* Logout */}
  <div style={{ marginTop: "auto", paddingTop: "20px" }}>
    <button
      onClick={handleLogout}
      style={{
        ...menuStyle,
        backgroundColor: "#ff0000",
        color: "white",
        width: "100%",
        justifyContent: "center",
        fontWeight: "bold",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(5px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
    >
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
                    <th style={tableCellStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                 {uploadedFiles.map((file) => (
  <tr key={file.id}>
    <td
      style={{ ...tableCellStyle, color: "#007bff", cursor: "pointer" }}
      onClick={() => setPreviewFile(file)}
    >
      {file.filename}
    </td>
    <td style={getStatusStyle(file.status)}>{file.status}</td>
    <td style={tableCellStyle}>
      <button
        onClick={() => handleDownload(file.filename)}
        style={{
          background: "#28D69F",
          color: "#fff",
          padding: "5px 10px",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
        }}
      >
        <FaDownload /> Download
      </button>
    </td>
  </tr>
))}

                </tbody>
              </table>
            )}
          </section>

          {/* Schedules */}
          <section style={{ marginTop: "30px" }}>
            <h2 style={{ color: "#28D69F" }}>Your Schedules</h2>
            {loading ? <p>Loading schedules...</p> :
              error ? <p style={{ color: "red" }}>{error}</p> :
                mySchedules.length === 0 ? <p>No schedules yet.</p> :
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
            }
          </section>
        </main>
      </div>


     {/* File Preview Modal */}
{previewFile && (
  <div style={modalOverlay}>
    <div style={modalContent}>
      <h3>Preview: {previewFile.filename}</h3>
      
      {/* Check file type for rendering */}
      {previewFile.filename.endsWith(".pdf") ? (
        <iframe
          src={`${API_URL}/uploads/${previewFile.filename}`}
          width="100%"
          height="600px"
          title="PDF Preview"
        />
      ) : previewFile.filename.match(/\.(jpg|jpeg|png|gif)$/i) ? (
        <img
          src={`${API_URL}/uploads/${previewFile.filename}`}
          alt={previewFile.filename}
          style={{ width: "100%", maxHeight: "600px", objectFit: "contain" }} // dati 400px

        />
      ) : (
        <p>Preview not available for this file type.</p>
      )}

      <button
        onClick={() => setPreviewFile(null)}
        style={modalCloseBtn}
      >
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
const modalContent = { backgroundColor: "#fff", padding: "20px", borderRadius: "8px", maxWidth: "800px", width: "90%", maxHeight: "90%", overflowY: "auto" };
const modalCloseBtn = { marginTop: "15px", padding: "8px 12px", borderRadius: "5px", border: "none", backgroundColor: "#A43259", color: "#fff", fontWeight: "bold", cursor: "pointer" };
const headerStyle = { backgroundColor: "#F4BE2A", color: "black", padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 999, boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)" };

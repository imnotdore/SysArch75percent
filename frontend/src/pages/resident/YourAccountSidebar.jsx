import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUserCircle, 
  FaHome, 
  FaConciergeBell, 
  FaFileAlt, 
  FaCalendarAlt, 
  FaSignOutAlt,
  FaClipboardList 
} from "react-icons/fa";

export default function ResidentSidebar({ sidebarRef, sidebarOpen, isMobile, onLogout }) {
  const [servicesOpen, setServicesOpen] = useState(true);
  const navigate = useNavigate();
  const [username] = useState(localStorage.getItem("username") || "");

  const menuStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    padding: "10px",
    fontSize: "15px",
    borderRadius: "6px",
    marginBottom: "10px",
    transition: "transform 0.3s ease, background 0.3s",
  };

  const submenuStyle = {
    ...menuStyle,
    fontSize: "13px",
    width: "90%",
    padding: "6px",
    
  };

  return (
    <aside
      ref={sidebarRef}
      style={{
        position: isMobile ? "fixed" : "relative",
        top: 0,
        left: sidebarOpen || !isMobile ? 0 : "-240px",
        height: isMobile ? "100vh" : "150vh",
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
      {/* Your Account */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          color: "black",
          cursor: "pointer",
        }}
        onClick={() => navigate("/resident/youraccount")}
      >
        <FaUserCircle size={50} color="black" />
        <p style={{ fontWeight: "bold", marginTop: "10px" }}>
          {username ? `Welcome, ${username}` : "Your Account"}
        </p>
      </div>

      {/* Home */}
      <div
        style={{ ...menuStyle, backgroundColor: "#F4BE2A", color: "black" }}
        onClick={() => navigate("/resident/dashboard")}
      >
        <FaHome /> Home
      </div>

      {/* Disclosure Board */}
      <div
        style={{ ...menuStyle, backgroundColor: "#1E90FF", color: "white" }}
        onClick={() => navigate("/resident/disclosure-board")}
      >
        <FaClipboardList /> Disclosure Board
      </div>

      {/* Services */}
      <div>
        <div
          style={{ ...menuStyle, backgroundColor: "#F4BE2A", color: "black" }}
          onClick={() => setServicesOpen(!servicesOpen)}
        >
          <FaConciergeBell /> Services
        </div>
        
        {servicesOpen && (
          <div style={{ marginLeft: "15px", display: "flex", flexDirection: "column", gap: "5px" }}>
            <div
              style={{ ...submenuStyle, backgroundColor: "#1E90FF", color: "white" }}
              onClick={() => navigate("/resident/computer-borrowing")}
            >
              <FaClipboardList /> Computer Borrowing
            </div>
            <div
              style={{ ...submenuStyle, backgroundColor: "#1E90FF", color: "white" }}
              onClick={() => navigate("/resident/request")}
            >
              <FaFileAlt /> Requests
            </div>
            <div
              style={{ ...submenuStyle, backgroundColor: "#1E90FF", color: "white" }}
              onClick={() => navigate("/resident/schedule")}
            >
              <FaCalendarAlt /> Schedule
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <div style={{ marginTop: "auto", paddingTop: "20px" }}>
        <button
          onClick={onLogout}
          style={{
            ...menuStyle,
            backgroundColor: "#ff0000",
            color: "white",
            width: "100%",
            justifyContent: "center",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
          }}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  );
}
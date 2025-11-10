import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUserCircle, 
  FaHome, 
  FaConciergeBell, 
  FaFileAlt, 
  FaCalendarAlt, 
  FaSignOutAlt,
  FaClipboardList,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";


export default function ResidentSidebar({ sidebarRef, sidebarOpen, isMobile, onLogout }) {
  const [servicesOpen, setServicesOpen] = useState(false); // Start with services closed
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
    padding: "8px",
    marginLeft: "15px",
    marginBottom: "5px",
  };
 

  
  return (
<aside
  ref={sidebarRef}
  className="resident-sidebar"
  style={{
    position: isMobile ? "fixed" : "relative",
    top: 0,
    left: sidebarOpen || !isMobile ? 0 : "-240px",
    height: isMobile ? "100vh" : "200vh",
    width: "250px",
    backgroundColor: "#A43259",
    color: "white",
    transition: "all 0.3s ease",
    zIndex: 1000,
    padding: "20px 15px",
    display: "flex",
    flexDirection: "column",
    boxShadow: isMobile ? "2px 0 10px rgba(0,0,0,0.1)" : "none",
    overflowY: "auto",
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
          transition: "transform 0.3s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onClick={() => navigate("/resident/youraccount")}
      >
        <FaUserCircle size={50} color="black" />
        <p style={{ fontWeight: "bold", marginTop: "10px" }}>
          {username ? `Welcome, ${username}` : "Your Account"}
        </p>
      </div>

      {/* Home */}
      <div
        style={{ 
          ...menuStyle, 
          backgroundColor: "#F4BE2A", 
          color: "black",
          justifyContent: "space-between"
        }}
        onClick={() => navigate("/resident/dashboard")}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FaHome /> Home
        </div>
      </div>

      {/* Disclosure Board */}
      <div
        style={{ 
          ...menuStyle, 
          backgroundColor: "#1E90FF", 
          color: "white",
          justifyContent: "space-between"
        }}
        onClick={() => navigate("/resident/disclosure-board")}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FaClipboardList /> Disclosure Board
        </div>
      </div>

      {/* Services - WITH DROPDOWN */}
      <div>
        <div
          style={{ 
            ...menuStyle, 
            backgroundColor: "#F4BE2A", 
            color: "black",
            justifyContent: "space-between"
          }}
          onClick={() => setServicesOpen(!servicesOpen)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaConciergeBell /> Services
          </div>
          {servicesOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </div>
        
        {/* Services Dropdown - Only shows when servicesOpen is true */}
        {servicesOpen && (
          <div
            style={{
              marginLeft: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "3px",
              marginTop: "5px",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div
              style={{ 
                ...submenuStyle, 
                backgroundColor: "#1E90FF", 
                color: "white" 
              }}
              onClick={() => navigate("/resident/computer-borrowing")}
            >
              <FaClipboardList /> Computer Borrowing
            </div>
            <div
              style={{ 
                ...submenuStyle, 
                backgroundColor: "#1E90FF", 
                color: "white" 
              }}
              onClick={() => navigate("/resident/request")}
            >
              <FaFileAlt /> Requests
            </div>
            <div
              style={{ 
                ...submenuStyle, 
                backgroundColor: "#1E90FF", 
                color: "white" 
              }}
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


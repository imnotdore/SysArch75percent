import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const [servicesOpen, setServicesOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [username] = useState(localStorage.getItem("username") || "");

  // Function to check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Function to check if any service submenu is active
  const isServicesActive = () => {
    const servicePaths = [
      "/resident/computer-borrowing",
      "/resident/request", 
      "/resident/schedule"
    ];
    return servicePaths.some(path => isActive(path));
  };

  const menuStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    padding: "10px",
    fontSize: "15px",
    borderRadius: "6px",
    marginBottom: "10px",
    transition: "all 0.3s ease",
    transform: "scale(1)",
  };

  const submenuStyle = {
    ...menuStyle,
    fontSize: "13px",
    width: "90%",
    padding: "8px",
    marginLeft: "15px",
    marginBottom: "5px",
  };

  // Active styles
  const activeStyle = {
    backgroundColor: "#F4BE2A", 
    color: "black"
  };

  const inactiveStyle = {
    backgroundColor: "#1E90FF", 
    color: "white"
  };

  // Hover effect for menu items
  const getHoverStyle = (itemId, isActiveItem) => {
    if (hoveredItem === itemId) {
      return {
        transform: "scale(1.05)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        backgroundColor: isActiveItem ? "#F4D166" : "#2A9AFF", // Slightly lighter version
      };
    }
    return {};
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
          backgroundColor: isActive("/resident/youraccount") ? "#F4BE2A" : "#fff",
          borderRadius: "8px",
          color: isActive("/resident/youraccount") ? "black" : "black",
          cursor: "pointer",
          transition: "all 0.3s ease",
          transform: hoveredItem === "account" ? "scale(1.05)" : "scale(1)",
          boxShadow: hoveredItem === "account" ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
        }}
        onMouseEnter={() => setHoveredItem("account")}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => navigate("/resident/youraccount")}
      >
        <FaUserCircle size={50} color={isActive("/resident/youraccount") ? "black" : "black"} />
        <p style={{ fontWeight: "bold", marginTop: "10px" }}>
          {username ? `Welcome, ${username}` : "Your Account"}
        </p>
      </div>

      {/* Home */}
      <div
        style={{ 
          ...menuStyle, 
          ...(isActive("/resident/dashboard") ? activeStyle : inactiveStyle),
          ...getHoverStyle("home", isActive("/resident/dashboard")),
          justifyContent: "space-between"
        }}
        onMouseEnter={() => setHoveredItem("home")}
        onMouseLeave={() => setHoveredItem(null)}
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
          ...(isActive("/resident/disclosure-board") ? activeStyle : inactiveStyle),
          ...getHoverStyle("disclosure", isActive("/resident/disclosure-board")),
          justifyContent: "space-between"
        }}
        onMouseEnter={() => setHoveredItem("disclosure")}
        onMouseLeave={() => setHoveredItem(null)}
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
            ...((servicesOpen || isServicesActive()) ? activeStyle : inactiveStyle),
            ...getHoverStyle("services", (servicesOpen || isServicesActive())),
            justifyContent: "space-between"
          }}
          onMouseEnter={() => setHoveredItem("services")}
          onMouseLeave={() => setHoveredItem(null)}
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
                ...(isActive("/resident/computer-borrowing") ? activeStyle : inactiveStyle),
                ...getHoverStyle("computer", isActive("/resident/computer-borrowing")),
              }}
              onMouseEnter={() => setHoveredItem("computer")}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => navigate("/resident/computer-borrowing")}
            >
              <FaClipboardList /> Computer Borrowing
            </div>
            <div
              style={{ 
                ...submenuStyle, 
                ...(isActive("/resident/request") ? activeStyle : inactiveStyle),
                ...getHoverStyle("request", isActive("/resident/request")),
              }}
              onMouseEnter={() => setHoveredItem("request")}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => navigate("/resident/request")}
            >
              <FaFileAlt /> Requests
            </div>
            <div
              style={{ 
                ...submenuStyle, 
                ...(isActive("/resident/schedule") ? activeStyle : inactiveStyle),
                ...getHoverStyle("schedule", isActive("/resident/schedule")),
              }}
              onMouseEnter={() => setHoveredItem("schedule")}
              onMouseLeave={() => setHoveredItem(null)}
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
          onMouseEnter={() => setHoveredItem("logout")}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={onLogout}
          style={{
            ...menuStyle,
            backgroundColor: hoveredItem === "logout" ? "#ff4444" : "#ff0000",
            color: "white",
            width: "100%",
            justifyContent: "center",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            transform: hoveredItem === "logout" ? "scale(1.05)" : "scale(1)",
            boxShadow: hoveredItem === "logout" ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
          }}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Add CSS for animations using style tag */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </aside>
  );
}
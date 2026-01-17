import React from "react";
import { FaTachometerAlt, FaUserClock, FaUserCheck, FaUsers, FaBox, FaSignOutAlt } from "react-icons/fa";

export      
const Sidebar = ({ sidebarRef, sidebarOpen, activeTab, setActiveTab, setSidebarOpen, handleLogout }) => (
  <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
    <div className="sidebar-header">
      <h2>Admin Panel</h2>
      <div className="close-icon" onClick={() => setSidebarOpen(false)}>
        ×
      </div>
    </div>
    
    <div className="sidebar-nav">
      <button 
        className={activeTab === "dashboard" ? "active" : ""} 
        onClick={() => setActiveTab("dashboard")}
      >
        <FaTachometerAlt /> Dashboard
      </button>
      
      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Residents</h3>
        <button 
          className={activeTab === "pending-res" ? "active" : ""} 
          onClick={() => setActiveTab("pending-res")}
        >
          <FaUserClock /> Pending Residents
        </button>
        <button 
          className={activeTab === "approved-res" ? "active" : ""} 
          onClick={() => setActiveTab("approved-res")}
        >
          <FaUserCheck /> Approved Residents
        </button>
        <button 
          className={activeTab === "all-residents" ? "active" : ""} 
          onClick={() => setActiveTab("all-residents")}
        >
          <FaUsers /> All Residents
        </button>
      </div>
      
      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Staff</h3>
        <button 
          className={activeTab === "pending-staff" ? "active" : ""} 
          onClick={() => setActiveTab("pending-staff")}
        >
          <FaUserClock /> Pending Staff
        </button>
        <button 
          className={activeTab === "approved-staff" ? "active" : ""} 
          onClick={() => setActiveTab("approved-staff")}
        >
          <FaUserCheck /> Approved Staff
        </button>
        <button 
          className={activeTab === "all-staff" ? "active" : ""} 
          onClick={() => setActiveTab("all-staff")}
        >
          <FaUsers /> All Staff
        </button>
      </div>
      
      <button 
        className={activeTab === "items" ? "active" : ""} 
        onClick={() => setActiveTab("items")}
      >
        <FaBox /> Item Management
      </button>
    </div>
    
    <button className="log-btn" onClick={handleLogout}>
      <FaSignOutAlt /> Logout
    </button>
  </div>
);

export default Sidebar;
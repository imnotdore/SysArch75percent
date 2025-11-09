import { FaTimes, FaTachometerAlt, FaUserCheck, FaUserClock, FaSignOutAlt, FaUsers } from "react-icons/fa";

const Sidebar = ({ sidebarRef, sidebarOpen, activeTab, setActiveTab, setSidebarOpen, handleLogout }) => {
  return (
    <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
        <FaTimes className="close-icon" onClick={() => setSidebarOpen(false)} />
      </div>
      <nav className="sidebar-nav">
        <button 
          onClick={() => { setActiveTab("dashboard"); setSidebarOpen(false); }} 
          className={activeTab === "dashboard" ? "active" : ""}
        >
          <FaTachometerAlt/> Dashboard
        </button>
      
        <button 
          onClick={() => { setActiveTab("approved-staff"); setSidebarOpen(false); }} 
          className={activeTab === "approved-staff" ? "active" : ""}
        >
          <FaUserCheck/> Staff Accounts
        </button>
        
        <button 
          onClick={() => { setActiveTab("all-staff"); setSidebarOpen(false); }} 
          className={activeTab === "all-staff" ? "active" : ""}
        >
          <FaUsers/> All Staff
        </button>
        
        <button 
          onClick={() => { setActiveTab("pending-res"); setSidebarOpen(false); }} 
          className={activeTab === "pending-res" ? "active" : ""}
        >
          <FaUserClock/> Pending Residents
        </button>
        
        <button 
          onClick={() => { setActiveTab("approved-res"); setSidebarOpen(false); }} 
          className={activeTab === "approved-res" ? "active" : ""}
        >
          <FaUserCheck/> Approved Residents
        </button>
        
        <button 
          onClick={() => { setActiveTab("all-residents"); setSidebarOpen(false); }} 
          className={activeTab === "all-residents" ? "active" : ""}
        >
          <FaUsers/> All Residents
        </button>
        
        <button 
          onClick={() => { setActiveTab("all"); setSidebarOpen(false); }} 
          className={activeTab === "all" ? "active" : ""}
        >
          <FaUsers/> All Users
        </button>
        
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt/> Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
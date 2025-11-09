// components/StaffSidebar.jsx
import { FaInbox, FaCheckCircle, FaCalendarAlt, FaPrint, FaBoxOpen, FaUndo, FaUsers, FaSignOutAlt, FaTimes } from "react-icons/fa";

export default function StaffSidebar({ 
  sidebarRef, 
  sidebarOpen, 
  activeTab, 
  setActiveTab, 
  setSidebarOpen,
  handleLogout,
  username 
}) {
  const menuItems = [
    { id: "inbox", label: "Inbox", icon: <FaInbox />, badge: null },
    { id: "accepted", label: "Accepted", icon: <FaCheckCircle /> },
    { id: "scheduled", label: "Scheduled", icon: <FaCalendarAlt /> },
    { id: "printed", label: "Printed", icon: <FaPrint /> },
    { id: "released", label: "Released", icon: <FaBoxOpen /> },
    { id: "returned", label: "Returned", icon: <FaUndo /> },
    { id: "accounts", label: "Accounts", icon: <FaUsers /> },
  ];

  return (
    <>
      <aside ref={sidebarRef} className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Staff Panel</h2>
          <FaTimes className="close-icon" onClick={() => setSidebarOpen(false)} />
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={activeTab === item.id ? 'active' : ''}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && <span className="menu-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
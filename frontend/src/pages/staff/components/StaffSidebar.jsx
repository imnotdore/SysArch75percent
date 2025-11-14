import { FaInbox, FaCheckCircle, FaCalendarAlt, FaPrint, FaBoxOpen, FaUndo, FaUsers, FaSignOutAlt, FaTimes } from "react-icons/fa";

export default function StaffSidebar({ 
  sidebarRef, 
  sidebarOpen, 
  sidebarCollapsed,
  activeTab, 
  setActiveTab,
  setSidebarOpen,
  handleLogout,
  username,
  badgeCounts = {}
}) {
  const menuItems = [
    { 
      id: "inbox", 
      label: "Inbox", 
      icon: <FaInbox />, 
      badge: badgeCounts.inbox || 0 
    },
    { 
      id: "accepted", 
      label: "Accepted", 
      icon: <FaCheckCircle />,
      badge: badgeCounts.accepted || 0
    },
    { 
      id: "scheduled", 
      label: "Scheduled", 
      icon: <FaCalendarAlt />,
      badge: badgeCounts.scheduled || 0
    },
    { 
      id: "printed", 
      label: "Printed", 
      icon: <FaPrint />,
      badge: badgeCounts.printed || 0
    },
    { 
      id: "released", 
      label: "Released", 
      icon: <FaBoxOpen />,
      badge: badgeCounts.released || 0
    },
    { 
      id: "returned", 
      label: "Returned", 
      icon: <FaUndo />,
      badge: badgeCounts.returned || 0
    },
    { 
      id: "accounts", 
      label: "Accounts", 
      icon: <FaUsers />,
      badge: badgeCounts.accounts || 0
    },
  ];

  return (
    <>
      <aside 
        ref={sidebarRef} 
        className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
      >
        <div className="sidebar-header">
          <h2>Staff Panel</h2>
          <FaTimes className="close-icon" onClick={() => setSidebarOpen(false)} />
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={activeTab === item.id ? 'active' : ''}
              onClick={() => setActiveTab(item.id)}
              title={item.label} // Add tooltip for collapsed state
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge > 0 && <span className="menu-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="log-btn" onClick={handleLogout} title="Logout">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
import { FaUserCheck, FaUserClock, FaUserPlus, FaBox, FaFileAlt, FaTools } from "react-icons/fa";
import "./styles/DashboardCards.css";
const DashboardCards = ({
  approvedStaff, 
  pendingResidents, 
  approvedResidents, 
  prevCounts, 
  setActiveTab,
  setShowAddStaffModal 
}) => {
  
  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current === 0 ? 0 : 100;
    return Math.round(((current - previous) / previous) * 100);
  };

  const Card = ({ title, count, previousCount, icon: Icon, onClick, showAddButton = false, badge, badgeColor = '#2563eb' }) => {
    const growth = calculateGrowth(count, previousCount);
    
    return (
      <div className="dashboard-card" onClick={onClick}>
        <div className="card-header">
          <div className="card-title-wrapper">
            <div className="icon-wrapper">
              <Icon className="card-icon" />
            </div>
            <h3 className="card-title">{title}</h3>
          </div>
          {badge && (
            <span className="card-badge" style={{ backgroundColor: badgeColor }}>
              {badge}
            </span>
          )}
        </div>
        
        <div className="card-content">
          <div className="card-stats">
            <h2 className="card-count">{count}</h2>
            {previousCount !== undefined && (
              <div className="growth-indicator">
                <span className={`growth-percent ${growth >= 0 ? 'positive' : 'negative'}`}>
                  {growth > 0 ? `+${growth}%` : `${growth}%`}
                </span>
                <span className="growth-label">vs previous</span>
              </div>
            )}
          </div>
          
          {showAddButton ? (
            <button 
              className="card-action-btn primary"
              onClick={(e) => {
                e.stopPropagation();
                setShowAddStaffModal(true);
              }}
            >
              <FaUserPlus /> Add Staff
            </button>
          ) : onClick && (
            <button 
              className="card-action-btn secondary"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              View Details
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p className="dashboard-subtitle">Monitor your system at a glance</p>
      </div>
      
      <div className="dashboard-cards-grid">
        <Card
          title="Staff Accounts"
          count={approvedStaff.length}
          previousCount={prevCounts.current.approvedStaff}
          icon={FaUserCheck}
          onClick={() => setActiveTab("all-staff")}
          showAddButton={true}
          badge="Accounts"
          badgeColor="#3b82f6"
        />

        <Card
          title="Pending Residents"
          count={pendingResidents.length}
          previousCount={prevCounts.current.pendingRes}
          icon={FaUserClock}
          onClick={() => setActiveTab("pending-res")}
          badge="Approval"
          badgeColor="#f59e0b"
        />

        <Card
          title="Approved Residents"
          count={approvedResidents.length}
          previousCount={prevCounts.current.approvedRes}
          icon={FaUserCheck}
          onClick={() => setActiveTab("approved-res")}
          badge="Active"
          badgeColor="#10b981"
        />

        <Card
          title="Total Residents"
          count={pendingResidents.length + approvedResidents.length}
          previousCount={prevCounts.current.pendingRes + prevCounts.current.approvedRes}
          icon={FaUserCheck}
          onClick={() => setActiveTab("all-residents")}
          badge="Total"
          badgeColor="#8b5cf6"
        />

        {/* Quick Access Cards */}
        <Card
          title="Item Management"
          count="Manage"
          previousCount={undefined}
          icon={FaBox}
          onClick={() => setActiveTab("items")}
          badge="Inventory"
          badgeColor="#f97316"
        />

        <Card
          title="Page Limits"
          count="Set"
          previousCount={undefined}
          icon={FaFileAlt}
          onClick={() => setActiveTab("page-limits")}
          badge="Settings"
          badgeColor="#6366f1"
        />

        <Card
          title="System Tools"
          count="Access"
          previousCount={undefined}
          icon={FaTools}
          onClick={() => {}}
          badge="Utilities"
          badgeColor="#6b7280"
        />
      </div>
    </div>
  );
};

export default DashboardCards;
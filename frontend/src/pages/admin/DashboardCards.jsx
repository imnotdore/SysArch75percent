import { FaUserCheck, FaUserClock, FaUserPlus } from "react-icons/fa";

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

  const Card = ({ title, count, previousCount, icon: Icon, onClick, showAddButton = false }) => {
    const growth = calculateGrowth(count, previousCount);
    
    return (
      <div className={`dashboard-card ${title.toLowerCase().includes('pending') ? 'pending-card' : 'approved-card'}`} onClick={onClick}>
        <div className="card-left">
          <div className="icon-wrapper"><Icon className="icon" /></div>
          <h2>{count}</h2>
          <span>{title}</span>
        </div>
        <div className="card-right">
          {showAddButton ? (
            <button 
              className="add-staff-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowAddStaffModal(true);
              }}
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '14px'
              }}
            >
              <FaUserPlus/> Add Staff
            </button>
          ) : (
            <>
              <p className="growth">
                {growth > 0 ? `+${growth}%` : `${growth}%`}
              </p>
              <span>Growth</span>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-cards">
      <Card
        title="Staff Accounts"
        count={approvedStaff.length}
        previousCount={prevCounts.current.approvedStaff}
        icon={FaUserCheck}
        onClick={() => setActiveTab("approved-staff")}
        showAddButton={true}
      />

      <Card
        title="Pending Residents"
        count={pendingResidents.length}
        previousCount={prevCounts.current.pendingRes}
        icon={FaUserClock}
        onClick={() => setActiveTab("pending-res")}
      />

      <Card
        title="Approved Residents"
        count={approvedResidents.length}
        previousCount={prevCounts.current.approvedRes}
        icon={FaUserCheck}
        onClick={() => setActiveTab("approved-res")}
      />

      <Card
  title="Total Residents"
  count={pendingResidents.length + approvedResidents.length}
  previousCount={prevCounts.current.pendingRes + prevCounts.current.approvedRes}
  icon={FaUserCheck}
  onClick={() => setActiveTab("all-residents")} // Baguhin mula "all" to "all-residents"
/>
    </div>
  );
};

export default DashboardCards;
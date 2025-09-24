import { FaUserCircle, FaInbox, FaBullhorn, FaCalendarAlt, FaCheckCircle, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./StaffDashboard.css";

export default function StaffLayout({ children, activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const username = getUsername();
  const staffId = getStaffId();

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar open">
        <div className="sidebar-header">
          <FaUserCircle size={50} color="black" />
          <p>{username || "Staff Account"}</p>
        </div>

        <div className={`menu-item ${activeTab === "inbox" ? "active" : ""}`} onClick={() => setActiveTab("inbox")}>
          <FaInbox /> Inbox
        </div>

        <div className={`menu-item ${activeTab === "accepted" ? "active" : ""}`} onClick={() => setActiveTab("accepted")}>
          <FaCheckCircle /> Accepted List
        </div>

        <div className={`menu-item ${activeTab === "scheduled" ? "active" : ""}`} onClick={() => setActiveTab("scheduled")}>
          <FaCalendarAlt /> Scheduled Items
        </div>

        <div className="menu-item" onClick={() => navigate("/staff/announcements")}>
          <FaBullhorn /> Announcements
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      <main className="dashboard-main">{children}</main>
    </div>
  );
}

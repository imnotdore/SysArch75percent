// components/StaffHeader.jsx
import { FaBars } from "react-icons/fa";

const StaffHeader = ({ sidebarOpen, setSidebarOpen, username }) => {
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <header className="staff-header">
      <button 
        className="menu-icon"
        onClick={toggleSidebar}
      >
        <FaBars />
      </button>
      <h1>Staff Dashboard</h1>
      <div className="staff-info">
        <span>Welcome, {username}</span>
      </div>
    </header>
  );
};

export default StaffHeader;
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  // Check if logged in when component loads
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <p>Welcome to the Barangay Management System</p>
      
      <div className="dashboard-content">
        <div className="card">
          <h3>Quick Actions</h3>
          <button>Manage Residents</button>
          <button>View Reports</button>
        </div>
      </div>
      
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
}

export default Dashboard
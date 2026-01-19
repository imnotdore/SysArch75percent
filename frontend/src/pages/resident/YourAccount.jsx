import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { FileContext } from "../../context/Filecontext";
import { ScheduleContext } from "../../context/ScheduleContext";
import ResidentLayout from "./ResidentLayout";
import CancelRequestModal from "./modals/CancelRequestModal";
import FileUploadsSection from "./sections/FileUploadsSection";
import SchedulesSection from "./sections/SchedulesSection";
import { API_URL } from "../../config";
import "../resident/styles/YourAccount.css"; // Separate CSS

// Icons para sa computer borrowing
import { Monitor, Clock, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function YourAccount() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { schedules, fetchSchedules } = useContext(ScheduleContext);
  const { fetchFiles: fetchContextFiles } = useContext(FileContext);
  const [showCancel, setShowCancel] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [computerRequestsLoading, setComputerRequestsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schedulesError, setSchedulesError] = useState(null);
  const [computerRequestsError, setComputerRequestsError] = useState(null);
  
  // Pagination states
  const [currentView, setCurrentView] = useState("files"); // "files", "schedules", o "computer"
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Increased to 10 for better view

  // State para sa Daily Usage Limits
  const [dailyLimits, setDailyLimits] = useState({
    resident: 30,
    global: 100
  });
  const [todayUsage, setTodayUsage] = useState({
    resident: 0,
    system: 0
  });
  const [limitsLoading, setLimitsLoading] = useState(true);

  // State para sa Computer Borrowing Requests
  const [computerRequests, setComputerRequests] = useState([]);
  const [computerStats, setComputerStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    done: 0,
    cancelled: 0
  });

  // Fetch uploaded files
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      let filesArray = [];
      
      if (Array.isArray(res.data)) {
        filesArray = res.data;
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        filesArray = res.data.data;
      } else if (res.data && res.data.success && Array.isArray(res.data.data)) {
        filesArray = res.data.data;
      }
      
      setUploadedFiles(filesArray);
      
      if (fetchContextFiles) {
        fetchContextFiles();
      }
    } catch (err) {
      console.error("Failed to fetch files:", err);
      setError(err.response?.data?.message || "Failed to load files");
      setUploadedFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch daily usage limits and today's usage
  const fetchDailyUsage = async () => {
    try {
      setLimitsLoading(true);
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      if (!userId) return;

      // Fetch today's usage
      const response = await axios.get(`${API_URL}/api/auth/today-usage/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const { data } = response.data;
        setTodayUsage({
          resident: data.userUsage || 0,
          system: data.systemUsage || 0
        });
        
        if (data.limits) {
          setDailyLimits({
            resident: data.limits.resident || 30,
            global: data.limits.global || 100
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch daily usage:", err);
      // Use default values if fetch fails
      setDailyLimits({ resident: 30, global: 100 });
      setTodayUsage({ resident: 0, system: 0 });
    } finally {
      setLimitsLoading(false);
    }
  };

  // Fetch schedules
  const fetchUserSchedules = async () => {
    try {
      setSchedulesLoading(true);
      if (fetchSchedules) {
        await fetchSchedules();
      }
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
      setSchedulesError(err.response?.data?.message || "Failed to load schedules");
    } finally {
      setSchedulesLoading(false);
    }
  };

 // Palitan ang fetchComputerRequests function (line ~166):
const fetchComputerRequests = async () => {
  try {
    setComputerRequestsLoading(true);
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/api/computer-requests/my-requests`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const requests = Array.isArray(response.data) ? response.data : [];
    setComputerRequests(requests);
    
    // Calculate stats
    const stats = {
      total: requests.length,
      pending: requests.filter(r => r && r.status === 'Pending').length,
      approved: requests.filter(r => r && r.status === 'Approved').length,
      done: requests.filter(r => r && r.status === 'Done').length,
      cancelled: requests.filter(r => r && r.status === 'Cancelled').length
    };
    setComputerStats(stats);
    
  } catch (err) {
    console.error("Error fetching computer requests:", err);
    
    // Fallback: Try the default endpoint if my-requests fails
    if (err.response?.status === 404) {
      try {
        const token = localStorage.getItem("token");
        const fallbackResponse = await axios.get(`${API_URL}/api/computer-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const requests = Array.isArray(fallbackResponse.data) ? fallbackResponse.data : [];
        setComputerRequests(requests);
        
        const stats = {
          total: requests.length,
          pending: requests.filter(r => r && r.status === 'Pending').length,
          approved: requests.filter(r => r && r.status === 'Approved').length,
          done: requests.filter(r => r && r.status === 'Done').length,
          cancelled: requests.filter(r => r && r.status === 'Cancelled').length
        };
        setComputerStats(stats);
        setComputerRequestsError(null);
        return;
      } catch (fallbackErr) {
        console.error("Fallback also failed:", fallbackErr);
      }
    }
    
    setComputerRequestsError("Failed to load computer requests");
    setComputerRequests([]);
    setComputerStats({ total: 0, pending: 0, approved: 0, done: 0, cancelled: 0 });
  } finally {
    setComputerRequestsLoading(false);
  }
};

  // Cancel computer request
// Palitan ang cancelComputerRequest function (line ~190):
const cancelComputerRequest = async (requestId, reason = '') => {
  try {
    if (!reason || reason.trim() === "") {
      reason = prompt("Please enter cancellation reason:");
      if (!reason || reason.trim() === "") {
        alert("Cancellation reason is required.");
        return;
      }
    }

    const token = localStorage.getItem("token");
    const response = await axios.put(
      `${API_URL}/api/computer-requests/${requestId}/cancel`,
      { reason: reason.trim() },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (response.data.success) {
      fetchComputerRequests();
      alert("Computer request cancelled successfully!");
    }
  } catch (error) {
    console.error("Error cancelling computer request:", error);
    
    // Try DELETE method as fallback
    if (error.response?.status === 404 || error.response?.status === 405) {
      try {
        const token = localStorage.getItem("token");
        const deleteResponse = await axios.delete(
          `${API_URL}/api/computer-requests/${requestId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (deleteResponse.data.success || deleteResponse.data.message) {
          fetchComputerRequests();
          alert("Computer request cancelled successfully!");
          return;
        }
      } catch (deleteErr) {
        console.error("DELETE fallback also failed:", deleteErr);
      }
    }
    
    alert(error.response?.data?.error || "Failed to cancel request");
  }
};

  useEffect(() => {
    fetchFiles();
    fetchUserSchedules();
    fetchDailyUsage();
    fetchComputerRequests();
  }, []);

  // Helper functions para sa files
  const getFilteredCount = (status) => {
    if (!Array.isArray(uploadedFiles)) return 0;
    return uploadedFiles.filter(f => f && f.status === status).length;
  };

  const getStatusDisplayName = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'processing': 'Processing',
      'go_to_pickup': 'Ready for Pickup',
      'approved': 'Approved',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'rejected': 'Rejected',
    };
    
    return statusMap[status] || status;
  };

  const getStatusStyle = (status) => {
    const styles = {
      'pending': {
        backgroundColor: '#FFF3CD',
        color: '#856404',
        border: '1px solid #FFEEBA'
      },
      'processing': {
        backgroundColor: '#D1ECF1',
        color: '#0C5460',
        border: '1px solid #BEE5EB'
      },
      'go_to_pickup': {
        backgroundColor: '#D4EDDA',
        color: '#155724',
        border: '1px solid #C3E6CB'
      },
      'approved': {
        backgroundColor: '#D4EDDA',
        color: '#155724',
        border: '1px solid #C3E6CB'
      },
      'completed': {
        backgroundColor: '#D4EDDA',
        color: '#155724',
        border: '1px solid #C3E6CB'
      },
      'cancelled': {
        backgroundColor: '#F8D7DA',
        color: '#721C24',
        border: '1px solid #F5C6CB'
      },
      'rejected': {
        backgroundColor: '#F8D7DA',
        color: '#721C24',
        border: '1px solid #F5C6CB'
      },
      // Computer borrowing status
      'Pending': {
        backgroundColor: '#FFF3CD',
        color: '#856404',
        border: '1px solid #FFEEBA'
      },
      'Approved': {
        backgroundColor: '#D4EDDA',
        color: '#155724',
        border: '1px solid #C3E6CB'
      },
      'Done': {
        backgroundColor: '#D1ECF1',
        color: '#0C5460',
        border: '1px solid #BEE5EB'
      },
      'Cancelled': {
        backgroundColor: '#F8D7DA',
        color: '#721C24',
        border: '1px solid #F5C6CB'
      }
    };
    
    return styles[status] || {
      backgroundColor: '#E2E3E5',
      color: '#383D41',
      border: '1px solid #D6D8DB'
    };
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for computer requests
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Calculate duration for computer requests
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  // Calculate stats
  const stats = {
    totalFiles: Array.isArray(uploadedFiles) ? uploadedFiles.length : 0,
    totalSchedules: Array.isArray(schedules) ? schedules.length : 0,
    totalComputerRequests: computerStats.total,
    pendingFiles: getFilteredCount('pending'),
    readyFiles: getFilteredCount('go_to_pickup'),
    pendingComputerRequests: computerStats.pending
  };

  // Pagination logic
  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    if (currentView === "files") {
      return Array.isArray(uploadedFiles) ? uploadedFiles.slice(startIndex, endIndex) : [];
    } else if (currentView === "schedules") {
      return Array.isArray(schedules) ? schedules.slice(startIndex, endIndex) : [];
    } else if (currentView === "computer") {
      return Array.isArray(computerRequests) ? computerRequests.slice(startIndex, endIndex) : [];
    }
    return [];
  };

  const totalPages = Math.ceil(
    (currentView === "files" ? stats.totalFiles :
     currentView === "schedules" ? stats.totalSchedules :
     stats.totalComputerRequests) / itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    setCurrentPage(1); // Reset to first page when changing view
  };

  // Handle file cancellation with usage refresh
  const handleCancelFile = async (file) => {
    setSelectedFile(file);
    setShowCancel(true);
  };

  const handleCancelSuccess = () => {
    fetchFiles(); // Refresh files list
    fetchDailyUsage(); // Refresh daily usage
  };

  // Calculate usage progress
  const calculateUsagePercentage = (used, total) => {
    if (total <= 0) return 0;
    return Math.min(100, (used / total) * 100);
  };

  const residentPercentage = calculateUsagePercentage(todayUsage.resident, dailyLimits.resident);
  const systemPercentage = calculateUsagePercentage(todayUsage.system, dailyLimits.global);

  // Render custom schedule table
  const renderScheduleTable = () => {
    const currentSchedules = getCurrentItems();
    
    if (schedulesLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading schedules...</p>
        </div>
      );
    }

    if (schedulesError) {
      return (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <p>{schedulesError}</p>
        </div>
      );
    }

    if (currentSchedules.length === 0) {
      return (
        <div className="no-data-table">
          <div className="no-data-icon">📅</div>
          <h4>No schedules found</h4>
          <p>You don't have any borrowing schedules yet.</p>
        </div>
      );
    }

    return (
      <div className="schedule-table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Borrow Date</th>
              <th>Return Date</th>
              <th>Time</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentSchedules.map((schedule, index) => (
              <tr key={schedule.id || index} className="schedule-row">
                <td>
                  <div className="item-cell">
                    <span className="item-icon">📦</span>
                    <span className="item-name">{schedule.item || 'N/A'}</span>
                  </div>
                </td>
                <td>
                  <div className="date-cell">
                    <span className="date-icon">📅</span>
                    {formatDate(schedule.date_from)}
                  </div>
                </td>
                <td>
                  <div className="date-cell">
                    <span className="date-icon">🔄</span>
                    {formatDate(schedule.date_to)}
                  </div>
                </td>
                <td>
                  <div className="time-cell">
                    <span className="time-icon">⏰</span>
                    {schedule.time_from} - {schedule.time_to}
                  </div>
                </td>
                <td>
                  <div className="quantity-cell">
                    <span className="quantity-badge">{schedule.quantity || 1}</span>
                  </div>
                </td>
                <td>
                  <span 
                    className="status-badge" 
                    style={getStatusStyle(schedule.status || 'pending')}
                  >
                    {getStatusDisplayName(schedule.status || 'pending')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render Computer Borrowing Table
  const renderComputerRequestsTable = () => {
    const currentRequests = getCurrentItems();
    
    if (computerRequestsLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading computer requests...</p>
        </div>
      );
    }

    if (computerRequestsError) {
      return (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <p>{computerRequestsError}</p>
        </div>
      );
    }

    if (currentRequests.length === 0) {
      return (
        <div className="no-data-table">
          <div className="no-data-icon">🖥️</div>
          <h4>No computer borrowing requests</h4>
          <p>You haven't made any computer borrowing requests yet.</p>
        </div>
      );
    }

    return (
      <div className="computer-requests-container">
        <div className="computer-requests-grid">
          {currentRequests.map((request) => (
            <div key={request.id} className="computer-request-card">
              <div className="computer-request-header">
                <div className="computer-icon">
                  <Monitor size={20} />
                </div>
                <div className="computer-info">
                  <h4>{request.pc_name || 'Computer Station'}</h4>
                  <div className="computer-details">
                    <span className="request-id">Request #{request.id}</span>
                    <span className="request-date">
                      Created: {formatDate(request.created_at)}
                    </span>
                  </div>
                </div>
                <div className="computer-status">
                  <span 
                    className="status-badge" 
                    style={getStatusStyle(request.status)}
                  >
                    {request.status}
                  </span>
                </div>
              </div>
              
              <div className="computer-request-body">
                <div className="computer-detail-row">
                  <div className="detail-item">
                    <Calendar size={14} />
                    <span><strong>Date:</strong> {formatDate(request.date)}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={14} />
                    <span><strong>Time:</strong> {formatTime(request.start_time)} - {formatTime(request.end_time)}</span>
                  </div>
                  <div className="detail-item">
                    <span><strong>Duration:</strong> {calculateDuration(request.start_time, request.end_time)}</span>
                  </div>
                </div>
                
                {request.reason && request.status === 'Cancelled' && (
                  <div className="cancellation-reason">
                    <AlertCircle size={14} />
                    <span><strong>Cancellation Reason:</strong> {request.reason}</span>
                  </div>
                )}
                
              
              </div>
              
              <div className="computer-request-footer">
                {request.status === 'Pending' && (
                  <button
                    className="cancel-request-btn"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to cancel this computer request?")) {
                        cancelComputerRequest(request.id);
                      }
                    }}
                  >
                    <XCircle size={14} />
                    Cancel Request
                  </button>
                )}
                
                {request.status === 'Approved' && (
                  <div className="approved-notice">
                    <CheckCircle size={14} />
                    <span>Approved! Please proceed to the computer station at your scheduled time.</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Daily Limits Section
  const renderDailyLimitsSection = () => {
    const residentRemaining = Math.max(0, dailyLimits.resident - todayUsage.resident);
    const systemRemaining = Math.max(0, dailyLimits.global - todayUsage.system);

    return (
      <div className="daily-limits-section">
        <h3 className="limits-title">📊 Daily Usage Limits</h3>
        
        <div className="limits-container">
          {/* Personal Limit Card */}
          <div className="limit-card">
            <div className="limit-header">
              <div className="limit-icon">👤</div>
              <div>
                <h4>Your Daily Limit</h4>
                <p>Personal printing allowance</p>
              </div>
            </div>
            
            <div className="limit-progress">
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${residentPercentage > 80 ? 'warning' : ''}`}
                  style={{ width: `${residentPercentage}%` }}
                ></div>
              </div>
              
              <div className="progress-text">
                <div className="current-count">
                  {todayUsage.resident} <span>/ {dailyLimits.resident} pages</span>
                </div>
                
                <div className="remaining-count">
                  {residentRemaining > 0 ? (
                    <>
                      <span className="remaining-icon">✅</span>
                      {residentRemaining} pages remaining
                    </>
                  ) : (
                    <>
                      <span className="remaining-icon">⚠️</span>
                      Limit reached
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* System Capacity Card */}
          <div className="limit-card">
            <div className="limit-header">
              <div className="limit-icon">🌐</div>
              <div>
                <h4>System Capacity</h4>
                <p>Shared printer availability</p>
              </div>
            </div>
            
            <div className="limit-progress">
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${systemPercentage > 80 ? 'warning' : ''}`}
                  style={{ width: `${systemPercentage}%` }}
                ></div>
              </div>
              
              <div className="progress-text">
                <div className="current-count">
                  {todayUsage.system} <span>/ {dailyLimits.global} pages</span>
                </div>
                
                <div className="remaining-count">
                  {systemRemaining > 0 ? (
                    <>
                      <span className="remaining-icon">✅</span>
                      {systemRemaining} pages available
                    </>
                  ) : (
                    <>
                      <span className="remaining-icon">⚠️</span>
                      System full
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    
    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-button prev-next"
      >
        ← Previous
      </button>
    );

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`pagination-button ${currentPage === i ? 'active' : ''}`}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(<span key={i} className="pagination-dots">...</span>);
      }
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-button prev-next"
      >
        Next →
      </button>
    );

    return pages;
  };

  return (
    <ResidentLayout title="">
      <div className="your-account-container">
        
        {/* ========== DASHBOARD HEADER ========== */}
        <div className="dashboard-header">
          <h2 className="dashboard-title">Your Account Dashboard</h2>
          <p className="dashboard-subtitle">Manage your printing requests, borrowing schedules, and computer reservations</p>
        </div>

        {/* ========== DAILY LIMITS SECTION ========== */}
        {!limitsLoading && renderDailyLimitsSection()}

        {/* ========== QUICK STATS ========== */}
        <div className="quick-stats">
          <div 
            className={`stat-box ${currentView === "files" ? "active-view" : ""}`}
            onClick={() => handleViewChange("files")}
            style={{ cursor: "pointer" }}
          >
            <div className="stat-icon">📄</div>
            <div className="stat-info">
              <h3>{stats.totalFiles}</h3>
              <p>Total Files</p>
            </div>
          </div>
          
          <div 
            className={`stat-box ${currentView === "schedules" ? "active-view" : ""}`}
            onClick={() => handleViewChange("schedules")}
            style={{ cursor: "pointer" }}
          >
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>{stats.totalSchedules}</h3>
              <p>Schedules</p>
            </div>
          </div>
          
          <div 
            className={`stat-box ${currentView === "computer" ? "active-view" : ""}`}
            onClick={() => handleViewChange("computer")}
            style={{ cursor: "pointer" }}
          >
            <div className="stat-icon">🖥️</div>
            <div className="stat-info">
              <h3>{stats.totalComputerRequests}</h3>
              <p>Computer Requests</p>
            </div>
          </div>
          
          <div className="stat-box">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pendingFiles + stats.pendingComputerRequests}</h3>
              <p>Pending Total</p>
            </div>
          </div>
        </div>

        {/* ========== VIEW SELECTION ========== */}
        <div className="view-selection">
          <button
            className={`view-button ${currentView === "files" ? "active" : ""}`}
            onClick={() => handleViewChange("files")}
          >
            <span className="view-icon">📄</span>
            My Files ({stats.totalFiles})
          </button>
          <button
            className={`view-button ${currentView === "schedules" ? "active" : ""}`}
            onClick={() => handleViewChange("schedules")}
          >
            <span className="view-icon">📅</span>
            My Schedules ({stats.totalSchedules})
          </button>
          <button
            className={`view-button ${currentView === "computer" ? "active" : ""}`}
            onClick={() => handleViewChange("computer")}
          >
            <span className="view-icon">🖥️</span>
            Computer Requests ({stats.totalComputerRequests})
          </button>
        </div>

        {/* ========== MAIN CONTENT ========== */}
        <div className="main-content">
          
          {/* Current Items Count */}
          <div className="items-count">
            Showing <strong>{getCurrentItems().length}</strong> of{" "}
            <strong>{
              currentView === "files" ? stats.totalFiles :
              currentView === "schedules" ? stats.totalSchedules :
              stats.totalComputerRequests
            }</strong>{" "}
            {currentView === "files" ? "files" : 
             currentView === "schedules" ? "schedules" : 
             "computer requests"}
            {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
          </div>

          {/* Files View */}
          {currentView === "files" && (
            <div className="content-section">
              <div className="section-header">
                <h3><span className="section-icon">📄</span> My Uploaded Files</h3>
              </div>
              
              <FileUploadsSection 
                uploadedFiles={getCurrentItems()}
                loading={loading}
                error={error}
                onCancelFile={handleCancelFile}
                getStatusDisplayName={getStatusDisplayName}
                getStatusStyle={getStatusStyle}
              />
            </div>
          )}

          {/* Schedules View */}
          {currentView === "schedules" && (
            <div className="content-section">
              <div className="section-header">
                <h3><span className="section-icon">📅</span> My Borrowing Schedules</h3>
              </div>
              
              {renderScheduleTable()}
            </div>
          )}

          {/* Computer Requests View */}
          {currentView === "computer" && (
            <div className="content-section">
              <div className="section-header">
                <h3><span className="section-icon">🖥️</span> My Computer Borrowing Requests</h3>
              </div>
              
              {renderComputerRequestsTable()}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination">
                {renderPagination()}
              </div>
            </div>
          )}
        </div>

        <CancelRequestModal
          show={showCancel}
          onClose={() => setShowCancel(false)}
          request={selectedFile}
          onSuccess={handleCancelSuccess}
        />
      </div>
    </ResidentLayout>
  );
}
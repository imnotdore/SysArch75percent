import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { FileContext } from "../../context/Filecontext";
import { ScheduleContext } from "../../context/ScheduleContext";
import ResidentLayout from "./ResidentLayout";
import CancelRequestModal from "./modals/CancelRequestModal";
import FileUploadsSection from "./sections/FileUploadsSection";
import SchedulesSection from "./sections/SchedulesSection";
import { API_URL } from "../../config";
import "./YourAccount.css"; // Separate CSS

export default function YourAccount() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { schedules, fetchSchedules } = useContext(ScheduleContext);
  const { fetchFiles: fetchContextFiles } = useContext(FileContext);
  const [showCancel, setShowCancel] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schedulesError, setSchedulesError] = useState(null);
  
  // Pagination states
  const [currentView, setCurrentView] = useState("files"); // "files" or "schedules"
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Increased to 10 for better view

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

  useEffect(() => {
    fetchFiles();
    fetchUserSchedules();
  }, []);

  // Helper functions
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

  // Calculate stats
  const stats = {
    totalFiles: Array.isArray(uploadedFiles) ? uploadedFiles.length : 0,
    totalSchedules: Array.isArray(schedules) ? schedules.length : 0,
    pendingFiles: getFilteredCount('pending'),
    readyFiles: getFilteredCount('go_to_pickup')
  };

  // Pagination logic
  const getCurrentItems = () => {
    if (currentView === "files") {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return Array.isArray(uploadedFiles) ? uploadedFiles.slice(startIndex, endIndex) : [];
    } else {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return Array.isArray(schedules) ? schedules.slice(startIndex, endIndex) : [];
    }
  };

  const totalPages = Math.ceil(
    currentView === "files" 
      ? stats.totalFiles / itemsPerPage 
      : stats.totalSchedules / itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    setCurrentPage(1); // Reset to first page when changing view
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

  return (
    <ResidentLayout title="">
      <div className="your-account-container">
        
        {/* ========== DASHBOARD HEADER ========== */}
        <div className="dashboard-header">
          <h2 className="dashboard-title">Your Account Dashboard</h2>
          <p className="dashboard-subtitle">Manage your printing requests and borrowing schedules</p>
        </div>

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
          
          <div className="stat-box">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pendingFiles}</h3>
              <p>Pending</p>
            </div>
          </div>
          
          <div className="stat-box">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{stats.readyFiles}</h3>
              <p>Ready</p>
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
        </div>

        {/* ========== MAIN CONTENT ========== */}
        <div className="main-content">
          
          {/* Current Items Count */}
          <div className="items-count">
            Showing <strong>{getCurrentItems().length}</strong> of{" "}
            <strong>{currentView === "files" ? stats.totalFiles : stats.totalSchedules}</strong>{" "}
            {currentView === "files" ? "files" : "schedules"}
            {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
          </div>

          {/* Files View */}
          {currentView === "files" && (
            <div className="content-section">
              <div className="section-header">
                <h3><span className="section-icon">📄</span> My Uploaded Files</h3>
                <div className="header-actions">

                </div>
              </div>
              
              <FileUploadsSection 
                uploadedFiles={getCurrentItems()}
                loading={loading}
                error={error}
                onCancelFile={(file) => {
                  setSelectedFile(file);
                  setShowCancel(true);
                }}
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
                <div className="header-actions">
                  
                </div>
              </div>
              
              {renderScheduleTable()}
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

          {/* No Data Message */}
          {getCurrentItems().length === 0 && !loading && !schedulesLoading && (
            <div className="no-data-message">
              <div className="no-data-icon">
                {currentView === "files" ? "📄" : "📅"}
              </div>
              <h3>No {currentView === "files" ? "files" : "schedules"} found</h3>
              <p>
                {currentView === "files" 
                  ? "You haven't uploaded any files yet. Click 'Upload New File' to get started."
                  : "You don't have any borrowing schedules. Click 'New Schedule' to create one."
                }
              </p>
            </div>
          )}

        </div>

        <CancelRequestModal
          show={showCancel}
          onClose={() => setShowCancel(false)}
          request={selectedFile}
          onSuccess={fetchFiles}
        />
      </div>
    </ResidentLayout>
  );
}
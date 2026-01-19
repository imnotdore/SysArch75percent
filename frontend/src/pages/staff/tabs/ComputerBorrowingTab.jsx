import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Search, 
  Monitor, 
  Calendar, 
  Clock, 
  User, 
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  RefreshCw,
  Info,
  ExternalLink,
  Eye,
  Ban,
  CheckSquare
} from "lucide-react";
import { API_URL } from "../../../config";
import "./tabs.css/ComputerBorrowingTab.css";

export default function ComputerBorrowingTab() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelRequestId, setCancelRequestId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResident, setSelectedResident] = useState(null);
  const [residents, setResidents] = useState([]);
  const [computerRequests, setComputerRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    done: 0,
    cancelled: 0
  });

  const fetchComputerRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/staff/computer-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const requests = Array.isArray(response.data) ? response.data : [];
      setComputerRequests(requests);
      
      const stats = {
        total: requests.length,
        pending: requests.filter(r => r && r.status === 'Pending').length,
        approved: requests.filter(r => r && r.status === 'Approved').length,
        done: requests.filter(r => r && r.status === 'Done').length,
        cancelled: requests.filter(r => r && r.status === 'Cancelled').length
      };
      setStats(stats);
      
      const residentsMap = {};
      requests.forEach(request => {
        if (!request || !request.user_id) return;
        
        if (!residentsMap[request.user_id]) {
          residentsMap[request.user_id] = {
            id: request.user_id,
            username: request.resident_username || `User_${request.user_id}`,
            full_name: request.resident_full_name || request.resident_username || `User ${request.user_id}`,
            email: request.resident_email || '',
            pending_count: 0,
            total_requests: 0,
            latest_request: request.created_at
          };
        }
        residentsMap[request.user_id].total_requests++;
        if (request.status === 'Pending') {
          residentsMap[request.user_id].pending_count++;
        }
        if (!residentsMap[request.user_id].latest_request || 
            new Date(request.created_at) > new Date(residentsMap[request.user_id].latest_request)) {
          residentsMap[request.user_id].latest_request = request.created_at;
        }
      });
      
      setResidents(Object.values(residentsMap));
    } catch (error) {
      console.error("Error fetching computer requests:", error);
      alert("Failed to load computer requests");
      setComputerRequests([]);
      setResidents([]);
      setStats({ total: 0, pending: 0, approved: 0, done: 0, cancelled: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchResidentRequests = async (residentId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/staff/computer-requests/resident/${residentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setComputerRequests(response.data);
    } catch (error) {
      console.error("Error fetching resident requests:", error);
      alert("Failed to load resident's requests");
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, status, reason = '') => {
    try {
      if (status === 'Cancelled') {
        setCancelRequestId(requestId);
        setCancelReason('');
        setShowCancelModal(true);
        return;
      }

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/api/staff/computer-requests/${requestId}/status`,
        { status, ...(reason && { reason }) },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        if (selectedResident) {
          fetchResidentRequests(selectedResident.id);
        } else {
          fetchComputerRequests();
        }
        
        alert(`Request ${status.toLowerCase()} successfully!`);
        setShowRequestModal(false);
      }
    } catch (error) {
      console.error("Error updating request status:", error);
      alert(error.response?.data?.error || "Failed to update request status");
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert("Please enter a cancellation reason.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/api/staff/computer-requests/${cancelRequestId}/status`,
        { status: 'Cancelled', reason: cancelReason.trim() },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        if (selectedResident) {
          fetchResidentRequests(selectedResident.id);
        } else {
          fetchComputerRequests();
        }
        
        alert("Request cancelled successfully!");
        setShowRequestModal(false);
        setShowCancelModal(false);
      }
    } catch (error) {
      console.error("Error cancelling request:", error);
      alert(error.response?.data?.error || "Failed to cancel request");
    } finally {
      setShowCancelModal(false);
      setCancelRequestId(null);
      setCancelReason("");
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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

  const getStatusStyle = (status) => {
    const styles = {
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

  const filteredRequests = computerRequests.filter(request => {
    if (!request || !request.status) return false;
    if (filter === "all") return true;
    return request.status === filter;
  });

  const filteredResidents = residents.filter(resident => 
    resident.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchComputerRequests();
  }, []);

  useEffect(() => {
    if (selectedResident) {
      fetchResidentRequests(selectedResident.id);
    }
  }, [selectedResident]);

  // If viewing specific resident
  if (selectedResident) {
    return (
      <div className="computer-borrowing-staff-container">
        {/* Header */}
        <div className="requests-header">
          <button className="back-btn" onClick={() => setSelectedResident(null)}>
            <ChevronLeft size={16} />
            Back to All Residents
          </button>
          <div className="resident-info">
            <h2>{selectedResident.full_name}'s Computer Requests</h2>
            <div className="request-summary">
              {computerRequests.length} total request{computerRequests.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-cards">
          <div className="stat-card total">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{computerRequests.length}</h3>
              <p>Total Requests</p>
            </div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{computerRequests.filter(r => r.status === 'Pending').length}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card approved">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{computerRequests.filter(r => r.status === 'Approved').length}</h3>
              <p>Approved</p>
            </div>
          </div>
          <div className="stat-card done">
            <div className="stat-icon">✔️</div>
            <div className="stat-content">
              <h3>{computerRequests.filter(r => r.status === 'Done').length}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="filter-section">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({computerRequests.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'Pending' ? 'active' : ''}`}
              onClick={() => setFilter('Pending')}
            >
              Pending ({computerRequests.filter(r => r.status === 'Pending').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'Approved' ? 'active' : ''}`}
              onClick={() => setFilter('Approved')}
            >
              Approved ({computerRequests.filter(r => r.status === 'Approved').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'Done' ? 'active' : ''}`}
              onClick={() => setFilter('Done')}
            >
              Done ({computerRequests.filter(r => r.status === 'Done').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'Cancelled' ? 'active' : ''}`}
              onClick={() => setFilter('Cancelled')}
            >
              Cancelled ({computerRequests.filter(r => r.status === 'Cancelled').length})
            </button>
          </div>
        </div>

        {/* Requests Grid */}
        <div className="requests-grid">
          {loading ? (
            <div className="loading-state">
              <RefreshCw className="loading-spinner" />
              <p>Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="empty-state">
              <Monitor className="empty-icon" />
              <p>No computer requests found {filter !== 'all' ? `with status "${filter}"` : ''}.</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div 
                key={request.id} 
                className="request-card computer-card"
                onClick={() => {
                  setSelectedRequest(request);
                  setShowRequestModal(true);
                }}
              >
                <div className="request-icon">
                  <Monitor />
                </div>
                <div className="request-content">
                  <div className="request-header">
                    <h4 className="request-title">{request.pc_name || 'PC'}</h4>
                    <div className="request-time">
                      <Clock size={14} />
                      <span>{formatDate(request.date)} • {formatTime(request.start_time)}</span>
                    </div>
                  </div>
                  <div className="request-details">
                    <div className="detail-item">
                      <strong>Date:</strong> {formatDate(request.date)}
                    </div>
                    <div className="detail-item">
                      <strong>Time:</strong> {formatTime(request.start_time)} - {formatTime(request.end_time)}
                    </div>
                    <div className="detail-item">
                      <strong>Duration:</strong> {calculateDuration(request.start_time, request.end_time)}
                    </div>
                  </div>
                  <div className="request-footer">
                    <span className="request-id">Request #{request.id}</span>
                    <span className="created-at">
                      Created: {new Date(request.created_at).toLocaleDateString('en-PH')}
                    </span>
                  </div>
                </div>
                <div className="request-actions">
                  {request.status === 'Pending' && (
                    <>
                      <button
                        className="action-btn approve-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Approve this computer request?")) {
                            updateRequestStatus(request.id, 'Approved');
                          }
                        }}
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        className="action-btn cancel-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCancelRequestId(request.id);
                          setCancelReason('');
                          setShowCancelModal(true);
                        }}
                      >
                        <XCircle size={16} />
                        Cancel
                      </button>
                    </>
                  )}
                  {request.status === 'Approved' && (
                    <button
                      className="action-btn done-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Mark this request as done?")) {
                          updateRequestStatus(request.id, 'Done');
                        }
                      }}
                    >
                      <CheckSquare size={16} />
                      Mark Done
                    </button>
                  )}
                  <div 
                    className={`request-status ${request.status ? request.status.toLowerCase() : 'unknown'}`}
                    style={getStatusStyle(request.status)}
                  >
                    {request.status || 'Unknown'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Request Details Modal */}
        {showRequestModal && selectedRequest && (
          <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Computer Request Details</h3>
                <button className="modal-close" onClick={() => setShowRequestModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="detail-section">
                  <h4>Computer Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Computer:</span>
                      <span className="detail-value">{selectedRequest.pc_name || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{formatDate(selectedRequest.date)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Time Slot:</span>
                      <span className="detail-value">
                        {formatTime(selectedRequest.start_time)} - {formatTime(selectedRequest.end_time)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">
                        {calculateDuration(selectedRequest.start_time, selectedRequest.end_time)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Resident Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">{selectedResident?.full_name || selectedRequest.resident_full_name || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Username:</span>
                      <span className="detail-value">{selectedResident?.username || selectedRequest.resident_username || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{selectedResident?.email || selectedRequest.resident_email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Request Status</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span 
                        className="status-badge"
                        style={getStatusStyle(selectedRequest.status)}
                      >
                        {selectedRequest.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">
                        {new Date(selectedRequest.created_at).toLocaleString('en-PH')}
                      </span>
                    </div>
                    {selectedRequest.approved_by && (
                      <div className="detail-item">
                        <span className="detail-label">Approved By:</span>
                        <span className="detail-value">
                          Staff #{selectedRequest.approved_by}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                {selectedRequest.status === 'Pending' && (
                  <>
                    <button
                      className="modal-btn approve-btn"
                      onClick={() => {
                        if (window.confirm("Approve this computer request?")) {
                          updateRequestStatus(selectedRequest.id, 'Approved');
                        }
                      }}
                    >
                      <CheckCircle size={16} />
                      Approve Request
                    </button>
                    <button
                      className="modal-btn cancel-btn"
                      onClick={() => {
                        setCancelRequestId(selectedRequest.id);
                        setCancelReason('');
                        setShowCancelModal(true);
                      }}
                    >
                      <XCircle size={16} />
                      Cancel Request
                    </button>
                  </>
                )}
                {selectedRequest.status === 'Approved' && (
                  <button
                    className="modal-btn done-btn"
                    onClick={() => {
                      if (window.confirm("Mark this request as done?")) {
                        updateRequestStatus(selectedRequest.id, 'Done');
                      }
                    }}
                  >
                    <CheckSquare size={16} />
                    Mark as Done
                  </button>
                )}
                <button
                  className="modal-btn close-btn"
                  onClick={() => setShowRequestModal(false)}
                > 
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Cancellation Reason Modal */}
        {showCancelModal && (
          <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
            <div className="modal-content cancel-reason-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Cancel Computer Request</h3>
                <button className="modal-close" onClick={() => setShowCancelModal(false)}>×</button>
              </div>
              
              <div className="cancel-reason-content">
                <h4>Please enter cancellation reason:</h4>
                <textarea
                  className="reason-input"
                  placeholder="Enter the reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  autoFocus
                />
                
                <div className="reason-actions">
                  <button
                    className="reason-btn cancel"
                    onClick={() => setShowCancelModal(false)}
                  >
                    Go Back
                  </button>
                  <button
                    className="reason-btn submit"
                    onClick={handleConfirmCancel}
                    disabled={!cancelReason.trim()}
                  >
                    Confirm Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main Dashboard View (All Residents)
  return (
    <div className="computer-borrowing-staff-container">
      {/* Header with Stats */}
      <div className="dashboard-header">
        <h2>Computer Borrowing Management</h2>
        <p>Manage computer reservations and requests</p>
        
        <div className="overall-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Requests</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.approved}</span>
            <span className="stat-label">Approved</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.done}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search residents by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="search-actions">
          <button className="refresh-btn" onClick={fetchComputerRequests}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="quick-filter-tabs">
        <button 
          className={`quick-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Requests ({stats.total})
        </button>
        <button 
          className={`quick-filter-btn ${filter === 'Pending' ? 'active' : ''}`}
          onClick={() => setFilter('Pending')}
        >
          ⏳ Pending ({stats.pending})
        </button>
        <button 
          className={`quick-filter-btn ${filter === 'Approved' ? 'active' : ''}`}
          onClick={() => setFilter('Approved')}
        >
          ✅ Approved ({stats.approved})
        </button>
      </div>

      {/* Two-Column Layout */}
      <div className="dashboard-layout">
        {/* Left Column - Residents List */}
        <div className="residents-column">
          <div className="section-header">
            <h3>Residents with Requests</h3>
            {filteredResidents.length > 0 && (
              <span className="total-count">{filteredResidents.length} resident{filteredResidents.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {loading ? (
            <div className="loading-state">
              <RefreshCw className="loading-spinner" />
              <p>Loading residents...</p>
            </div>
          ) : filteredResidents.length === 0 ? (
            <div className="empty-state">
              <User className="empty-icon" />
              <p>{searchTerm ? 'No residents found matching your search.' : 'No residents with computer borrowing requests.'}</p>
            </div>
          ) : (
            <div className="resident-cards">
              {filteredResidents.map((resident) => (
                <div
                  key={`resident-${resident.id}`}
                  className="resident-card"
                  onClick={() => setSelectedResident(resident)}
                >
                  <div className="resident-avatar">
                    <User />
                  </div>
                  <div className="resident-details">
                    <div className="resident-name">
                      <strong>{resident.full_name}</strong>
                      {resident.pending_count > 0 && (
                        <span className="request-badge">{resident.pending_count}</span>
                      )}
                    </div>
                    <div className="resident-meta">
                      <span className="username">@{resident.username}</span>
                      <span className="request-count">
                        {resident.total_requests} request{resident.total_requests !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="resident-time">
                    <Clock size={14} />
                    <span>
                      {new Date(resident.latest_request).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="resident-arrow">→</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Recent Requests */}
        <div className="requests-column">
          <div className="section-header">
            <h3>Recent Requests</h3>
            <button 
              className="view-all-btn"
              onClick={() => setFilter('all')}
            >
              View All
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <RefreshCw className="loading-spinner" />
              <p>Loading requests...</p>
            </div>
          ) : computerRequests.length === 0 ? (
            <div className="empty-state">
              <Monitor className="empty-icon" />
              <p>No computer requests found.</p>
            </div>
          ) : (
            <div className="recent-requests">
              {computerRequests.slice(0, 5).map((request) => (
                request && request.id && (
                  <div 
                    key={request.id}
                    className="recent-request"
                    onClick={() => {
                      const resident = residents.find(r => r && r.id === request.user_id);
                      if (resident) {
                        setSelectedResident(resident);
                      }
                    }}
                  >
                    <div className="recent-request-icon">
                      <Monitor size={18} />
                    </div>
                    <div className="recent-request-content">
                      <div className="recent-request-title">
                        <strong>{request.pc_name || 'PC'}</strong>
                        <span 
                          className="status-badge-small"
                          style={getStatusStyle(request.status)}
                        >
                          {request.status || 'Unknown'}
                        </span>
                      </div>
                      <div className="recent-request-details">
                        <span>{request.resident_username || 'Resident'}</span>
                        <span>•</span>
                        <span>{formatDate(request.date)}</span>
                        <span>•</span>
                        <span>{formatTime(request.start_time)}</span>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Cancellation Reason Modal for Main View */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content cancel-reason-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Computer Request</h3>
              <button className="modal-close" onClick={() => setShowCancelModal(false)}>×</button>
            </div>
            
            <div className="cancel-reason-content">
              <h4>Please enter cancellation reason:</h4>
              <textarea
                className="reason-input"
                placeholder="Enter the reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                autoFocus
              />
              
              <div className="reason-actions">
                <button
                  className="reason-btn cancel"
                  onClick={() => setShowCancelModal(false)}
                >
                  Go Back
                </button>
                <button
                  className="reason-btn submit"
                  onClick={handleConfirmCancel}
                  disabled={!cancelReason.trim()}
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
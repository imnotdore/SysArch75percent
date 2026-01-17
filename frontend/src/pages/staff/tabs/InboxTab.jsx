// InboxTab.js - Updated version with page limits sidebar
import { useState, useEffect } from "react";
import { 
  FaSearch, 
  FaFileAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaUser,
  FaCog,
  FaUsers,
  FaChartBar,
  FaUserTie,
  FaEdit,
  FaSave,
  FaTimes
} from "react-icons/fa";

export default function InboxTab({
  residents,
  selectedResident,
  selectedResidentRequests,
  searchTerm,
  setSearchTerm,
  setSelectedResident,
  fetchResidentRequests,
  setSelectedFile,
  setSelectedSchedule
}) {
  // Add these new states for page limits
  const [showPageLimits, setShowPageLimits] = useState(false);
  const [limits, setLimits] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [editingLimit, setEditingLimit] = useState(null);
  const [formData, setFormData] = useState({
    type: 'resident',
    value: '',
    staff_id: '',
    description: ''
  });
  const [limitsLoading, setLimitsLoading] = useState(false);

  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Format time like Gmail
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-PH', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Fetch page limits data
  const fetchPageLimits = async () => {
    try {
      setLimitsLoading(true);
      const response = await fetch(`${baseUrl}/api/staff/page-limits`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setLimits(data.data || []);
    } catch (err) {
      console.error("Error fetching page limits:", err);
    } finally {
      setLimitsLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/staff/staff/manage`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setStaffList(data.data || []);
    } catch (err) {
      console.error("Error fetching staff list:", err);
    }
  };

  const handleSaveLimit = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/staff/page-limits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('✅ Limit saved successfully!');
        setEditingLimit(null);
        setFormData({ type: 'resident', value: '', staff_id: '', description: '' });
        fetchPageLimits();
      }
    } catch (err) {
      alert('❌ Failed to save limit');
    }
  };

  // Initialize on component mount
  useEffect(() => {
    if (showPageLimits) {
      fetchPageLimits();
      fetchStaffList();
    }
  }, [showPageLimits]);

  // Get current limits for display
  const getCurrentLimit = (type) => {
    const limit = limits.find(l => l.type === type && !l.staff_id);
    return limit ? limit.value : (type === 'resident' ? 30 : 100);
  };

  // Page Limits Sidebar Component
  const PageLimitsSidebar = () => (
    <div className="page-limits-sidebar">
      <div className="sidebar-header">
        <h3><FaCog /> Page Limits</h3>
        <button 
          className="close-sidebar-btn"
          onClick={() => setShowPageLimits(false)}
        >
          <FaTimes />
        </button>
      </div>

      {limitsLoading ? (
        <div className="loading">Loading limits...</div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-item">
              <div className="stat-icon resident">
                <FaUsers />
              </div>
              <div className="stat-info">
                <span className="stat-label">Per Resident</span>
                <span className="stat-value">{getCurrentLimit('resident')} pages/day</span>
              </div>
              <button 
                className="edit-small-btn"
                onClick={() => {
                  const limit = limits.find(l => l.type === 'resident' && !l.staff_id);
                  setEditingLimit(limit?.id || 'new');
                  setFormData({
                    type: 'resident',
                    value: limit?.value || '30',
                    staff_id: '',
                    description: limit?.description || ''
                  });
                }}
              >
                <FaEdit />
              </button>
            </div>

            <div className="stat-item">
              <div className="stat-icon system">
                <FaChartBar />
              </div>
              <div className="stat-info">
                <span className="stat-label">System Total</span>
                <span className="stat-value">{getCurrentLimit('global')} pages/day</span>
              </div>
              <button 
                className="edit-small-btn"
                onClick={() => {
                  const limit = limits.find(l => l.type === 'global' && !l.staff_id);
                  setEditingLimit(limit?.id || 'new');
                  setFormData({
                    type: 'global',
                    value: limit?.value || '100',
                    staff_id: '',
                    description: limit?.description || ''
                  });
                }}
              >
                <FaEdit />
              </button>
            </div>
          </div>


          {/* Edit Limit Modal */}
          {editingLimit && (
            <div className="edit-limit-modal">
              <div className="modal-header">
                <h4>{editingLimit === 'new' ? 'Add New Limit' : 'Edit Limit'}</h4>
                <button 
                  className="close-modal-btn"
                  onClick={() => {
                    setEditingLimit(null);
                    setFormData({ type: 'resident', value: '', staff_id: '', description: '' });
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label>Limit Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    disabled={editingLimit !== 'new'}
                  >
                    <option value="resident">Resident Daily Limit</option>
                    <option value="global">System Daily Limit</option>
                    <option value="staff_daily">Staff Daily Limit</option>
                  </select>
                </div>

                {formData.type === 'staff_daily' && (
                  <div className="form-group">
                    <label>Staff Member</label>
                    <select 
                      value={formData.staff_id}
                      onChange={(e) => setFormData({...formData, staff_id: e.target.value})}
                    >
                      <option value="">Select Staff Member</option>
                      {staffList.map(staff => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} ({staff.username})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Page Limit</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    placeholder="Enter maximum pages per day"
                  />
                </div>

                <div className="form-group">
                  <label>Description (Optional)</label>
                  <input 
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter description"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setEditingLimit(null);
                    setFormData({ type: 'resident', value: '', staff_id: '', description: '' });
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="save-btn"
                  onClick={handleSaveLimit}
                  disabled={!formData.value || (formData.type === 'staff_daily' && !formData.staff_id)}
                >
                  <FaSave /> Save
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Filter residents
  const filteredResidents = residents.filter((r) =>
    (r.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Main inbox content
  const renderInboxContent = () => {
    if (!selectedResident) {
      return (
        <>
          {/* Add Page Limits Button */}
          <div className="page-limits-toggle">
            <button 
              className="page-limits-btn"
              onClick={() => setShowPageLimits(!showPageLimits)}
            >
              <FaCog /> {showPageLimits ? 'Hide Limits' : 'Page Limits'}
            </button>
          </div>

          <div className="search-bar">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search residents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <section className="resident-list">
            <div className="section-header">
              <h2>Resident Requests</h2>
              {filteredResidents.length > 0 && (
                <span className="total-count">{filteredResidents.length} residents</span>
              )}
            </div>
            
            {filteredResidents.length === 0 ? (
              <div className="empty-state">
                <FaUser size={48} color="#9ca3af" />
                <p>{searchTerm ? 'No residents found matching your search.' : 'No residents with pending requests.'}</p>
              </div>
            ) : (
              <div className="resident-items">
                {filteredResidents.map((resident) => (
                  <div
                    key={`resident-${resident.id}`}
                    className="resident-item"
                    onClick={() => {
                      setSelectedResident(resident);
                      fetchResidentRequests(resident.id);
                    }}
                  >
                    <div className="resident-avatar">
                      <FaUser />
                    </div>
                    <div className="resident-details">
                      <div className="resident-name">
                        <strong>{resident.username || "Unnamed Resident"}</strong>
                        {resident.pending_count > 0 && (
                          <span className="request-badge">{resident.pending_count}</span>
                        )}
                      </div>
                      <div className="resident-meta">
                        <span className="request-count">
                          {resident.pending_count || 0} pending request{resident.pending_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="resident-time">
                      <FaClock size={12} />
                      <span>{formatTime(resident.latest_request || resident.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      );
    }

    // Resident requests view
    return (
      <section className="resident-requests">
        <div className="requests-header">
          <button
            className="back-btn"
            onClick={() => {
              setSelectedResident(null);
            }}
          >
            ← Back to Residents
          </button>
          <div className="resident-info">
            <h2>{selectedResident.username}'s Requests</h2>
            <div className="request-summary">
              {selectedResidentRequests.files.length + selectedResidentRequests.schedules.length} total requests
            </div>
          </div>
        </div>

        {/* FILES */}
        {selectedResidentRequests.files.length > 0 && (
          <div className="requests-section">
            <h3 className="section-title">
              File Requests
              <span className="section-badge">{selectedResidentRequests.files.length}</span>
            </h3>
            <div className="requests-grid">
              {selectedResidentRequests.files.map((file) => (
                <div 
                  key={file.id} 
                  className="request-card file-card"
                  data-status={file.status.toLowerCase()}
                  onClick={() => file.status.toLowerCase() !== "claimed" && setSelectedFile(file)}
                >
                  <div className="request-icon">
                    <FaFileAlt size={20} />
                  </div>
                  <div className="request-content">
                    <div className="request-header">
                      <h4 className="request-title">{file.filename}</h4>
                      <div className="request-time">
                        <FaClock size={12} />
                        <span>{formatTime(file.created_at)}</span>
                      </div>
                    </div>
                    <div className="request-details">
                      <div className="detail-item">
                        <strong>Pages:</strong> {file.page_count}
                      </div>
                      <div className="detail-item">
                        <strong>Date Needed:</strong>{" "}
                        {new Date(file.date_needed).toLocaleDateString("en-PH")}
                      </div>
                      <div className="detail-item">
                        <strong>Uploaded:</strong>{" "}
                        {new Date(file.created_at).toLocaleDateString("en-PH", {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className={`request-status ${file.status.toLowerCase()}`}>
                    {file.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCHEDULES */}
        {selectedResidentRequests.schedules.length > 0 && (
          <div className="requests-section">
            <h3 className="section-title">
              Schedule Requests
              <span className="section-badge">{selectedResidentRequests.schedules.length}</span>
            </h3>
            <div className="requests-grid">
              {selectedResidentRequests.schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="request-card schedule-card"
                  data-status={schedule.status.toLowerCase()}
                  onClick={() => schedule.status.toLowerCase() !== "claimed" && setSelectedSchedule(schedule)}
                >
                  <div className="request-icon">
                    <FaCalendarAlt size={20} />
                  </div>
                  <div className="request-content">
                    <div className="request-header">
                      <h4 className="request-title">{schedule.item}</h4>
                      <div className="request-time">
                        <FaClock size={12} />
                        <span>{formatTime(schedule.created_at)}</span>
                      </div>
                    </div>
                    <div className="request-details">
                      <div className="detail-item">
                        <strong>Quantity:</strong> {schedule.quantity}
                      </div>
                    </div>
                  </div>
                  <div className={`request-status ${schedule.status.toLowerCase()}`}>
                    {schedule.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {selectedResidentRequests.files.length === 0 && selectedResidentRequests.schedules.length === 0 && (
          <div className="empty-state">
            <FaFileAlt size={48} color="#9ca3af" />
            <p>No pending requests found for this resident.</p>
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="inbox-container">
      {showPageLimits && <PageLimitsSidebar />}
      
      <div className={`inbox-content ${showPageLimits ? 'with-sidebar' : ''}`}>
        {renderInboxContent()}
      </div>
    </div>
  );
}
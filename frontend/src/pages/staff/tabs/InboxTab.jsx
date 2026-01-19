import { useState } from "react";
import {
  Search,
  FileText,
  Calendar,
  Clock,
  User,
  X,
  Check,
  XCircle
} from "lucide-react";

import "././tabs.css/InboxTab.css";

export default function InboxTab({
  residents,
  selectedResident,
  selectedResidentRequests,
  searchTerm,
  setSearchTerm,
  setSelectedResident,
  fetchResidentRequests,
  setSelectedFile,
  setSelectedSchedule,
  handleFileStatusChange,
  loading = false
}) {
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

  const filteredResidents = residents.filter((r) =>
    (r.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Local state for modals
  const [localSelectedFile, setLocalSelectedFile] = useState(null);
  const [localSelectedSchedule, setLocalSelectedSchedule] = useState(null);

  // Function to handle file click
  const handleFileClick = (file) => {
    if (file.status.toLowerCase() !== "claimed") {
      setLocalSelectedFile(file);
      if (setSelectedFile) {
        setSelectedFile(file);
      }
    }
  };

  // Function to handle schedule click
  const handleScheduleClick = (schedule) => {
    if (schedule.status.toLowerCase() !== "claimed") {
      setLocalSelectedSchedule(schedule);
      if (setSelectedSchedule) {
        setSelectedSchedule(schedule);
      }
    }
  };

  return (
    <div className="inbox-container">
      {!selectedResident ? (
        <div className="inbox-content">
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
                <User className="empty-icon" />
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
                      <User />
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
                      <Clock />
                      <span>{formatTime(resident.latest_request || resident.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <section className="resident-requests">
          <div className="requests-header">
            <button className="back-btn" onClick={() => setSelectedResident(null)}>
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
                    onClick={() => handleFileClick(file)}
                  >
                    <div className="request-icon">
                      <FileText />
                    </div>
                    <div className="request-content">
                      <div className="request-header">
                        <h4 className="request-title">{file.filename}</h4>
                        <div className="request-time">
                          <Clock />
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
                    onClick={() => handleScheduleClick(schedule)}
                  >
                    <div className="request-icon">
                      <Calendar />
                    </div>
                    <div className="request-content">
                      <div className="request-header">
                        <h4 className="request-title">{schedule.item}</h4>
                        <div className="request-time">
                          <Clock />
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
              <FileText />
              <p>No pending requests found for this resident.</p>
            </div>
          )}
        </section>
      )}

      {/* FILE PREVIEW MODAL */}
      {localSelectedFile && (
        <div className="preview-modal-overlay" onClick={() => setLocalSelectedFile(null)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📄 File Request Preview</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setLocalSelectedFile(null)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-content">
              <div className="file-preview-info">
                <div className="info-row">
                  <strong>Filename:</strong>
                  <span>{localSelectedFile.filename}</span>
                </div>
                <div className="info-row">
                  <strong>Pages:</strong>
                  <span>{localSelectedFile.page_count}</span>
                </div>
                <div className="info-row">
                  <strong>Date Needed:</strong>
                  <span>{new Date(localSelectedFile.date_needed).toLocaleDateString("en-PH")}</span>
                </div>
                <div className="info-row">
                  <strong>Purpose:</strong>
                  <span>{localSelectedFile.purpose}</span>
                </div>
                {localSelectedFile.special_instructions && (
                  <div className="info-row">
                    <strong>Special Instructions:</strong>
                    <span>{localSelectedFile.special_instructions}</span>
                  </div>
                )}
                <div className="info-row">
                  <strong>Submitted:</strong>
                  <span>{formatTime(localSelectedFile.created_at)}</span>
                </div>
                <div className="info-row">
                  <strong>Status:</strong>
                  <span className={`status-badge status-${localSelectedFile.status.toLowerCase()}`}>
                    {localSelectedFile.status}
                  </span>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn-approve"
                  onClick={() => {
                    if (handleFileStatusChange) {
                      handleFileStatusChange(localSelectedFile.id, 'approved');
                    }
                    setLocalSelectedFile(null);
                  }}
                >
                  <Check size={18} />
                  Approve
                </button>
                <button 
                  className="btn-reject"
                  onClick={() => {
                    if (handleFileStatusChange) {
                      handleFileStatusChange(localSelectedFile.id, 'rejected');
                    }
                    setLocalSelectedFile(null);
                  }}
                >
                  <XCircle size={18} />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE PREVIEW MODAL */}
      {localSelectedSchedule && (
        <div className="preview-modal-overlay" onClick={() => setLocalSelectedSchedule(null)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📅 Schedule Request Preview</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setLocalSelectedSchedule(null)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-content">
              <div className="file-preview-info">
                <div className="info-row">
                  <strong>Item:</strong>
                  <span>{localSelectedSchedule.item}</span>
                </div>
                <div className="info-row">
                  <strong>Quantity:</strong>
                  <span>{localSelectedSchedule.quantity}</span>
                </div>
                <div className="info-row">
                  <strong>Borrow Date:</strong>
                  <span>{new Date(localSelectedSchedule.date_from).toLocaleDateString("en-PH")}</span>
                </div>
                <div className="info-row">
                  <strong>Return Date:</strong>
                  <span>{new Date(localSelectedSchedule.date_to).toLocaleDateString("en-PH")}</span>
                </div>
                <div className="info-row">
                  <strong>Time:</strong>
                  <span>{localSelectedSchedule.time_from} - {localSelectedSchedule.time_to}</span>
                </div>
                {localSelectedSchedule.reason && (
                  <div className="info-row">
                    <strong>Reason:</strong>
                    <span>{localSelectedSchedule.reason}</span>
                  </div>
                )}
                <div className="info-row">
                  <strong>Submitted:</strong>
                  <span>{formatTime(localSelectedSchedule.created_at)}</span>
                </div>
                <div className="info-row">
                  <strong>Status:</strong>
                  <span className={`status-badge status-${localSelectedSchedule.status.toLowerCase()}`}>
                    {localSelectedSchedule.status}
                  </span>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn-approve"
                  onClick={() => {
                    if (handleFileStatusChange) {
                      handleFileStatusChange(localSelectedSchedule.id, 'approved');
                    }
                    setLocalSelectedSchedule(null);
                  }}
                >
                  <Check size={18} />
                  Approve
                </button>
                <button 
                  className="btn-reject"
                  onClick={() => {
                    if (handleFileStatusChange) {
                      handleFileStatusChange(localSelectedSchedule.id, 'rejected');
                    }
                    setLocalSelectedSchedule(null);
                  }}
                >
                  <XCircle size={18} />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
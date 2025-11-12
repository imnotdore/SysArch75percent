import { FaSearch, FaFileAlt, FaCalendarAlt, FaClock, FaUser } from "react-icons/fa";

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
  const filteredResidents = residents.filter((r) =>
    (r.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (!selectedResident) {
    return (
      <>
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
                    <div className="detail-item">
                      <strong>Date Range:</strong>{" "}
                      {new Date(schedule.date_from).toLocaleDateString("en-PH")} - {" "}
                      {new Date(schedule.date_to).toLocaleDateString("en-PH")}
                    </div>
                    <div className="detail-item">
                      <strong>Requested:</strong>{" "}
                      {new Date(schedule.created_at).toLocaleDateString("en-PH", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
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
}
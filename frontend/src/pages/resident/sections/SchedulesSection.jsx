import { useState } from "react";
import DateFormatter from "../common/DateFormatter";
import { 
  FaCalendarAlt, 
  FaBoxOpen, 
  FaClock, 
  FaExchangeAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaEye,
  FaCalendarCheck,
  FaCalendarTimes
} from "react-icons/fa";
import "../styles/SchedulesSection.css";

export default function SchedulesSection({ 
  schedules, 
  loading, 
  error 
}) {
  const [expandedSchedule, setExpandedSchedule] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [previewSchedule, setPreviewSchedule] = useState(null);

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return <FaCheckCircle className="status-icon approved" />;
      case 'pending':
      case 'processing':
        return <FaHourglassHalf className="status-icon pending" />;
      case 'cancelled':
      case 'rejected':
        return <FaTimesCircle className="status-icon cancelled" />;
      default:
        return <FaHourglassHalf className="status-icon" />;
    }
  };

  // Get status text color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return '#10b981';
      case 'pending':
      case 'processing':
        return '#f59e0b';
      case 'cancelled':
      case 'rejected':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  // Format time display
  const formatTimeDisplay = (timeFrom, timeTo) => {
    if (!timeFrom || !timeTo) return "N/A";
    return `${timeFrom} - ${timeTo}`;
  };

  // Get item icon based on type
  const getItemIcon = (itemName) => {
    const item = itemName?.toLowerCase() || '';
    
    if (item.includes('laptop') || item.includes('computer')) {
      return <FaBoxOpen className="item-icon laptop" />;
    } else if (item.includes('projector') || item.includes('screen')) {
      return <FaBoxOpen className="item-icon projector" />;
    } else if (item.includes('camera') || item.includes('photo')) {
      return <FaBoxOpen className="item-icon camera" />;
    } else if (item.includes('sound') || item.includes('speaker')) {
      return <FaBoxOpen className="item-icon sound" />;
    } else {
      return <FaBoxOpen className="item-icon default" />;
    }
  };

  // Truncate text
  const truncateText = (text, maxLength = 30) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Handle schedule preview
  const handlePreview = (schedule) => {
    setPreviewSchedule(schedule);
  };

  // Preview Modal Component
  const PreviewModal = ({ schedule, onClose }) => {
    if (!schedule) return null;

    const formatFullDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-PH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const getStatusBadge = () => {
      const status = schedule.status?.toLowerCase();
      const color = getStatusColor(status);
      
      return (
        <span 
          className="status-badge"
          style={{ 
            backgroundColor: `${color}15`,
            color: color,
            borderColor: color
          }}
        >
          {getStatusIcon(schedule.status)}
          {schedule.status || 'Pending'}
        </span>
      );
    };

    return (
      <div className="preview-modal-overlay" onClick={onClose}>
        <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="preview-modal-header">
            <div className="preview-schedule-icon">
              <FaCalendarCheck />
            </div>
            <div className="preview-schedule-info">
              <h3>Borrowing Schedule Details</h3>
              <div className="preview-schedule-meta">
                <span>ID: #{schedule.id || schedule._id || 'N/A'}</span>
                <span>Item: {schedule.item}</span>
              </div>
            </div>
            <button className="preview-close-btn" onClick={onClose}>×</button>
          </div>
          
          <div className="preview-modal-body">
            <div className="preview-section">
              <h4><FaBoxOpen /> Item Information</h4>
              <div className="preview-details-grid">
                <div className="preview-detail">
                  <span className="detail-label">Item:</span>
                  <span className="detail-value">{schedule.item || 'N/A'}</span>
                </div>
                <div className="preview-detail">
                  <span className="detail-label">Quantity:</span>
                  <span className="detail-value quantity-badge">{schedule.quantity || 1}</span>
                </div>
                <div className="preview-detail">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">
                    {getStatusBadge()}
                  </span>
                </div>
              </div>
            </div>

            <div className="preview-section">
              <h4><FaCalendarAlt /> Schedule Details</h4>
              <div className="preview-details-grid">
                <div className="preview-detail">
                  <span className="detail-label">Borrow Date:</span>
                  <span className="detail-value">
                    <FaCalendarAlt /> {formatFullDate(schedule.date_from)}
                  </span>
                </div>
                <div className="preview-detail">
                  <span className="detail-label">Return Date:</span>
                  <span className="detail-value">
                    <FaCalendarTimes /> {formatFullDate(schedule.date_to)}
                  </span>
                </div>
                <div className="preview-detail">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">
                    {(() => {
                      if (!schedule.date_from || !schedule.date_to) return 'N/A';
                      const start = new Date(schedule.date_from);
                      const end = new Date(schedule.date_to);
                      const diffTime = Math.abs(end - start);
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
                    })()}
                  </span>
                </div>
                <div className="preview-detail">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">
                    <FaClock /> {formatTimeDisplay(schedule.time_from, schedule.time_to)}
                  </span>
                </div>
              </div>
            </div>

            <div className="preview-section">
              <h4><FaExchangeAlt /> Purpose & Notes</h4>
              <div className="preview-purpose">
                <p>{schedule.reason || 'No reason provided'}</p>
                {schedule.notes && (
                  <div className="preview-notes">
                    <strong>Additional Notes:</strong>
                    <p>{schedule.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="preview-actions">
              <button className="preview-action-btn primary">
                <FaCalendarCheck /> View Full Calendar
              </button>
              {schedule.status?.toLowerCase() === 'pending' && (
                <button className="preview-action-btn danger">
                  <FaCalendarTimes /> Cancel Request
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="schedules-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading schedules...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="schedules-section">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Schedules</h3>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="schedules-section">
        <div className="section-header">
          <h2 className="section-title">
            <FaCalendarAlt className="section-icon" />
            Borrowing Schedules
            <span className="count-badge">{schedules.length}</span>
          </h2>
          <p className="section-subtitle">
            Click schedule items to view details
          </p>
        </div>

        {schedules.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaCalendarAlt />
            </div>
            <h3>No Borrowing Schedules</h3>
            <p>You don't have any borrowing schedules yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="schedules-table">
              <thead>
                <tr className="table-header">
                  <th className="table-th">Item</th>
                  <th className="table-th">Schedule</th>
                  <th className="table-th">Duration</th>
                  <th className="table-th">Quantity</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => {
                  const duration = schedule.date_from && schedule.date_to 
                    ? (() => {
                        const start = new Date(schedule.date_from);
                        const end = new Date(schedule.date_to);
                        const diffTime = Math.abs(end - start);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
                      })()
                    : 'N/A';

                  return (
                    <tr 
                      key={schedule.id || schedule._id} 
                      className={`table-row ${hoveredRow === schedule.id ? 'hovered' : ''}`}
                      onMouseEnter={() => setHoveredRow(schedule.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="table-td">
                        <button 
                          className="item-preview-btn"
                          onClick={() => handlePreview(schedule)}
                          title="Click to preview schedule details"
                        >
                          <div className="item-icon-wrapper">
                            {getItemIcon(schedule.item)}
                          </div>
                          <div className="item-info-mini">
                            <div className="item-name-mini">
                              {truncateText(schedule.item, 20)}
                            </div>
                            <div className="item-purpose-mini">
                              {truncateText(schedule.reason, 25)}
                            </div>
                          </div>
                        </button>
                      </td>
                      <td className="table-td">
                        <div className="schedule-dates">
                          <div className="date-from">
                            <FaCalendarAlt className="date-icon" />
                            <DateFormatter date={schedule.date_from} />
                          </div>
                          <div className="date-to">
                            <FaCalendarAlt className="date-icon" />
                            <DateFormatter date={schedule.date_to} />
                          </div>
                          <div className="time-slot">
                            <FaClock className="time-icon" />
                            {formatTimeDisplay(schedule.time_from, schedule.time_to)}
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <span className="duration-badge">{duration}</span>
                      </td>
                      <td className="table-td">
                        <span className="quantity-badge">{schedule.quantity || 1}</span>
                      </td>
                      <td className="table-td">
                        <div className="status-display">
                          {getStatusIcon(schedule.status)}
                          <span 
                            className="status-text"
                            style={{ color: getStatusColor(schedule.status) }}
                          >
                            {schedule.status || 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="action-buttons">
                          <button
                            className="preview-btn"
                            onClick={() => handlePreview(schedule)}
                            title="Preview schedule details"
                          >
                            <FaEye />
                          </button>
                          
                          {schedule.status?.toLowerCase() === 'pending' && (
                            <button
                              className="cancel-btn"
                              onClick={() => {
                                // Add cancel schedule logic here
                                console.log('Cancel schedule:', schedule);
                              }}
                              title="Cancel this schedule"
                            >
                              <FaTimesCircle />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Preview Modal */}
      <PreviewModal 
        schedule={previewSchedule} 
        onClose={() => setPreviewSchedule(null)} 
      />
    </>
  );
}
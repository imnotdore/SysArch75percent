import { Package, FileText, Calendar, CheckCircle } from "lucide-react";

export default function AcceptedTab({
  acceptedFiles,
  acceptedSchedules,
  setSelectedAccepted
}) {
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <section className="accepted-list preview-only">
      <div className="accepted-header">
        <h2>Accepted Requests</h2>
        <p className="subtitle">Preview of approved requests</p>
      </div>

      {/* Files Section - READ ONLY */}
      <div className="files-section">
        <div className="section-header">
          <h3>
            <FileText className="section-icon" />
            Printed Files
          </h3>
          <span className="section-count">{acceptedFiles.length}</span>
        </div>
        
        {acceptedFiles.length === 0 ? (
          <div className="empty-state">
            <p>No accepted files.</p>
          </div>
        ) : (
          <div className="files-grid">
            {acceptedFiles.map((file) => (
              <div
                key={`accepted-file-${file.id}`}
                className="file-card preview-card"
                onClick={() => setSelectedAccepted({ ...file, type: "File" })}
              >
                <div className="file-icon">
                  <FileText />
                </div>
                <div className="file-info">
                  <h4 className="file-name" title={file.filename}>
                    {file.filename}
                  </h4>
                  <div className="file-details">
                    <span className="detail-item">
                      <strong>Resident:</strong> {file.resident_username || `Resident#${file.resident_id}`}
                    </span>
                    <span className="detail-item">
                      <strong>Pages:</strong> {file.page_count}
                    </span>
                    <span className="detail-item">
                      <strong>Approved By:</strong> {file.staff_username}
                    </span>
                  </div>
                  <div className="file-meta">
                    <span className="date-approved">
                      {formatDateTime(file.approved_at)}
                    </span>
                  </div>
                </div>
                <div className="status-badge status-approved">
                  <CheckCircle size={14} /> Approved
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedules Section - READ ONLY */}
      <div className="schedules-section">
        <div className="section-header">
          <h3>
            <Calendar className="section-icon" />
            Borrowed Items
          </h3>
          <span className="section-count">{acceptedSchedules.length}</span>
        </div>
        
        {acceptedSchedules.length === 0 ? (
          <div className="empty-state">
            <p>No accepted schedules.</p>
          </div>
        ) : (
          <div className="schedules-grid">
            {acceptedSchedules.map((schedule) => {
              const status = (schedule.status || "Approved").toLowerCase();
              
              return (
                <div
                  key={`accepted-schedule-${schedule.id}`}
                  className="schedule-card preview-card"
                  onClick={() => setSelectedAccepted({ ...schedule, type: "Schedule" })}
                >
                  <div className="schedule-icon">
                    <Package />
                  </div>
                  <div className="schedule-info">
                    <h4 className="item-name" title={schedule.item}>
                      {schedule.item}
                    </h4>
                    <div className="schedule-details">
                      <span className="detail-item">
                        <strong>Resident:</strong> {schedule.resident_username || `Resident#${schedule.user_id}`}
                      </span>
                      <span className="detail-item">
                        <strong>Quantity:</strong> {schedule.quantity}
                      </span>
                      <span className="detail-item">
                        <strong>Approved By:</strong> {schedule.staff_username}
                      </span>
                      <span className="detail-item">
                        <strong>Period:</strong> {new Date(schedule.date_from).toLocaleDateString()} to {new Date(schedule.date_to).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="schedule-meta">
                      <span className="date-approved">
                        {formatDateTime(schedule.approved_at)}
                      </span>
                    </div>
                  </div>
                  <div className={`status-badge status-${status.replace(' ', '-')}`}>
                    {status}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
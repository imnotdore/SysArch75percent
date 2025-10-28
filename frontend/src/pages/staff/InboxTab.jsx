import { useState } from "react";
import { FaFileAlt, FaCalendarAlt } from "react-icons/fa";

export default function InboxTab({
  residents,
  fetchResidentRequests,
  selectedResident,
  setSelectedResident,
  selectedResidentRequests,
  setSelectedResidentRequests,
  staffId,
  axiosAuth
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter residents based on search
  const filteredResidents = residents.filter((r) =>
    (r.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update inbox list when no pending remains
  const updateInboxIfNoPending = (residentId, updatedFiles, updatedSchedules) => {
    const hasPending = updatedFiles.length > 0 || updatedSchedules.length > 0;
    if (!hasPending) {
      setSelectedResident(null);
      setSelectedResidentRequests({ files: [], schedules: [] });
    } else {
      setSelectedResidentRequests({ files: updatedFiles, schedules: updatedSchedules });
    }
  };

  // File status handler
  const handleFileStatusChange = async (fileId, status) => {
    if (!staffId || !selectedResident) return;
    try {
      const payload = { status };
      if (status.toLowerCase() === "approved") payload.approved_by = staffId;

      await axiosAuth.put(`/api/staff/files/${fileId}`, payload);

      const updatedFiles = selectedResidentRequests.files.filter((f) => f.id !== fileId);
      const updatedSchedules = selectedResidentRequests.schedules;
      updateInboxIfNoPending(selectedResident.id, updatedFiles, updatedSchedules);
      setSelectedResidentRequests(prev => ({ ...prev, files: updatedFiles, schedules: updatedSchedules }));
    } catch (err) {
      console.error("Error updating file status:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to update file status");
    }
  };

  // Schedule status handler
  const handleScheduleStatusChange = async (scheduleId, status) => {
    if (!staffId || !selectedResident) return;

    const payload = { status: status.toLowerCase(), approved_by: staffId };

    try {
      await axiosAuth.put(`/api/staff/schedules/${scheduleId}/status`, payload);

      const updatedSchedules = selectedResidentRequests.schedules.filter((s) => s.id !== scheduleId);
      const updatedFiles = selectedResidentRequests.files;
      updateInboxIfNoPending(selectedResident.id, updatedFiles, updatedSchedules);
      setSelectedResidentRequests(prev => ({ ...prev, files: updatedFiles, schedules: updatedSchedules }));
    } catch (err) {
      console.error("Error updating schedule status:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to update schedule status");
    }
  };

  return (
    <div className="inbox-tab">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search resident..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {!selectedResident ? (
        <section className="resident-list">
          <h2>Residents with Pending Requests</h2>
          {filteredResidents
            .filter((r) => r.pending_count > 0)
            .map((r) => (
              <div
                key={r.id}
                className="resident-item"
                onClick={() => {
                  setSelectedResident(r);
                  fetchResidentRequests(r.id);
                }}
              >
                <span>{r.username || "Unnamed Resident"}</span>
                <span className="pending-count">{r.pending_count}</span>
              </div>
            ))}
        </section>
      ) : (
        <section className="resident-requests">
          <button
            className="back-btn"
            onClick={() => {
              setSelectedResident(null);
              setSelectedResidentRequests({ files: [], schedules: [] });
            }}
          >
            ← Back
          </button>

          <h2>{selectedResident.username}'s Pending Requests</h2>

          {/* FILE REQUESTS */}
          {selectedResidentRequests.files.length > 0 && (
            <div className="resident-files">
              <h3>File Requests</h3>
              {selectedResidentRequests.files.map((f) => (
                <div key={f.id} className="file-card">
                  <FaFileAlt size={28} color="#e37400" />
                  <div className="file-info">
                    <h4>{f.filename}</h4>
                    <p>Pages: {f.page_count}</p>
                    <p>Date Needed: {new Date(f.date_needed).toLocaleDateString("en-PH")}</p>
                  </div>
                  <div className={`file-status ${f.status.toLowerCase()}`}>{f.status}</div>
                  <button className="btn-green" onClick={() => handleFileStatusChange(f.id, "approved")}>Accept</button>
                  <button className="btn-red" onClick={() => handleFileStatusChange(f.id, "rejected")}>Reject</button>
                </div>
              ))}
            </div>
          )}

          {/* SCHEDULE REQUESTS */}
          {selectedResidentRequests.schedules.length > 0 && (
            <div className="resident-schedules">
              <h3>Schedule Requests</h3>
              {selectedResidentRequests.schedules.map((s) => (
                <div key={s.id} className="schedule-card">
                  <FaCalendarAlt size={28} color="#1a73e8" />
                  <div className="schedule-info">
                    <h4>{s.item}</h4>
                    <p>Quantity: {s.quantity}</p>
                    <p>
                      Date: {new Date(s.date_from).toLocaleString()} →{" "}
                      {new Date(s.date_to).toLocaleString()}
                    </p>
                  </div>
                  <div className={`schedule-status ${s.status.toLowerCase()}`}>{s.status}</div>
                  <button className="btn-green" onClick={() => handleScheduleStatusChange(s.id, "Approved")}>Approve</button>
                  <button className="btn-red" onClick={() => handleScheduleStatusChange(s.id, "Rejected")}>Reject</button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

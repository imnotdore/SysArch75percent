import { FaSearch, FaFileAlt, FaCalendarAlt } from "react-icons/fa";

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

  if (!selectedResident) {
    return (
      <>
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Search resident..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <section className="resident-list">
          <h2>Residents with Requests</h2>
          {filteredResidents.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', fontStyle: 'italic', padding: '40px 20px' }}>
              {searchTerm ? 'No residents found matching your search.' : 'No residents with pending requests.'}
            </p>
          ) : (
            filteredResidents.map((r) => (
              <div
                key={`resident-${r.id}`}
                className="resident-item"
                onClick={() => {
                  setSelectedResident(r);
                  fetchResidentRequests(r.id);
                }}
              >
                <span>{r.username || "Unnamed Resident"}</span>
                <span className="pending-count">{r.pending_count}</span>
              </div>
            ))
          )}
        </section>
      </>
    );
  }

  return (
    <section className="resident-requests">
      <button
        className="back-btn"
        onClick={() => {
          setSelectedResident(null);
        }}
      >
        ← Back to Residents
      </button>

      <h2>{selectedResident.username}'s Requests</h2>

      {/* FILES */}
      {selectedResidentRequests.files.length > 0 && (
        <div className="resident-files">
          <h3>File Requests</h3>
          {selectedResidentRequests.files.map((f) => (
            <div 
              key={f.id} 
              className="file-card"
              data-status={f.status.toLowerCase()}
              onClick={() => f.status.toLowerCase() !== "claimed" && setSelectedFile(f)}
            >
              <div className="file-icon">
                <FaFileAlt size={28} color="#e37400" />
              </div>
              <div className="file-info">
                <h4 className="file-title">{f.filename}</h4>
                <p>
                  <strong>Pages:</strong> {f.page_count}
                </p>
                <p>
                  <strong>Date Needed:</strong>{" "}
                  {new Date(f.date_needed).toLocaleDateString("en-PH")}
                </p>
                <p>
                  <strong>Uploaded:</strong>{" "}
                  {new Date(f.created_at).toLocaleString("en-PH")}
                </p>
              </div>
              <div className={`file-status ${f.status.toLowerCase()}`}>{f.status}</div>
            </div>
          ))}
        </div>
      )}

      {/* SCHEDULES */}
      {selectedResidentRequests.schedules.length > 0 && (
        <div className="resident-schedules">
          <h3>Schedule Requests</h3>
          {selectedResidentRequests.schedules.map((s) => (
            <div
              key={s.id}
              className="schedule-card"
              data-status={s.status.toLowerCase()}
              onClick={() => s.status.toLowerCase() !== "claimed" && setSelectedSchedule(s)}
            >
              <div className="schedule-icon">
                <FaCalendarAlt size={28} color="#1a73e8" />
              </div>
              <div className="schedule-info">
                <h4 className="schedule-title">{s.item}</h4>
                <p>
                  <strong>Quantity:</strong> {s.quantity}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(s.date_from).toLocaleString("en-PH")} →{" "}
                  {new Date(s.date_to).toLocaleString("en-PH")}
                </p>
              </div>
              <div className={`schedule-status ${s.status.toLowerCase()}`}>
                {s.status}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {selectedResidentRequests.files.length === 0 && selectedResidentRequests.schedules.length === 0 && (
        <div style={{ textAlign: 'center', color: '#6b7280', fontStyle: 'italic', padding: '60px 20px' }}>
          No pending requests found for this resident.
        </div>
      )}
    </section>
  );
}
export default function ScheduleModal({
  selectedSchedule,
  setSelectedSchedule,
  handleScheduleStatusChange,
  modalLoading,
  setModalLoading
}) {
  return (
    <div className="modal-overlay" onClick={() => setSelectedSchedule(null)}>
      <div className="modal schedule-modal" onClick={(e) => e.stopPropagation()}>
        <div className="schedule-modal-header">
          <div className="date-box">
            <span>
              {new Date(selectedSchedule.date_from).toLocaleDateString("en-PH", {
                weekday: "short",
              })}
            </span>
            <h3>
              {new Date(selectedSchedule.date_from).toLocaleDateString("en-PH", {
                day: "numeric",
                month: "short",
              })}
            </h3>
          </div>
          <div className="details-box">
            <h2>{selectedSchedule.item}</h2>
            <p>
              <strong>Quantity:</strong> {selectedSchedule.quantity}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedSchedule.date_from).toLocaleString("en-PH")} →{" "}
              {new Date(selectedSchedule.date_to).toLocaleString("en-PH")}
            </p>
            <p>
              <strong>Status:</strong>
              <span className={`status-badge ${selectedSchedule.status.toLowerCase()}`}>
                {selectedSchedule.status}
              </span>
            </p>
            
            {/* DAGDAG: Sino ang nag-set ng schedule */}
            <p>
              <strong>Requested by:</strong>{" "}
              {selectedSchedule.resident_username || 
               selectedSchedule.username || 
               selectedSchedule.resident_name || 
               selectedSchedule.name || 
               `Resident #${selectedSchedule.user_id}` || 
               "N/A"}
            </p>
            
            {/* DAGDAG: Sino ang nag-approve (kung approved na) */}
            {selectedSchedule.status.toLowerCase() === "approved" && selectedSchedule.approved_by && (
              <p>
                <strong>Approved by:</strong>{" "}
                {selectedSchedule.staff_username || `Staff #${selectedSchedule.approved_by}`}
                {selectedSchedule.approved_at && (
                  <span> on {new Date(selectedSchedule.approved_at).toLocaleDateString("en-PH")}</span>
                )}
              </p>
            )}
            
            {/* DAGDAG: Sino ang nag-reject (kung rejected na) */}
            {selectedSchedule.status.toLowerCase() === "rejected" && selectedSchedule.approved_by && (
              <p>
                <strong>Rejected by:</strong>{" "}
                {selectedSchedule.staff_username || `Staff #${selectedSchedule.approved_by}`}
                {selectedSchedule.approved_at && (
                  <span> on {new Date(selectedSchedule.approved_at).toLocaleDateString("en-PH")}</span>
                )}
              </p>
            )}
          </div>
        </div>
        <div className="modal-buttons">
          <button
            className="btn-green"
            disabled={modalLoading}
            onClick={async () => {
              setModalLoading(true);
              await handleScheduleStatusChange(selectedSchedule.id, "Approved");
              setModalLoading(false);
              setSelectedSchedule(null);
            }}
          >
            {modalLoading ? "Processing..." : "Approve"}
          </button>
          <button
            className="btn-red"
            disabled={modalLoading}
            onClick={async () => {
              setModalLoading(true);
              await handleScheduleStatusChange(selectedSchedule.id, "Rejected");
              setModalLoading(false);
              setSelectedSchedule(null);
            }}
          >
            {modalLoading ? "Processing..." : "Reject"}
          </button>
          <button className="btn-gray" onClick={() => setSelectedSchedule(null)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
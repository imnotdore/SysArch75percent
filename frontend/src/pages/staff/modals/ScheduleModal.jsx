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
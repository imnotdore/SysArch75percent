// AcceptedModal.jsx - SIMPLIFIED VERSION
import axios from "axios";

export default function AcceptedModal({
  selectedAccepted,
  setSelectedAccepted,
  fetchPrintedFiles
}) {
  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  
  const axiosAuth = axios.create({
    baseURL: baseUrl,
    headers: { Authorization: `Bearer ${token}` },
  });

  const handlePrintAndMark = async () => {
    try {
      await axiosAuth.post(
        `/api/staff/print/${selectedAccepted.type.toLowerCase()}/${selectedAccepted.id}`
      );

      // Refresh the data
      fetchPrintedFiles();
      
      setSelectedAccepted(null);
      alert(`${selectedAccepted.type} marked as printed!`);
    } catch (err) {
      console.error(err);
      alert("Failed to mark as printed");
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setSelectedAccepted(null)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{selectedAccepted.item || selectedAccepted.filename}</h2>

        {selectedAccepted.type === "File" ? (
          <iframe
            src={`${baseUrl}/uploads/${selectedAccepted.filename}`}
            width="100%"
            height="400px"
            title={selectedAccepted.filename}
          />
        ) : (
          <div>
            <p>
              <strong>From:</strong> {selectedAccepted.date_from}{" "}
              {selectedAccepted.time_from || ""}
            </p>
            <p>
              <strong>To:</strong> {selectedAccepted.date_to} {selectedAccepted.time_to || ""}
            </p>
            <p>
              <strong>Item:</strong> {selectedAccepted.item}
            </p>
            <p>
              <strong>Quantity:</strong> {selectedAccepted.quantity}
            </p>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-yellow" onClick={handlePrintAndMark}>
            Print & Mark
          </button>
          <button className="btn-gray" onClick={() => setSelectedAccepted(null)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
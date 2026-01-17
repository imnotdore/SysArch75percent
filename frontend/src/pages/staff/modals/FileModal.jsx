export default function FileModal({
  selectedFile,
  setSelectedFile,
  handleFileStatusChange,
  modalLoading,
  setModalLoading
}) {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  return (
    <div className="modal-overlay" onClick={() => setSelectedFile(null)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{selectedFile.filename}</h2>
        
        {/* DAGDAG: Impormasyon tungkol sa file */}
        <div className="file-info" style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
          <p><strong>Uploaded by:</strong> {selectedFile.resident_name || "N/A"}</p>
          <p><strong>Uploaded on:</strong> {new Date(selectedFile.created_at).toLocaleDateString("en-PH")}</p>
          
          {/* DAGDAG: Sino ang nag-approve (kung approved na) */}
          {selectedFile.status.toLowerCase() === "approved" && selectedFile.approved_by && (
            <p>
              <strong>Approved by:</strong>{" "}
              {selectedFile.staff_username || `Staff #${selectedFile.approved_by}`}
              {selectedFile.approved_at && (
                <span> on {new Date(selectedFile.approved_at).toLocaleDateString("en-PH")}</span>
              )}
            </p>
          )}
          
          {/* DAGDAG: Sino ang nag-reject (kung rejected na) */}
          {selectedFile.status.toLowerCase() === "rejected" && selectedFile.approved_by && (
            <p>
              <strong>Rejected by:</strong>{" "}
              {selectedFile.staff_username || `Staff #${selectedFile.approved_by}`}
              {selectedFile.approved_at && (
                <span> on {new Date(selectedFile.approved_at).toLocaleDateString("en-PH")}</span>
              )}
            </p>
          )}
        </div>
        
        <iframe
          src={`http://localhost:3000/uploads/files/${selectedFile.filename}`}
          title={selectedFile.filename}
          width="100%"
          height="400px"
        ></iframe>
        <div className="modal-buttons">
          <button
            className="btn-green"
            disabled={modalLoading}
            onClick={async () => {
              setModalLoading(true);
              await handleFileStatusChange(selectedFile.id, "approved");
              setModalLoading(false);
              setSelectedFile(null);
            }}
          >
            {modalLoading ? "Processing..." : "Accept"}
          </button>
          <button
            className="btn-red"
            disabled={modalLoading}
            onClick={async () => {
              setModalLoading(true);
              await handleFileStatusChange(selectedFile.id, "rejected");
              setModalLoading(false);
              setSelectedFile(null);
            }}
          >
            {modalLoading ? "Processing..." : "Reject"}
          </button>
          <button className="btn-gray" onClick={() => setSelectedFile(null)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
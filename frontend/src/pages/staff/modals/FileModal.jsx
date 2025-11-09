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
        <iframe
          src={`${baseUrl}/uploads/${selectedFile.filename}`}
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
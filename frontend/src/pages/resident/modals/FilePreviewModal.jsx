import { FaTimes, FaFileAlt } from "react-icons/fa";

export default function FilePreviewModal({ file, onClose }) {
  if (!file) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>

        <div style={styles.fileHeader}>
          <FaFileAlt size={40} />
          <div style={styles.fileInfo}>
            <div style={styles.fileName}>{file.name}</div>
            <div style={styles.fileType}>Type: {file.type.toUpperCase()}</div>
          </div>
        </div>

        <div style={styles.previewPlaceholder}>
          <p>File preview would be displayed here</p>
          <p style={styles.comingSoon}>Preview feature coming soon!</p>
        </div>

        <div style={styles.modalActions}>
          <button style={styles.downloadButton}>Download File</button>
          <button style={styles.closeActionButton} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    padding: "10px",
    boxSizing: "border-box",
  },
  modal: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    minWidth: "300px",
    maxWidth: "600px",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
  },
  fileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontWeight: "bold",
    fontSize: "18px",
  },
  fileType: {
    color: "#666",
    fontSize: "14px",
  },
  previewPlaceholder: {
    backgroundColor: "#f5f5f5",
    padding: "40px",
    textAlign: "center",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  comingSoon: {
    fontStyle: "italic",
    color: "#999",
    marginTop: "10px",
  },
  modalActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  downloadButton: {
    padding: "8px 16px",
    backgroundColor: "#28D69F",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  closeActionButton: {
    padding: "8px 16px",
    backgroundColor: "#ccc",
    color: "black",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
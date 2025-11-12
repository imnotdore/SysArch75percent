import { useState } from "react";
import StatusBadge from "../common/StatusBadge";
import DateFormatter from "../common/DateFormatter";

export default function FileUploadsSection({ uploadedFiles, loading, error, onCancelFile }) {
  const [expandedFile, setExpandedFile] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  if (loading) {
    return (
      <section style={styles.section}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading your files...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={styles.section}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <h3>Error Loading Files</h3>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>
          📁 Your Uploaded Files
          <span style={styles.countBadge}>{uploadedFiles.length}</span>
        </h2>
        <p style={styles.sectionSubtitle}>
          Manage and track your file upload requests
        </p>
      </div>

      {uploadedFiles.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📄</div>
          <h3>No Files Uploaded Yet</h3>
          <p>You haven't uploaded any files. Start by submitting a print request.</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>File Information</th>
                <th style={styles.th}>Date Needed</th>
                <th style={styles.th}>Pages</th>
                <th style={styles.th}>Uploaded</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.map((file) => (
                <tr 
                  key={file.id} 
                  style={{
                    ...styles.tableRow,
                    backgroundColor: hoveredRow === file.id ? '#F7FAFC' : 'transparent'
                  }}
                  onMouseEnter={() => setHoveredRow(file.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={styles.td}>
                    <div style={styles.fileInfo}>
                      <div style={styles.fileIcon}>📄</div>
                      <div style={styles.fileDetails}>
                        <strong style={styles.fileName}>
                          {file.original_name || file.filename}
                        </strong>
                        <div style={styles.fileMeta}>
                          Purpose: {file.purpose || "Not specified"}
                        </div>
                        {file.specialInstructions && (
                          <button
                            onClick={() => setExpandedFile(expandedFile === file.id ? null : file.id)}
                            style={styles.toggleInstructions}
                          >
                            {expandedFile === file.id ? "▲ Hide" : "▼ Show"} Instructions
                          </button>
                        )}
                      </div>
                    </div>
                    {expandedFile === file.id && file.specialInstructions && (
                      <div style={styles.instructionsBox}>
                        <strong>Special Instructions:</strong>
                        <p style={styles.instructionsText}>{file.specialInstructions}</p>
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <DateFormatter date={file.date_needed} />
                  </td>
                  <td style={styles.td}>
                    <span style={styles.pageCount}>{file.page_count}</span>
                  </td>
                  <td style={styles.td}>
                    <DateFormatter date={file.created_at} />
                  </td>
                  <td style={styles.td}>
                    <StatusBadge status={file.status} />
                  </td>
                  <td style={styles.td}>
                    {file.status?.toLowerCase() === "pending" && (
                      <button
                        onClick={() => onCancelFile(file)}
                        style={{
                          ...styles.cancelButton,
                          backgroundColor: hoveredRow === file.id ? '#DC2626' : '#FEF2F2',
                          color: hoveredRow === file.id ? 'white' : '#DC2626'
                        }}
                        title="Cancel this request"
                      >
                        🗑️ Cancel
                      </button>
                    )}
                    {file.status?.toLowerCase() === "approved" && (
                      <span style={styles.approvedText}>✅ Ready</span>
                    )}
                    {file.status?.toLowerCase() === "rejected" && (
                      <span style={styles.rejectedText}>❌ Denied</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const styles = {
  section: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    padding: "30px",
    marginBottom: "30px",
    border: "1px solid #f0f0f0",
  },
  sectionHeader: {
    marginBottom: "25px",
    borderBottom: "2px solid #f0f0f0",
    paddingBottom: "15px",
  },
  sectionTitle: {
    color: "#2D3748",
    fontSize: "1.5rem",
    fontWeight: "700",
    margin: "0",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  countBadge: {
    backgroundColor: "#1E90FF",
    color: "white",
    borderRadius: "20px",
    padding: "2px 10px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  sectionSubtitle: {
    color: "#666",
    margin: "5px 0 0 0",
    fontSize: "0.95rem",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "40px",
    color: "#666",
  },
  spinner: {
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #1E90FF",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    margin: "0 auto 15px",
  },
  errorContainer: {
    textAlign: "center",
    padding: "40px",
    color: "#DC2626",
  },
  errorIcon: {
    fontSize: "3rem",
    marginBottom: "15px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 40px",
    color: "#666",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "20px",
    opacity: 0.5,
  },
  tableContainer: {
    overflowX: "auto",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
  },
  tableHeader: {
    backgroundColor: "#F8FAFC",
    borderBottom: "2px solid #E2E8F0",
  },
  th: {
    padding: "15px 12px",
    textAlign: "left",
    fontWeight: "600",
    color: "#2D3748",
    fontSize: "0.9rem",
    borderBottom: "1px solid #E2E8F0",
  },
  tableRow: {
    borderBottom: "1px solid #f0f0f0",
    transition: "background-color 0.2s ease",
  },
  td: {
    padding: "15px 12px",
    verticalAlign: "top",
    borderBottom: "1px solid #f0f0f0",
  },
  fileInfo: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  fileIcon: {
    fontSize: "1.5rem",
    marginTop: "2px",
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    display: "block",
    color: "#2D3748",
    fontSize: "0.95rem",
    marginBottom: "4px",
    wordBreak: "break-word",
  },
  fileMeta: {
    fontSize: "0.8rem",
    color: "#666",
  },
  toggleInstructions: {
    background: "none",
    border: "none",
    color: "#1E90FF",
    fontSize: "0.75rem",
    cursor: "pointer",
    padding: "2px 0",
    marginTop: "4px",
    transition: "color 0.2s ease",
  },
  instructionsBox: {
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#F0F9FF",
    border: "1px solid #BAE6FD",
    borderRadius: "6px",
    fontSize: "0.8rem",
  },
  instructionsText: {
    margin: "5px 0 0 0",
    color: "#0369A1",
    lineHeight: "1.4",
  },
  pageCount: {
    backgroundColor: "#EFF6FF",
    color: "#1E40AF",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#FEF2F2",
    color: "#DC2626",
    border: "1px solid #FECACA",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  approvedText: {
    color: "#059669",
    fontWeight: "600",
    fontSize: "0.8rem",
  },
  rejectedText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: "0.8rem",
  },
};

// Add CSS animations
const addGlobalStyles = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
};

// Add styles once
addGlobalStyles();
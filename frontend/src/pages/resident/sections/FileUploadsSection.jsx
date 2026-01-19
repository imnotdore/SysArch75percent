import { useState, useEffect } from "react";
import DateFormatter from "../common/DateFormatter";
import { 
  FaFilePdf, 
  FaFileWord, 
  FaFileImage, 
  FaFileAlt,
  FaEye,
  FaTrash
} from "react-icons/fa";
import "../styles/FileUploadsSection.css";

export default function FileUploadsSection({ 
  uploadedFiles, 
  loading, 
  error, 
  onCancelFile,
  getStatusDisplayName,
  getStatusStyle
}) {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [limits, setLimits] = useState({ resident: 30, system: 100 });
  const [todayUsage, setTodayUsage] = useState({ resident: 0, system: 0 });
  const [limitsLoading, setLimitsLoading] = useState(true);

  // Get file icon based on file type
  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt className="file-type-icon" />;
    
    const ext = fileName.split('.').pop().toLowerCase();
    
    switch(ext) {
      case 'pdf':
        return <FaFilePdf className="file-type-icon pdf" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="file-type-icon word" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaFileImage className="file-type-icon image" />;
      default:
        return <FaFileAlt className="file-type-icon" />;
    }
  };

  // Truncate file name
  const truncateFileName = (name, maxLength = 30) => {
    if (!name) return "Unnamed File";
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  // Get file size in readable format
  const getFileSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Handle file preview
  const handlePreview = (file) => {
    if (file.file_url) {
      window.open(file.file_url, '_blank');
    } else {
      setPreviewFile(file);
    }
  };

  useEffect(() => {
    const fetchLimitsAndUsage = async () => {
      try {
        setLimitsLoading(true);
        const token = localStorage.getItem("token");
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const userId = localStorage.getItem("userId");
        
        if (!userId) {
          console.error("No user ID found");
          setLimitsLoading(false);
          return;
        }

        const usageResponse = await fetch(`${API_URL}/api/auth/today-usage/${userId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (usageResponse.ok) {
          const usageData = await usageResponse.json();
          if (usageData.success) {
            setTodayUsage({ 
              resident: usageData.data.userUsage || 0, 
              system: usageData.data.systemUsage || 0 
            });
            
            setLimits({ 
              resident: usageData.data.limits?.resident || 30, 
              system: usageData.data.limits?.global || 100 
            });
          }
        } else {
          setLimits({ resident: 30, system: 100 });
        }
      } catch (err) {
        console.error("Error fetching usage:", err);
        setLimits({ resident: 30, system: 100 });
      } finally {
        setLimitsLoading(false);
      }
    };

    fetchLimitsAndUsage();
    
    const interval = setInterval(fetchLimitsAndUsage, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshUsage = async () => {
    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const userId = localStorage.getItem("userId");
      
      if (!userId) return;

      const usageResponse = await fetch(`${API_URL}/api/auth/today-usage/${userId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        if (usageData.success) {
          setTodayUsage({ 
            resident: usageData.data.userUsage || 0, 
            system: usageData.data.systemUsage || 0 
          });
        }
      }
    } catch (err) {
      console.error("Error refreshing usage:", err);
    }
  };

  const handleCancelWithRefresh = async (file) => {
    await onCancelFile(file);
    setTimeout(refreshUsage, 1000);
  };

  const residentRemaining = Math.max(0, limits.resident - todayUsage.resident);
  const systemRemaining = Math.max(0, limits.system - todayUsage.system);

  const residentPercentage = limits.resident > 0 
    ? Math.min(100, (todayUsage.resident / limits.resident) * 100) 
    : 0;
  
  const systemPercentage = limits.system > 0 
    ? Math.min(100, (todayUsage.system / limits.system) * 100) 
    : 0;

  // Preview Modal Component
  const PreviewModal = ({ file, onClose }) => {
    if (!file) return null;

    return (
      <div className="preview-modal-overlay" onClick={onClose}>
        <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="preview-modal-header">
            <div className="preview-file-icon">
              {getFileIcon(file.original_name || file.filename)}
            </div>
            <div className="preview-file-info">
              <h3>{truncateFileName(file.original_name || file.filename, 40)}</h3>
              <div className="preview-file-meta">
                <span>Size: {getFileSize(file.file_size)}</span>
                <span>Pages: {file.page_count}</span>
                <span>Type: {file.file_type || "Unknown"}</span>
              </div>
            </div>
            <button className="preview-close-btn" onClick={onClose}>×</button>
          </div>
          
          <div className="preview-modal-body">
            <div className="preview-section">
              <h4>📝 File Details</h4>
              <div className="preview-details-grid">
                <div className="preview-detail">
                  <span className="detail-label">Purpose:</span>
                  <span className="detail-value">{file.purpose || "Not specified"}</span>
                </div>
                <div className="preview-detail">
                  <span className="detail-label">Date Needed:</span>
                  <span className="detail-value">
                    <DateFormatter date={file.date_needed} />
                  </span>
                </div>
                <div className="preview-detail">
                  <span className="detail-label">Uploaded:</span>
                  <span className="detail-value">
                    <DateFormatter date={file.created_at} />
                  </span>
                </div>
                <div className="preview-detail">
                  <span className="detail-label">Status:</span>
                  <span 
                    className="detail-value"
                    style={getStatusStyle(file.status)}
                  >
                    {getStatusDisplayName(file.status)}
                  </span>
                </div>
              </div>
            </div>

            {file.specialInstructions && (
              <div className="preview-section">
                <h4>📋 Special Instructions</h4>
                <div className="preview-instructions">
                  {file.specialInstructions}
                </div>
              </div>
            )}

            <div className="preview-actions">
              {file.file_url ? (
                <a 
                  href={file.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="preview-action-btn primary"
                >
                  <FaEye /> Open Original File
                </a>
              ) : (
                <button className="preview-action-btn disabled">
                  ⚠️ File not available for preview
                </button>
              )}
              
              {file.status?.toLowerCase() === "pending" && (
                <button
                  onClick={() => handleCancelWithRefresh(file)}
                  className="preview-action-btn danger"
                >
                  <FaTrash /> Cancel Request
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading || limitsLoading) {
    return (
      <section className="file-uploads-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your files...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="file-uploads-section">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Files</h3>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="file-uploads-section">
        

        {uploadedFiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No Files Uploaded</h3>
            <p>You haven't uploaded any files yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="files-table">
              <thead>
                <tr className="table-header">
                  <th className="table-th">File</th>
                  <th className="table-th">Date Needed</th>
                  <th className="table-th">Pages</th>
                  <th className="table-th">Uploaded</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploadedFiles.map((file) => (
                  <tr 
                    key={file.id} 
                    className={`table-row ${hoveredRow === file.id ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredRow(file.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="table-td">
                      <div className="file-info-compact">
                        <button 
                          className="file-preview-btn"
                          onClick={() => handlePreview(file)}
                          title="Click to preview file details"
                        >
                          <div className="file-icon-wrapper">
                            {getFileIcon(file.original_name || file.filename)}
                          </div>
                          <div className="file-info-mini">
                            <div className="file-name-mini">
                              {truncateFileName(file.original_name || file.filename, 25)}
                            </div>
                            <div className="file-size-mini">
                              {getFileSize(file.file_size)}
                            </div>
                          </div>
                        </button>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="date-cell">
                        <DateFormatter date={file.date_needed} />
                      </div>
                    </td>
                    <td className="table-td">
                      <span className="page-count">{file.page_count}</span>
                    </td>
                    <td className="table-td">
                      <div className="date-cell">
                        <DateFormatter date={file.created_at} />
                      </div>
                    </td>
                    <td className="table-td">
                      <span 
                        className="custom-status-badge"
                        style={getStatusStyle(file.status)}
                      >
                        {getStatusDisplayName(file.status)}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="action-buttons">
                        <button
                          className="preview-btn"
                          onClick={() => handlePreview(file)}
                          title="Preview file details"
                        >
                          <FaEye />
                        </button>
                        
                        {file.status?.toLowerCase() === "pending" && (
                          <button
                            onClick={() => handleCancelWithRefresh(file)}
                            className="cancel-btn"
                            title="Cancel this request"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <PreviewModal 
        file={previewFile} 
        onClose={() => setPreviewFile(null)} 
      />
    </>
  );
}
import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../../config";

const CancelRequestModal = ({ show, onClose, request, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  
  if (!show || !request) return null;

  const handleCancel = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Check if the endpoint exists in your backend
      // If not, you might need to implement this endpoint
      await axios.delete(
        `${API_URL}/api/files/${request.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onSuccess();
      onClose();
      alert("Request cancelled successfully!");
    } catch (err) {
      console.error("Cancel failed", err);
      if (err.response?.status === 404) {
        alert("Cancel endpoint not found. Please contact administrator.");
      } else {
        alert("Failed to cancel request: " + (err.response?.data?.error || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>Cancel Request</h3>
          <button 
            onClick={onClose}
            style={styles.closeButton}
          >
            ×
          </button>
        </div>
        
        <div style={styles.modalBody}>
          <div style={styles.requestInfo}>
            <div style={styles.infoRow}>
              <span style={styles.label}>Filename:</span>
              <span style={styles.value}>{request.original_name || request.filename}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Date Needed:</span>
              <span style={styles.value}>{formatDate(request.date_needed)}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Purpose:</span>
              <span style={styles.value}>{request.purpose}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Status:</span>
              <span style={{
                ...styles.status,
                color: request.status === 'pending' ? '#F59E0B' : 
                       request.status === 'approved' ? '#10B981' : '#EF4444'
              }}>
                {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
              </span>
            </div>
          </div>
          
          <div style={styles.warningBox}>
            <p style={styles.warningText}>
              ⚠️ Are you sure you want to cancel this request? This action cannot be undone.
            </p>
          </div>
        </div>
        
        <div style={styles.modalFooter}>
          <button 
            onClick={onClose}
            style={styles.cancelButton}
            disabled={loading}
          >
            Go Back
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            style={loading ? styles.disabledButton : styles.confirmButton}
          >
            {loading ? "⏳ Cancelling..." : "🗑️ Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Date formatting function
const formatDate = (dateStr) => {
  if (!dateStr) return "Not specified";
  const date = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

// Modern CSS-in-JS styles
const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    animation: 'fadeIn 0.3s ease',
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
    maxWidth: '500px',
    width: '100%',
    overflow: 'hidden',
    animation: 'slideUp 0.3s ease',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #E5E7EB',
    backgroundColor: '#F8FAFC',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1F2937',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#6B7280',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  },
  modalBody: {
    padding: '24px',
  },
  requestInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #F3F4F6',
  },
  label: {
    fontWeight: '500',
    color: '#374151',
    fontSize: '14px',
  },
  value: {
    fontWeight: '400',
    color: '#6B7280',
    fontSize: '14px',
    textAlign: 'right',
  },
  status: {
    fontWeight: '600',
    fontSize: '14px',
  },
  warningBox: {
    backgroundColor: '#FEF3F2',
    border: '1px solid #FECACA',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
  },
  warningText: {
    color: '#DC2626',
    fontSize: '14px',
    fontWeight: '500',
    margin: 0,
    lineHeight: '1.5',
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    padding: '20px 24px',
    borderTop: '1px solid #E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  cancelButton: {
    padding: '10px 20px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  confirmButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#DC2626',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  disabledButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#9CA3AF',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
};

// Add CSS animations
const addGlobalStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
};

// Add styles once
if (typeof document !== 'undefined') {
  addGlobalStyles();
}

// Add hover effects
Object.assign(styles.closeButton, {
  ':hover': {
    backgroundColor: '#F3F4F6',
    color: '#374151',
  }
});

Object.assign(styles.cancelButton, {
  ':hover': {
    backgroundColor: '#F3F4F6',
    borderColor: '#9CA3AF',
  }
});

Object.assign(styles.confirmButton, {
  ':hover': {
    backgroundColor: '#B91C1C',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
  }
});

export default CancelRequestModal;
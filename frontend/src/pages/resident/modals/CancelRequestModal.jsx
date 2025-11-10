import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../../config";

const CancelRequestModal = ({ show, onClose, request, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  
  if (!request) return null;

  const handleCancel = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/files/${request.id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Cancel failed", err);
      alert("Failed to cancel request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal fade ${show ? "show d-block" : ""}`} style={styles.modal} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3 shadow" style={styles.modalContent}>
          <div className="modal-header" style={styles.modalHeader}>
            <h5 className="modal-title">Cancel Request</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              style={styles.closeButton}
            ></button>
          </div>
          <div className="modal-body" style={styles.modalBody}>
            <p><strong>Filename:</strong> {request.original_name || request.filename}</p>
            <p><strong>Date Needed:</strong> {formatDate(request.date_needed)}</p>
            <p><strong>Purpose:</strong> {request.purpose}</p>
          </div>
          <div className="modal-footer" style={styles.modalFooter}>
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
              style={styles.secondaryButton}
            >
              Close
            </button>
            <button
              className="btn btn-danger"
              onClick={handleCancel}
              disabled={loading}
              style={styles.dangerButton}
            >
              {loading ? "Cancelling..." : "Cancel Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Date formatting function
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

// Styles
const styles = {
  modal: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1050,
  },
  modalContent: {
    border: 'none',
    boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
  },
  modalHeader: {
    borderBottom: '1px solid #dee2e6',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
  },
  modalBody: {
    padding: '1rem',
  },
  modalFooter: {
    borderTop: '1px solid #dee2e6',
    padding: '1rem',
  },
  closeButton: {
    border: 'none',
    background: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  },
};

export default CancelRequestModal;
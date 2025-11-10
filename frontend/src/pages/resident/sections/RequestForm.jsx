import { useState, useRef } from "react";
import axios from "axios";
import { API_URL } from "../../../config";

export default function RequestForm() {
  const [form, setForm] = useState({
    purpose: "",
    dateNeeded: "",
    copies: 1,
    specialInstructions: ""
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Only PDF, Word documents, JPEG, and PNG files are allowed");
        return;
      }
      
      setFile(selectedFile);
      setError(""); // Clear error when valid file selected
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!file) {
      setError("Please select a file");
      return;
    }
    
    if (!form.purpose) {
      setError("Please select a purpose");
      return;
    }
    
    if (!form.dateNeeded) {
      setError("Please select a date needed");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", form.purpose);
    formData.append("dateNeeded", form.dateNeeded);
    formData.append("copies", form.copies.toString());
    formData.append("specialInstructions", form.specialInstructions);
    formData.append("pageCount", form.copies.toString()); // Important: backend expects pageCount

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.post(`${API_URL}/api/files/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 second timeout
      });
      
      console.log("Upload response:", response.data);
      
      alert("File uploaded successfully!");
      
      // Reset form
      setForm({ 
        purpose: "", 
        dateNeeded: "", 
        copies: 1, 
        specialInstructions: "" 
      });
      setFile(null);
      setError("");
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      
      if (error.response) {
        // Server responded with error status
        setError(error.response.data.error || `Upload failed: ${error.response.status}`);
      } else if (error.request) {
        // No response received
        setError("Network error: Please check your connection");
      } else {
        // Other errors
        setError("Upload failed: " + error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <section style={styles.formSection}>
      <h2 style={styles.title}>File Upload Request</h2>
      
      {error && (
        <div style={styles.errorAlert}>
          ⚠️ {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* File Upload */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Select File *
            <span style={styles.fileInfo}>(PDF, Word, JPEG, PNG - Max 10MB)</span>
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            style={styles.fileInput}
            required
          />
          {file && (
            <p style={styles.fileInfo}>
              ✅ Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Purpose */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Purpose *</label>
          <select
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            style={styles.select}
            required
          >
            <option value="">-- Select Purpose --</option>
            <option value="Application">Application</option>
            <option value="Requirement">Requirement</option>
            <option value="Personal Use">Personal Use</option>
            <option value="Business">Business</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Date Needed */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Date Needed *</label>
          <input
            type="date"
            value={form.dateNeeded}
            onChange={(e) => setForm({ ...form, dateNeeded: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            style={styles.input}
            required
          />
        </div>

        {/* Copies */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Number of Copies</label>
          <input
            type="number"
            min="1"
            max="10"
            value={form.copies}
            onChange={(e) => setForm({ ...form, copies: parseInt(e.target.value) || 1 })}
            style={styles.input}
          />
        </div>

        {/* Special Instructions */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Special Instructions</label>
          <textarea
            value={form.specialInstructions}
            onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })}
            style={styles.textarea}
            placeholder="Any special instructions for processing..."
            rows="3"
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          style={{
            ...styles.submitButton,
            backgroundColor: uploading ? '#ccc' : '#28D69F',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
          disabled={uploading}
        >
          {uploading ? "📤 Uploading..." : "✅ Submit Request"}
        </button>
      </form>
    </section>
  );
}

const styles = {
  formSection: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  title: {
    color: "#1E90FF",
    textAlign: "center",
    marginBottom: "30px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px",
  },
  fileInfo: {
    fontSize: "12px",
    color: "#666",
    fontWeight: "normal",
    marginLeft: "5px",
  },
  fileInput: {
    padding: "10px",
    border: "2px dashed #ccc",
    borderRadius: "6px",
    backgroundColor: "#f9f9f9",
    cursor: "pointer",
  },
  select: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px",
    backgroundColor: "white",
  },
  input: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px",
  },
  textarea: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px",
    resize: "vertical",
    fontFamily: "inherit",
    minHeight: "80px",
  },
  submitButton: {
    padding: "15px",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  errorAlert: {
    backgroundColor: "#ffe6e6",
    color: "#d63031",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ff7675",
    marginBottom: "20px",
    fontSize: "14px",
  },
};
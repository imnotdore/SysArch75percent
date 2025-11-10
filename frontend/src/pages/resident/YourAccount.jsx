import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { FileContext } from "../../context/Filecontext";
import { ScheduleContext } from "../../context/ScheduleContext";
import ResidentLayout from "./ResidentLayout";
import CancelRequestModal from "./modals/CancelRequestModal";
import StatusBadge from "./common/StatusBadge";
import DateFormatter from "./common/DateFormatter";
import SchedulesSection from "./sections/SchedulesSection";
import { API_URL } from "../../config";

export default function YourAccount() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { schedules, fetchSchedules } = useContext(ScheduleContext); // ADD fetchSchedules here
  const { fetchFiles: fetchContextFiles } = useContext(FileContext);
  const [showCancel, setShowCancel] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(true); // ADD loading state for schedules
  const [error, setError] = useState(null);
  const [schedulesError, setSchedulesError] = useState(null); // ADD error state for schedules

  // Fetch uploaded files
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUploadedFiles(res.data);
      if (fetchContextFiles) {
        fetchContextFiles();
      }
    } catch (err) {
      console.error("Failed to fetch files:", err);
      setError(err.response?.data?.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedules
  const fetchUserSchedules = async () => {
    try {
      setSchedulesLoading(true);
      if (fetchSchedules) {
        await fetchSchedules();
      } else {
        // Fallback: fetch schedules manually if context doesn't have fetchSchedules
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/schedules`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Schedules data:", response.data); // Debug log
      }
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
      setSchedulesError(err.response?.data?.message || "Failed to load schedules");
    } finally {
      setSchedulesLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchUserSchedules();
  }, []);

  // Debug: Check what's in schedules
  useEffect(() => {
    console.log("Schedules in YourAccount:", schedules);
    console.log("Schedules length:", schedules?.length);
  }, [schedules]);

  return (
    <ResidentLayout title="YOUR ACCOUNT">
      {/* Uploaded Files Section */}
      <section style={{ marginTop: 40 }}>
        <h2 style={{ color: "#1E90FF" }}>Your Uploaded Files</h2>
        
        {loading && <p>Loading files...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        
        {!loading && !error && uploadedFiles.length === 0 ? (
          <p>No uploaded files yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={{ backgroundColor: "#1E90FF", color: "black" }}>
                <th style={styles.tableCell}>Filename</th>
                <th style={styles.tableCell}>Date Needed</th>
                <th style={styles.tableCell}>Page Count</th>
                <th style={styles.tableCell}>Uploaded At</th>
                <th style={styles.tableCell}>Status</th>
                <th style={styles.tableCell}>Action</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.map((file) => (
                <tr key={file.id}>
                  <td style={styles.tableCell}>{file.original_name || file.filename}</td>
                  <td style={styles.tableCell}>
                    <DateFormatter date={file.date_needed} />
                  </td>
                  <td style={styles.tableCell}>{file.page_count}</td>
                  <td style={styles.tableCell}>
                    <DateFormatter date={file.created_at} />
                  </td>
                  <td style={styles.tableCell}>
                    <StatusBadge status={file.status} />
                  </td>
                  <td style={styles.tableCell}>
                    {file.status?.toLowerCase() === "pending" && (
                      <button
                        onClick={() => {
                          setSelectedFile(file);
                          setShowCancel(true);
                        }}
                        style={styles.cancelBtn}
                      >
                        Cancel Request
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Schedules Section - USING THE NEW COMPONENT */}
      <SchedulesSection />

      <CancelRequestModal
        show={showCancel}
        onClose={() => setShowCancel(false)}
        request={selectedFile}
        onSuccess={fetchFiles}
      />
    </ResidentLayout>
  );
}

const styles = {
  table: { 
    width: "100%", 
    borderCollapse: "collapse",
    marginTop: "10px"
  },
  tableCell: { 
    border: "1px solid #ccc", 
    padding: "8px", 
    textAlign: "center" 
  },
  cancelBtn: { 
    backgroundColor: "#ff4d4f", 
    color: "#fff", 
    border: "none", 
    padding: "5px 10px", 
    borderRadius: 5, 
    cursor: "pointer" 
  },
};
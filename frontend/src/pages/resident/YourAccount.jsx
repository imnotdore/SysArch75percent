import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { FileContext } from "../../context/Filecontext";
import { ScheduleContext } from "../../context/ScheduleContext";
import ResidentLayout from "./ResidentLayout";
import CancelRequestModal from "./modals/CancelRequestModal";
import FileUploadsSection from "./sections/FileUploadsSection";
import SchedulesSection from "./sections/SchedulesSection";
import { API_URL } from "../../config";

export default function YourAccount() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { schedules, fetchSchedules } = useContext(ScheduleContext);
  const { fetchFiles: fetchContextFiles } = useContext(FileContext);
  const [showCancel, setShowCancel] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schedulesError, setSchedulesError] = useState(null);
  const [hoveredStat, setHoveredStat] = useState(null);

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
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/schedules`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Schedules data:", response.data);
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

  return (
    <ResidentLayout title="">
      <div style={styles.container}>
        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>Your Account Dashboard</h1>
        </div>

        {/* Stats Overview */}
        <div style={styles.statsContainer}>
          <div 
            style={{
              ...styles.statCard,
              transform: hoveredStat === 'files' ? 'translateY(-5px)' : 'translateY(0)',
              boxShadow: hoveredStat === 'files' ? '0 8px 25px rgba(0,0,0,0.15)' : '0 4px 15px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={() => setHoveredStat('files')}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div style={styles.statIcon}>📄</div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{uploadedFiles.length}</h3>
              <p style={styles.statLabel}>Total Files</p>
            </div>
          </div>
          <div 
            style={{
              ...styles.statCard,
              transform: hoveredStat === 'schedules' ? 'translateY(-5px)' : 'translateY(0)',
              boxShadow: hoveredStat === 'schedules' ? '0 8px 25px rgba(0,0,0,0.15)' : '0 4px 15px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={() => setHoveredStat('schedules')}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div style={styles.statIcon}>📅</div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{schedules?.length || 0}</h3>
              <p style={styles.statLabel}>Schedules</p>
            </div>
          </div>
          <div 
            style={{
              ...styles.statCard,
              transform: hoveredStat === 'pending' ? 'translateY(-5px)' : 'translateY(0)',
              boxShadow: hoveredStat === 'pending' ? '0 8px 25px rgba(0,0,0,0.15)' : '0 4px 15px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={() => setHoveredStat('pending')}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div style={styles.statIcon}>⏳</div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>
                {uploadedFiles.filter(f => f.status === 'pending').length}
              </h3>
              <p style={styles.statLabel}>Pending</p>
            </div>
          </div>
          <div 
            style={{
              ...styles.statCard,
              transform: hoveredStat === 'approved' ? 'translateY(-5px)' : 'translateY(0)',
              boxShadow: hoveredStat === 'approved' ? '0 8px 25px rgba(0,0,0,0.15)' : '0 4px 15px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={() => setHoveredStat('approved')}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div style={styles.statIcon}>✅</div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>
                {uploadedFiles.filter(f => f.status === 'approved').length}
              </h3>
              <p style={styles.statLabel}>Approved</p>
            </div>
          </div>
        </div>

        {/* File Uploads Section */}
        <FileUploadsSection 
          uploadedFiles={uploadedFiles}
          loading={loading}
          error={error}
          onCancelFile={(file) => {
            setSelectedFile(file);
            setShowCancel(true);
          }}
        />

        {/* Schedules Section */}
        <SchedulesSection 
          schedules={schedules}
          loading={schedulesLoading}
          error={schedulesError}
        />

        <CancelRequestModal
          show={showCancel}
          onClose={() => setShowCancel(false)}
          request={selectedFile}
          onSuccess={fetchFiles}
        />
      </div>
    </ResidentLayout>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
  welcomeSection: {
    textAlign: "center",
    marginBottom: "40px",
    padding: "30px",
    borderRadius: "15px",
    color: "white",
    background: "linear-gradient(100deg, #A43249 10%, #F4Be2A 50%)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
  },
  welcomeTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    marginBottom: "10px",
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
  },
  welcomeSubtitle: {
    fontSize: "1.1rem",
    opacity: 0.9,
    fontWeight: "300",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    border: "1px solid #f0f0f0",
  },
  statIcon: {
    fontSize: "2.5rem",
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: "50%",
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1E90FF",
    margin: "0",
    lineHeight: "1",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#666",
    margin: "5px 0 0 0",
    fontWeight: "500",
  },
};
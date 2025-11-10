import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { FileContext } from "../../context/Filecontext";
import { ScheduleContext } from "../../context/ScheduleContext";
import ResidentLayout from "./ResidentLayout";
import CancelRequestModal from "./modals/CancelRequestModal";
import FileUploadsSection from "./sections/FileUploadsSection"; // ADD THIS
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
    <ResidentLayout title="YOUR ACCOUNT">
      {/* Use FileUploadsSection instead of manual table */}
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
    </ResidentLayout>
  );
}
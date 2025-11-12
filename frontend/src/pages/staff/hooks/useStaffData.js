import { useState, useEffect } from "react";
import axios from "axios";

export default function useStaffData(staffId, activeTab) {
  const [residents, setResidents] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);
  const [selectedResidentRequests, setSelectedResidentRequests] = useState({ files: [], schedules: [] });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedAccepted, setSelectedAccepted] = useState(null);
  const [selectedPendingAccount, setSelectedPendingAccount] = useState(null);
  const [acceptedFiles, setAcceptedFiles] = useState([]);
  const [acceptedSchedules, setAcceptedSchedules] = useState([]);
  const [printedFiles, setPrintedFiles] = useState([]);
  const [returnedSchedules, setReturnedSchedules] = useState([]);
  const [releasedSchedules, setReleasedSchedules] = useState([]);
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  
  const axiosAuth = axios.create({
    baseURL: baseUrl,
    headers: { Authorization: `Bearer ${token}` },
  });

  // ==================== FETCH FUNCTIONS ====================

  // Fetch residents with pending requests
  const fetchResidents = async () => {
    if (!token) return;
    try {
      const res = await axiosAuth.get("/api/staff/residents/pending");
      setResidents(res.data);
    } catch (err) {
      console.error("Error fetching residents:", err.response?.data || err.message);
    }
  };

  // Fetch accepted requests
  const fetchAcceptedRequests = async () => {
    try {
      const [filesRes, schedulesRes] = await Promise.all([
        axiosAuth.get("/api/staff/accepted"),
        axiosAuth.get("/api/staff/accepted-schedules"),
      ]);

      setAcceptedFiles(
        Array.isArray(filesRes.data)
          ? filesRes.data.map((f) => ({
              ...f,
              id: f.request_id,
              approved_at: f.approved_at ? new Date(f.approved_at) : null,
              staff_username: f.staff_username || `Staff#${f.approved_by}`,
            }))
          : []
      );

      setAcceptedSchedules(
        Array.isArray(schedulesRes.data)
          ? schedulesRes.data.map((s, idx) => ({
              ...s,
              id: s.id ?? s.schedule_id ?? idx,
              approved_at: s.approved_at ? new Date(s.approved_at) : null,
              staff_username: s.staff_username || `Staff#${s.approved_by}`,
            }))
          : []
      );
    } catch (err) {
      console.error("Error fetching accepted requests:", err.response?.data || err.message);
      setAcceptedFiles([]);
      setAcceptedSchedules([]);
    }
  };

  // Fetch returned schedules
  const fetchReturnedSchedules = async () => {
    try {
      const res = await axiosAuth.get("/api/staff/returned-schedules");
      setReturnedSchedules(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching returned schedules:", err);
      setReturnedSchedules([]);
    }
  };

  // Fetch released schedules
  const fetchReleasedSchedules = async () => {
    try {
      const res = await axiosAuth.get("/api/staff/released-schedules");
      setReleasedSchedules(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching released schedules:", err);
      setReleasedSchedules([]);
    }
  };

  // Fetch printed files
  const fetchPrintedFiles = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/staff/printed-files`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setPrintedFiles(res.data);
    } catch (err) {
      console.error("Error fetching printed files:", err.response?.data || err);
    }
  };

  // Fetch resident requests
  const fetchResidentRequests = async (residentId) => {
    try {
      const [filesRes, schedulesRes] = await Promise.all([
        axiosAuth.get(`/api/staff/files/resident/${residentId}`),
        axiosAuth.get(`/api/staff/schedules/resident/${residentId}`),
      ]);

      setSelectedResidentRequests({
        files: Array.isArray(filesRes.data)
          ? filesRes.data.filter((f) => f.status.toLowerCase() === "pending")
          : [],
        schedules: Array.isArray(schedulesRes.data)
          ? schedulesRes.data.filter((s) => s.status.toLowerCase() === "pending")
          : [],
      });
    } catch (err) {
      console.error("Error fetching resident requests:", err.response?.data || err.message);
      setSelectedResidentRequests({ files: [], schedules: [] });
    }
  };

  // ==================== ACTION FUNCTIONS ====================

  // Release schedule (Go to Pickup)
  const releaseSchedule = async (scheduleId) => {
    try {
      await axiosAuth.put(`/api/staff/schedules/${scheduleId}/release`);
      fetchAcceptedRequests(); // Refresh the lists
      fetchReleasedSchedules();
      return true;
    } catch (err) {
      console.error("Error releasing schedule:", err);
      alert(err.response?.data?.error || "Failed to release schedule");
      return false;
    }
  };

  // Return schedule
  const returnSchedule = async (scheduleId, returnData) => {
    try {
      await axiosAuth.put(`/api/staff/schedules/${scheduleId}/return`, returnData);
      fetchReleasedSchedules(); // Refresh the lists
      fetchReturnedSchedules();
      return true;
    } catch (err) {
      console.error("Error returning schedule:", err);
      alert(err.response?.data?.error || "Failed to return schedule");
      return false;
    }
  };

  // Handle file status change
  const handleFileStatusChange = async (fileId, status) => {
    if (!staffId || !selectedResident) return;
    try {
      const payload = { status };
      if (status.toLowerCase() === "approved") payload.approved_by = staffId;

      await axiosAuth.put(`/api/staff/files/${fileId}`, payload);

      const updatedFiles = selectedResidentRequests.files.filter((f) => f.id !== fileId);
      const updatedSchedules = selectedResidentRequests.schedules;

      updateInboxIfNoPending(selectedResident.id, updatedFiles, updatedSchedules);
      fetchAcceptedRequests();
      setSelectedFile(null);
    } catch (err) {
      console.error("Error updating file status:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to update file status");
    }
  };

  // Handle schedule status change
  const handleScheduleStatusChange = async (scheduleId, status) => {
    if (!staffId || !selectedResident) return;
    const payload = { status: status.toLowerCase(), approved_by: staffId };

    try {
      await axiosAuth.put(`/api/staff/schedules/${scheduleId}/status`, payload);
      const updatedSchedules = selectedResidentRequests.schedules.filter(s => s.id !== scheduleId);
      const updatedFiles = selectedResidentRequests.files;
      updateInboxIfNoPending(selectedResident.id, updatedFiles, updatedSchedules);
      fetchAcceptedRequests();
      setSelectedSchedule(null);
    } catch (err) {
      console.error("Error updating schedule status:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to update schedule status");
    }
  };

  // Handle account action
  const handleAccountAction = async (id, action) => {
    try {
      await axiosAuth.put(`/api/staff/residents/${id}/status`, { status: action });
      setPendingAccounts(prev => prev.filter(acc => acc.id !== id));
    } catch (err) {
      console.error("Error updating account status:", err.response?.data || err.message);
    }
  };

  // ==================== HELPER FUNCTIONS ====================

  // Update inbox when requests are processed
  const updateInboxIfNoPending = (residentId, updatedFiles, updatedSchedules) => {
    const hasPending = updatedFiles.length > 0 || updatedSchedules.length > 0;
    if (!hasPending) {
      setResidents((prev) => prev.filter((r) => r.id !== residentId));
      setSelectedResident(null);
      setSelectedResidentRequests({ files: [], schedules: [] });
    } else {
      setSelectedResidentRequests({ files: updatedFiles, schedules: updatedSchedules });
    }
  };

  // ==================== USE EFFECTS ====================

  // Fetch residents on component mount
  useEffect(() => {
    fetchResidents();
  }, [token]);

  // Fetch pending accounts when accounts tab is active
  useEffect(() => {
    if (activeTab === "accounts") {
      const fetchPendingAccounts = async () => {
        try {
          const res = await axiosAuth.get("/api/staff/residents/accounts");
          setPendingAccounts(res.data.filter(acc => acc.status === "pending"));
        } catch (err) {
          console.error("Error fetching accounts:", err.response?.data || err.message);
        }
      };
      fetchPendingAccounts();
    }
  }, [activeTab]);

  // Auto-fetch data when tab changes
  useEffect(() => {
    switch (activeTab) {
      case "inbox":
        fetchResidents();
        break;
      case "accepted":
      case "scheduled":
        fetchAcceptedRequests();
        break;
      case "released":
        fetchReleasedSchedules();
        break;
      case "returned":
        fetchReturnedSchedules();
        break;
      case "printed":
        fetchPrintedFiles();
        break;
      default:
        break;
    }
  }, [activeTab]);

  // ==================== RETURN OBJECT ====================

  return {
    // State
    residents,
    selectedResident,
    selectedResidentRequests,
    selectedFile,
    selectedSchedule,
    selectedAccepted,
    selectedPendingAccount,
    acceptedFiles,
    acceptedSchedules,
    returnedSchedules,
    releasedSchedules,
    printedFiles,
    pendingAccounts,
    searchTerm,
    modalLoading,
    
    // Setters
    setSelectedResident,
    setSelectedFile,
    setSelectedSchedule,
    setSelectedAccepted,
    setSelectedPendingAccount,
    setSearchTerm,
    setModalLoading,
    
    // Functions
    fetchResidentRequests,
    handleFileStatusChange,
    handleScheduleStatusChange,
    handleAccountAction,
    fetchPrintedFiles,
    releaseSchedule,
    returnSchedule,
    
    // For main component to set active tab
    setActiveTab: (tab) => {
      // You can add any tab-specific logic here if needed
    }
  };
}
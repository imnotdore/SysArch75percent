import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../config";

export default function useStaffData(staffId, activeTab) {
  const [residents, setResidents] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);
  const [selectedResidentRequests, setSelectedResidentRequests] = useState({ 
    files: [], 
    schedules: [], 
    computerRequests: [] // Initialize with empty array
  });
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
  const baseUrl = API_URL || import.meta.env.VITE_API_URL || "http://localhost:3000";
  
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
              staff_username: f.staff_name || f.staff_username || `Staff#${f.approved_by}`,
            }))
          : []
      );

      setAcceptedSchedules(
        Array.isArray(schedulesRes.data)
          ? schedulesRes.data.map((s, idx) => ({
              ...s,
              id: s.id ?? s.schedule_id ?? idx,
              approved_at: s.approved_at ? new Date(s.approved_at) : null,
              staff_display: s.staff_name 
                ? `${s.staff_name} (${s.staff_username})` 
                : s.staff_username || `Staff#${s.approved_by}`,
              staff_username: s.staff_username,
              staff_name: s.staff_name,
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
      const token = localStorage.getItem("token");
      
      if (!API_URL) {
        console.error("API_URL is not defined. Check your config file.");
        return { files: [], schedules: [], computerRequests: [] };
      }
      
      // Fetch files
      const filesResponse = await axios.get(
        `${API_URL}/api/staff/files/resident/${residentId}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      ).catch(() => ({ data: [] }));
      
      // Fetch schedules
      const schedulesResponse = await axios.get(
        `${API_URL}/api/staff/schedules/resident/${residentId}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      ).catch(() => ({ data: [] }));
      
      // Fetch computer requests
      const computerResponse = await axios.get(
        `${API_URL}/api/staff/computer-requests/resident/${residentId}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      ).catch(() => ({ data: [] }));
      
      const result = {
        files: (filesResponse.data || []).filter(file => file.status === 'Pending'),
        schedules: (schedulesResponse.data || []).filter(schedule => schedule.status === 'Pending'),
        computerRequests: (computerResponse.data || []).filter(computer => computer && computer.status === 'Pending')
      };
      
      setSelectedResidentRequests(result);
      return result;
    } catch (error) {
      console.error("Error fetching resident requests:", error);
      const result = { files: [], schedules: [], computerRequests: [] };
      setSelectedResidentRequests(result);
      return result;
    }
  };

  // ==================== ACTION FUNCTIONS ====================

  // Release schedule (Go to Pickup)
  const releaseSchedule = async (scheduleId) => {
    try {
      await axiosAuth.put(`/api/staff/schedules/${scheduleId}/release`);
      fetchAcceptedRequests();
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
      fetchReleasedSchedules();
      fetchReturnedSchedules();
      return true;
    } catch (err) {
      console.error("Error returning schedule:", err);
      alert(err.response?.data?.error || "Failed to return schedule");
      return false;
    }
  };

  const handleFileStatusChange = async (fileId, status) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const staffId = userData.id || localStorage.getItem("staffId");
      
      if (!staffId) {
        alert("Error: Staff information not found. Please login again.");
        return;
      }
      
      console.log("=== DEBUG FILE STATUS CHANGE ===");
      console.log("Original status from button:", status);
      console.log("Staff ID:", staffId);
      console.log("File ID:", fileId);
      
      const statusFormats = [
        "APPROVED",
        "Approved",
        "approved",
        "Accepted",
      ];
      
      let success = false;
      let lastError = null;
      
      for (const statusValue of statusFormats) {
        try {
          const payload = { 
            status: statusValue,
            approved_by: staffId
          };
          
          console.log(`Trying status: "${statusValue}"`);
          
          const response = await axiosAuth.put(`/api/staff/files/${fileId}`, payload);
          
          console.log(`✅ SUCCESS with status: "${statusValue}"`);
          console.log("Backend response:", response.data);
          
          alert(`✅ File ${status} successfully!`);
          
          fetchResidents();
          fetchAcceptedRequests();
          setSelectedFile(null);
          
          success = true;
          break;
          
        } catch (err) {
          lastError = err;
          console.log(`❌ FAILED with status: "${statusValue}"`);
        }
      }
      
      if (!success && lastError) {
        console.error("All formats failed:", lastError);
        throw lastError;
      }
      
    } catch (err) {
      console.error("=== ERROR DETAILS ===");
      console.error("Error response:", err.response);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);
      console.error("Error message:", err.message);
      
      let errorMessage = "Failed to update file status.";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      alert(`❌ Error: ${errorMessage}`);
    }
  };

  const handleScheduleStatusChange = async (scheduleId, status) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const staffId = userData.id || localStorage.getItem("staffId");
      
      if (!staffId) {
        alert("Error: Staff information not found. Please login again.");
        return;
      }

      console.log("Staff approving:", staffId);
      
      const statusUpper = status.toUpperCase();
      
      const payload = { 
        status: statusUpper, 
        approved_by: staffId
      };

      console.log("Approving schedule:", {
        scheduleId,
        payload,
        endpoint: `/api/staff/schedules/${scheduleId}/status`
      });

      const response = await axiosAuth.put(
        `/api/staff/schedules/${scheduleId}/status`, 
        payload
      );
      
      console.log("Backend response:", response.data);
      
      alert(`✅ Schedule ${status} successfully!`);
      
      if (selectedResident) {
        const updatedSchedules = selectedResidentRequests.schedules.filter(
          s => s.id !== scheduleId
        );
        const updatedFiles = selectedResidentRequests.files;
        updateInboxIfNoPending(selectedResident.id, updatedFiles, updatedSchedules);
      }
      
      fetchAcceptedRequests();
      setSelectedSchedule(null);
      
    } catch (err) {
      console.error("Schedule approval error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      let errorMessage = "Failed to update schedule status.";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      alert(`❌ Error: ${errorMessage}`);
    }
  };

  // Handle account action WITH EMAIL
  const handleAccountAction = async (id, action) => {
    try {
      const confirmMessage = action === 'approved' 
        ? 'Are you sure you want to approve this account? An email will be sent to the user.'
        : 'Are you sure you want to reject this account? An email will be sent to the user.';
      
      if (!window.confirm(confirmMessage)) {
        return false;
      }

      let endpoint;
      let method;
      
      if (action === 'approved') {
        endpoint = `${baseUrl}/api/auth/resident/approve/${id}`;
        method = 'PUT';
      } else {
        endpoint = `${baseUrl}/api/auth/resident/reject/${id}`;
        method = 'DELETE';
      }

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Account ${action === 'approved' ? 'approved' : 'rejected'} successfully! ${data.emailSent ? 'Email sent to user.' : ''}`);
        
        setPendingAccounts(prev => prev.filter(acc => acc.id !== id));
        
        if (selectedPendingAccount && selectedPendingAccount.id === id) {
          setSelectedPendingAccount(null);
        }
        
        return true;
      } else {
        alert(`❌ Error: ${data.message || data.error}`);
        return false;
      }
    } catch (err) {
      console.error("Error updating account status:", err.response?.data || err.message);
      alert('❌ Failed to process request. Please try again.');
      return false;
    }
  };

  // ==================== HELPER FUNCTIONS ====================

  // Update inbox when requests are processed
  const updateInboxIfNoPending = (residentId, updatedFiles, updatedSchedules) => {
    const hasPending = updatedFiles.length > 0 || updatedSchedules.length > 0;
    if (!hasPending) {
      setResidents((prev) => prev.filter((r) => r.id !== residentId));
      setSelectedResident(null);
      setSelectedResidentRequests({ files: [], schedules: [], computerRequests: [] });
    } else {
      setSelectedResidentRequests({ 
        files: updatedFiles, 
        schedules: updatedSchedules,
        computerRequests: selectedResidentRequests.computerRequests || []
      });
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
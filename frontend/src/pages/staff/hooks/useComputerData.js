// hooks/useComputerData.js
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";

export default function useComputerData() {
  const [computerRequests, setComputerRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComputerRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/staff/computer-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComputerRequests(response.data);
    } catch (err) {
      console.error("Error fetching computer requests:", err);
      setError(err.response?.data?.error || "Failed to fetch computer requests");
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, status, reason = '') => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/api/staff/computer-requests/${requestId}/status`,
        { status, ...(reason && { reason }) },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        await fetchComputerRequests();
        return { success: true, data: response.data.data };
      }
      return { success: false, error: response.data.error };
    } catch (err) {
      console.error("Error updating computer request:", err);
      return { 
        success: false, 
        error: err.response?.data?.error || "Failed to update request" 
      };
    }
  };

  useEffect(() => {
    fetchComputerRequests();
  }, []);

  return {
    computerRequests,
    loading,
    error,
    fetchComputerRequests,
    updateRequestStatus
  };
}
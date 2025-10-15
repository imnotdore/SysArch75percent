import { createContext, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

export const ComputerBorrowingContext = createContext();

export const ComputerBorrowingProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);

  // Fetch resident's PC borrow requests
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      const res = await axios.get(`${API_URL}/api/computer-borrow`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRequests(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch PC borrow requests:", err.response?.data || err.message);
      throw err;
    }
  };

  // Add new PC borrow request
  const addRequest = async (requestData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      const { pc, date, startTime, endTime } = requestData;
      if (!pc || !date || !startTime || !endTime) {
        throw new Error("Missing required fields");
      }

      const payload = { pc, date, startTime, endTime };

      const res = await axios.post(`${API_URL}/api/computer-borrow`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRequests((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Failed to add PC borrow request:", err.response?.data || err.message);
      throw err;
    }
  };

  // Cancel a request
  const cancelRequest = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      await axios.delete(`${API_URL}/api/computer-borrow/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to cancel PC borrow request:", err.response?.data || err.message);
      throw err;
    }
  };

  return (
    <ComputerBorrowingContext.Provider
      value={{ requests, fetchRequests, addRequest, cancelRequest }}
    >
      {children}
    </ComputerBorrowingContext.Provider>
  );
};

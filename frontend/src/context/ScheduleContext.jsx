import { createContext, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const [schedules, setSchedules] = useState([]);

  // Fetch resident schedules
  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      const res = await axios.get(`${API_URL}/api/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSchedules(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch schedules:", err.response?.data || err.message);
      throw err;
    }
  };

  // Add schedule
  const addSchedule = async (scheduleData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      // Validate fields
      const { dateFrom, dateTo, timeFrom, timeTo, item, quantity } = scheduleData;
      if (!dateFrom || !dateTo || !timeFrom || !timeTo || !item) {
        throw new Error("Missing required fields");
      }

      const payload = {
        dateFrom,
        dateTo,
        timeFrom,
        timeTo,
        item,
        quantity: parseInt(quantity) || 1,
      };

      console.log("Sending schedule payload:", payload);

      const res = await axios.post(`${API_URL}/api/schedules`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSchedules((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Failed to add schedule:", err.response?.data || err.message);
      throw err;
    }
  };

  // Cancel schedule
  const cancelSchedule = async (scheduleId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      await axios.delete(`${API_URL}/api/schedules/${scheduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    } catch (err) {
      console.error("Failed to cancel schedule:", err.response?.data || err.message);
      throw err;
    }
  };

  return (
    <ScheduleContext.Provider
      value={{ schedules, fetchSchedules, addSchedule, cancelSchedule }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

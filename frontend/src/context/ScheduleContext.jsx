import { createContext, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const [schedules, setSchedules] = useState([]);

  // Fetch schedules for the logged-in resident (userId galing JWT sa backend)
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
      console.error("Failed to fetch schedules:", err);
      throw err;
    }
  };

  // Add schedule
  const addSchedule = async (newSchedule) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      const res = await axios.post(`${API_URL}/api/schedules`, newSchedule, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSchedules((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Failed to add schedule:", err);
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
      console.error("Failed to cancel schedule:", err);
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

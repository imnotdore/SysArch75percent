import { createContext, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const [schedules, setSchedules] = useState([]);

  // Fetch schedules for the logged-in resident
  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      const res = await axios.get(`${API_URL}/api/resident/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSchedules(res.data);
      return res.data; // optional if you want a promise
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
      throw err;
    }
  };

  // Optionally, you can add functions to refresh, cancel, or update schedules
  const cancelSchedule = async (scheduleId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      await axios.delete(`${API_URL}/api/resident/schedules/${scheduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from local state
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    } catch (err) {
      console.error("Failed to cancel schedule:", err);
      throw err;
    }
  };

  return (
    <ScheduleContext.Provider value={{ schedules, fetchSchedules, cancelSchedule }}>
      {children}
    </ScheduleContext.Provider>
  );
};

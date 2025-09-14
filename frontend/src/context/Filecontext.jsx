import { createContext, useState } from "react";
import axios from "axios";

export const FileContext = createContext();

export function FileProvider({ children }) {
  const [files, setFiles] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!token || !storedUser?.id) return;

      const res = await axios.get(`${API_URL}/api/files/resident/${storedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(res.data);
    } catch (err) {
      console.error("Failed to fetch files:", err);
    }
  };

  return (
    <FileContext.Provider value={{ files, setFiles, fetchFiles }}>
      {children}
    </FileContext.Provider>
  );
}

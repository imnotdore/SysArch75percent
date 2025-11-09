import { useState, useEffect } from "react";

export default function useStaffAuth(navigate) {
  const [username, setUsername] = useState("");
  const [staffId, setStaffId] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    
    const storedUsername = localStorage.getItem("username");
    const storedStaffId = localStorage.getItem("staffId");
    
    if (storedUsername) setUsername(storedUsername);
    if (storedStaffId) setStaffId(Number(storedStaffId));
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("staffId");
    localStorage.removeItem("staffName");
    localStorage.removeItem("staffStaffId");
    navigate("/");
  };

  return {
    username,
    staffId,
    token,
    handleLogout
  };
}
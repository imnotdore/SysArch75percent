import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaSignOutAlt, FaHome, FaConciergeBell, FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import axios from "axios";
import { API_URL } from "../config";

export default function ComputerBorrowing() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const sidebarRef = useRef(null);

  const [pc, setPc] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [endTimeOptions, setEndTimeOptions] = useState([]);
  const [error, setError] = useState("");

  const pcs = ["PC 1", "PC 2", "PC 3", "PC 4", "PC 5"];

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // Generate end time options based on selected start time
  useEffect(() => {
    if (!startTime) {
      setEndTimeOptions([]);
      setEndTime("");
      return;
    }

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const options = [];
    const startDate = new Date();
    startDate.setHours(startHour, startMinute, 0, 0);

    for (let i = 30; i <= 120; i += 30) { // increments of 30 mins, max 2 hours
      const endDate = new Date(startDate.getTime() + i * 60 * 1000);
      const hours = endDate.getHours();
      const minutes = endDate.getMinutes();

      if (hours > 22 || (hours === 22 && minutes > 0)) break;

      const hStr = hours.toString().padStart(2, "0");
      const mStr = minutes.toString().padStart(2, "0");
      options.push(`${hStr}:${mStr}`);
    }

    setEndTimeOptions(options);
    setEndTime(options[0] || "");
  }, [startTime]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleSubmit = async () => {
    if (!pc || !date || !startTime || !endTime) {
      setError("Please fill out all fields.");
      return;
    }

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const diffHours = (end - start) / (1000 * 60 * 60);

    if (diffHours <= 0) {
      setError("End time must be after start time.");
      return;
    }
    if (diffHours > 2) {
      setError("You can borrow a PC for a maximum of 2 hours.");
      return;
    }

    try {
      await axios.post(
         `${API_URL}/api/computer-borrow`,
        { pc, date, startTime, endTime },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert(`Request submitted!\nPC: ${pc}\nDate: ${date}\nTime: ${startTime} - ${endTime}`);
      setPc(""); setDate(""); setStartTime(""); setEndTime(""); setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit request");
    }
  };

  return (
    <div style={{ fontFamily: '"Lexend", sans-serif', width: "100%", minHeight: "100%" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#F4BE2A", color: "black", padding: "15px 20px", display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 999 }}>
        {isMobile && <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: "pointer", marginRight: "10px" }}>{sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}</div>}
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>Computer Borrowing</h1>
      </header>

      <div style={{ display: "flex", position: "relative" }}>
        {/* Sidebar */}
        <aside ref={sidebarRef} style={{ position: isMobile ? "fixed" : "relative", top: 0, left: sidebarOpen || !isMobile ? 0 : "-220px", height: "100vh", width: "220px", backgroundColor: "#A43259", color: "white", transition: "left 0.3s ease", zIndex: 1000, padding: "20px 10px", display: "flex", flexDirection: "column" }}>
          <div onClick={() => navigate("/resident/youraccount")} style={{ textAlign: "center", marginBottom: "20px", padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "8px", color: "black", cursor: "pointer" }}>
            <FaUserCircle size={50} color="black" />
            <p style={{ fontWeight: "bold", marginTop: "10px" }}>Your Account</p>
          </div>
          <div onClick={() => navigate("/resident/dashboard")} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "10px", fontSize: "15px", borderRadius: "6px", marginBottom: "10px", backgroundColor: "#F4BE2A", color: "black" }}>
            <FaHome /> Home
          </div>
          <div>
            <div onClick={() => setServicesOpen(!servicesOpen)} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "10px", fontSize: "15px", borderRadius: "6px", marginBottom: "10px", backgroundColor: "#F4BE2A", color: "black" }}>
              <FaConciergeBell /> Services
            </div>
            {servicesOpen && (
              <div style={{ marginLeft: "15px", display: "flex", flexDirection: "column", gap: "5px" }}>
                <div onClick={() => navigate("/resident/request")} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "6px", fontSize: "13px", borderRadius: "6px", backgroundColor: "#1E90FF", color: "white" }}>Requests</div>
                <div onClick={() => navigate("/resident/computer-borrowing")} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "6px", fontSize: "13px", borderRadius: "6px", backgroundColor: "#26ff1e", color: "black" }}>Computer Borrowing</div>
              </div>
            )}
          </div>
          <div style={{ marginTop: "auto", paddingTop: "20px" }}>
            <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ff0000", color: "white", width: "100%", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: "20px", overflowY: "auto", minHeight: "100vh" }}>
          <section style={{ marginBottom: "30px", maxWidth: "500px", margin: "20px auto", padding: "20px", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <label>Choose PC:</label>
            <select value={pc} onChange={(e) => setPc(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px" }}>
              <option value="">-- Select PC --</option>
              {pcs.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <label>Date:</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px" }} min={new Date().toISOString().split("T")[0]} />

            <label>Start Time (08:00–22:00):</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px" }} min="08:00" max="22:00" />

            <label>End Time (Max 2 hours, 30-min steps):</label>
            <select value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px" }}>
              {endTimeOptions.length === 0 ? (
                <option value="">-- Select start time first --</option>
              ) : (
                endTimeOptions.map((t) => <option key={t} value={t}>{t}</option>)
              )}
            </select>

            <button onClick={handleSubmit} style={{ padding: "10px 15px", backgroundColor: "#28D69F", color: "white", fontWeight: "bold", width: "100%" }}>
              Submit Request
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaCalendarAlt, FaSignOutAlt, FaHome, FaFileAlt, FaConciergeBell, FaBars, FaTimes } from "react-icons/fa";

export default function SchedulePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [form, setForm] = useState({
    dateFrom: "",
    dateTo: "",
    timeFrom: "",
    timeTo: "",
    item: "",
    quantity: 1,
  });
  const [mySchedules, setMySchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar if clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // Check token & fetch schedules
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    fetchSchedules(token);
  }, []);

  // Fetch schedules helper
  const fetchSchedules = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMySchedules(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
      if (err.response && [401, 403].includes(err.response.status)) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to load schedules.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Submit schedule
  const handleSubmit = async () => {
    if (!form.dateFrom || !form.dateTo || !form.timeFrom || !form.timeTo || !form.item) {
      return alert("Please fill out all fields!");
    }

    const newSchedule = {
      dateFrom: form.dateFrom,
      dateTo: form.dateTo,
      time: `${form.timeFrom} - ${form.timeTo}`,
      item: form.item,
      quantity: form.quantity,
      status: "Pending",
    };

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/api/schedules`, newSchedule, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if ([200, 201].includes(response.status)) {
        alert("Schedule submitted successfully! Status is Pending.");
        setForm({ dateFrom: "", dateTo: "", timeFrom: "", timeTo: "", item: "", quantity: 1 });
        fetchSchedules(token); // Refresh
      }
    } catch (err) {
      console.error(err);
      if (err.response && [401, 403].includes(err.response.status)) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert("Failed to submit schedule.");
      }
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleLogout = () => { localStorage.removeItem("token"); navigate("/"); };

  const getStatusStyle = (status) => {
    let color = "#000", bgColor = "#fff";
    if (status?.toLowerCase() === "approved") { color = "green"; bgColor = "#d4edda"; }
    else if (status?.toLowerCase() === "pending") { color = "orange"; bgColor = "#fff3cd"; }
    else if (status?.toLowerCase() === "rejected") { color = "red"; bgColor = "#f8d7da"; }
    return { ...tableCellStyle, color, backgroundColor: bgColor, fontWeight: "bold" };
  };

  return (
    <div style={{ fontFamily: '"Lexend", sans-serif', width: "100%", minHeight: "100%" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#F4BE2A", color: "black", padding: "15px 20px", display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 999 }}>
        {isMobile && <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: "pointer", marginRight: "10px" }}>{sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}</div>}
        <h1 style={{ margin: 0, fontSize: isMobile ? "16px" : "clamp(18px, 2vw, 28px)", fontWeight: "bold" }}>MY SCHEDULE</h1>
      </header>

      <div style={{ display: "flex", position: "relative" }}>
        {/* Sidebar */}
        <aside ref={sidebarRef} style={{ position: isMobile ? "fixed" : "relative", top: 0, left: sidebarOpen || !isMobile ? 0 : "-240px", height: "100vh", width: "220px", backgroundColor: "#A43259", color: "white", transition: "left 0.3s ease", zIndex: 1000, padding: "20px 10px", display: "flex", flexDirection: "column" }}>
          <div style={{ ...menuStyle, backgroundColor: "#F4BE2A", color: "black" }} onClick={() => navigate("/resident/dashboard")}> <FaHome style={iconStyle} /> Home </div>

          <div>
            <div style={{ ...menuStyle, backgroundColor: "#F4BE2A", color: "black" }} onClick={() => setServicesOpen(!servicesOpen)}> <FaConciergeBell style={iconStyle} /> Services </div>
            {servicesOpen && <div style={{ marginLeft: "15px", display: "flex", flexDirection: "column", gap: "5px", marginTop: "5px" }}>
              <div style={{ ...submenuStyle, backgroundColor: "#1E90FF", color: "white" }} onClick={() => navigate("/resident/request")}> <FaFileAlt style={iconStyle} /> Requests </div>
              <div style={{ ...submenuStyle, backgroundColor: "#1E90FF", color: "white" }} onClick={() => navigate("/resident/schedule")}> <FaCalendarAlt style={iconStyle} /> Schedule </div>
            </div>}
          </div>

          <div style={{ marginTop: "auto", paddingTop: "20px" }}>
            <button onClick={handleLogout} style={{ ...menuStyle, backgroundColor: "#ff0000", color: "white", width: "100%", justifyContent: "center", fontWeight: "bold" }}> <FaSignOutAlt style={iconStyle} /> Logout </button>
          </div>
        </aside>

        {/* Main content */}
        <main
  style={{
    flex: 1,
    padding: isMobile ? "15px 10px" : "20px",
    overflowY: "auto",
    minHeight: "100vh",
    boxSizing: "border-box",
    transition: "margin-left 0.3s ease",
    marginLeft: isMobile && sidebarOpen ? "220px" : "0",
  }}
>
  {/* Form */}
  <div
    style={{
      maxWidth: "400px",
      margin: "0 auto",
      padding: "20px",
      border: "1px solid #ccc",
      borderRadius: "10px",
      backgroundColor: "#fff",
      display: "flex",
      flexDirection: "column",
      gap: "15px",
    }}
  >
    <h2 style={{ color: "#28D69F", textAlign: "center" }}>Submit Your Schedule</h2>

    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label>Date From</label>
      <input
        type="date"
        name="dateFrom"
        value={form.dateFrom}
        onChange={handleChange}
        style={inputStyle}
      />
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label>Date To</label>
      <input
        type="date"
        name="dateTo"
        value={form.dateTo}
        onChange={handleChange}
        style={inputStyle}
      />
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label>Time From</label>
      <input
        type="time"
        name="timeFrom"
        value={form.timeFrom}
        onChange={handleChange}
        style={inputStyle}
      />
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label>Time To</label>
      <input
        type="time"
        name="timeTo"
        value={form.timeTo}
        onChange={handleChange}
        style={inputStyle}
      />
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label>Item</label>
      <select
        name="item"
        value={form.item}
        onChange={handleChange}
        style={inputStyle}
      >
        <option value="">-- Select Item --</option>
        <option value="Projector">Projector</option>
        <option value="Laptop">Laptop</option>
        <option value="Chair">Chair</option>
        <option value="Table">Table</option>
      </select>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label>Quantity</label>
      <input
        type="number"
        name="quantity"
        min="1"
        value={form.quantity}
        onChange={handleChange}
        style={inputStyle}
      />
    </div>

    <button
      onClick={handleSubmit}
      style={{
        padding: "10px",
        backgroundColor: "#A43259",
        color: "white",
        border: "none",
        borderRadius: "5px",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      Submit Schedule
    </button>
  </div>
</main>

      </div>
    </div>
  );
}

const menuStyle = { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "10px", fontSize: "15px", borderRadius: "6px", marginBottom: "10px" };
const submenuStyle = { ...menuStyle, fontSize: "13px", width: "90%", padding: "6px" };
const iconStyle = { fontSize: "16px" };
const inputStyle = { width: "100%", padding: "6px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "14px" };
const tableCellStyle = { border: "1px solid #ccc", padding: "8px", textAlign: "center" };

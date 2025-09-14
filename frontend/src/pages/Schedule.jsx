import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaSignOutAlt,
  FaHome,
  FaConciergeBell,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { ScheduleContext } from "../context/ScheduleContext.jsx";

export default function Schedule() {
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
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const { schedules, fetchSchedules, addSchedule, cancelSchedule } = useContext(ScheduleContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mobile detection
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

  // Fetch schedules on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setLoading(true);
    fetchSchedules()
      .catch((err) => {
        console.error(err);
        if (err.response && [401, 403].includes(err.response.status)) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to load schedules.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const getStatusStyle = (status) => {
    let color = "#000",
      bgColor = "#fff";
    if (status?.toLowerCase() === "approved") {
      color = "green";
      bgColor = "#d4edda";
    } else if (status?.toLowerCase() === "pending") {
      color = "orange";
      bgColor = "#fff3cd";
    } else if (status?.toLowerCase() === "rejected") {
      color = "red";
      bgColor = "#f8d7da";
    }
    return { ...tableCellStyle, color, backgroundColor: bgColor, fontWeight: "bold" };
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this schedule?")) return;
    try {
      await cancelSchedule(id);
      alert("Schedule canceled successfully.");
    } catch {
      alert("Failed to cancel schedule.");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const { dateFrom, dateTo, timeFrom, timeTo, item, quantity } = form;
    if (!dateFrom || !dateTo || !timeFrom || !timeTo || !item) {
      return alert("Please fill out all fields!");
    }

    const newSchedule = {
      dateFrom,
      dateTo,
      time: `${timeFrom} - ${timeTo}`,
      item,
      quantity: parseInt(quantity),
      status: "Pending",
    };

    try {
      await addSchedule(newSchedule);
      alert("Schedule submitted successfully! Status is Pending.");
      setForm({ dateFrom: "", dateTo: "", timeFrom: "", timeTo: "", item: "", quantity: 1 });
    } catch {
      alert("Failed to submit schedule.");
    }
  };

  return (
    <div style={{ fontFamily: '"Lexend", sans-serif', width: "100%", minHeight: "100%" }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: "#F4BE2A",
          color: "black",
          padding: "15px 20px",
          display: "flex",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 999,
        }}
      >
        {isMobile && (
          <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: "pointer", marginRight: "10px" }}>
            {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </div>
        )}
        <h1 style={{ margin: 0, fontSize: isMobile ? "16px" : "clamp(18px, 2vw, 28px)", fontWeight: "bold" }}>
          MY SCHEDULE
        </h1>
      </header>

      <div style={{ display: "flex", position: "relative" }}>
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          style={{
            position: isMobile ? "fixed" : "relative",
            top: 0,
            left: sidebarOpen || !isMobile ? 0 : "-240px",
            height: "100vh",
            width: "220px",
            backgroundColor: "#A43259",
            color: "white",
            transition: "left 0.3s ease",
            zIndex: 1000,
            padding: "20px 10px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Home */}
          <div
            style={{
              ...menuStyle,
              backgroundColor: "#F4BE2A",
              color: "black",
              borderRadius: "8px",
              padding: "10px",
              textAlign: "center",
              marginBottom: "10px",
            }}
            onClick={() => navigate("/resident/dashboard")}
          >
            <FaHome style={{ marginRight: "5px" }} /> Home
          </div>

          {/* Services */}
          <div>
            <div
              style={{ ...menuStyle, backgroundColor: "#F4BE2A", color: "black" }}
              onClick={() => setServicesOpen(!servicesOpen)}
            >
              <FaConciergeBell style={iconStyle} /> Services
            </div>
            {servicesOpen && (
              <div style={{ marginLeft: "15px", display: "flex", flexDirection: "column", gap: "5px", marginTop: "5px" }}>
                <div
                  style={{ ...submenuStyle, backgroundColor: "#1E90FF", color: "white" }}
                  onClick={() => navigate("/resident/request")}
                >
                  Requests
                </div>
                <div
                  style={{ ...submenuStyle, backgroundColor: "#1E90FF", color: "white" }}
                  onClick={() => navigate("/resident/schedule")}
                >
                  Schedule
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <div style={{ marginTop: "auto", paddingTop: "20px" }}>
            <button
              onClick={handleLogout}
              style={{
                ...menuStyle,
                backgroundColor: "#ff0000",
                color: "white",
                width: "100%",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              <FaSignOutAlt style={iconStyle} /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: isMobile ? "15px 10px" : "20px", overflowY: "auto", minHeight: "100vh" }}>
          {/* Schedule Form */}
          <section style={formContainer}>
            <h2 style={{ color: "#28D69F", textAlign: "center" }}>Submit Schedule</h2>
            <input type="date" name="dateFrom" value={form.dateFrom} onChange={handleChange} style={inputStyle} />
            <input type="date" name="dateTo" value={form.dateTo} onChange={handleChange} style={inputStyle} />
            <input type="time" name="timeFrom" value={form.timeFrom} onChange={handleChange} style={inputStyle} />
            <input type="time" name="timeTo" value={form.timeTo} onChange={handleChange} style={inputStyle} />
            <select name="item" value={form.item} onChange={handleChange} style={inputStyle}>
              <option value="">-- Select Item --</option>
              <option value="Projector">Projector</option>
              <option value="Laptop">Laptop</option>
              <option value="Chair">Chair</option>
              <option value="Table">Table</option>
            </select>
            <input
              type="number"
              name="quantity"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Quantity"
            />
            <button onClick={handleSubmit} style={buttonStyle}>
              Submit Schedule
            </button>
          </section>

          {/* Schedule List */}
          <section>
            <h2 style={{ color: "#28D69F", marginTop: "30px" }}>Your Schedules</h2>
            {loading ? (
              <p>Loading schedules...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : schedules.length === 0 ? (
              <p>No schedules yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F4BE2A" }}>
                    <th style={tableCellStyle}>Item</th>
                    <th style={tableCellStyle}>Date From</th>
                    <th style={tableCellStyle}>Date To</th>
                    <th style={tableCellStyle}>Time</th>
                    <th style={tableCellStyle}>Quantity</th>
                    <th style={tableCellStyle}>Status</th>
                    <th style={tableCellStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr key={s.id}>
                      <td style={tableCellStyle}>{s.item}</td>
                      <td style={tableCellStyle}>{s.dateFrom}</td>
                      <td style={tableCellStyle}>{s.dateTo}</td>
                      <td style={tableCellStyle}>{s.time}</td>
                      <td style={tableCellStyle}>{s.quantity}</td>
                      <td style={getStatusStyle(s.status)}>{s.status}</td>
                      <td style={tableCellStyle}>
                        {s.status.toLowerCase() === "pending" && (
                          <button onClick={() => handleCancel(s.id)} style={cancelBtnStyle}>
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

// Styles
const menuStyle = { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "10px", fontSize: "15px", borderRadius: "6px", marginBottom: "10px" };
const submenuStyle = { ...menuStyle, fontSize: "13px", width: "90%", padding: "6px" };
const iconStyle = { fontSize: "16px" };
const tableCellStyle = { border: "1px solid #ccc", padding: "8px", textAlign: "center" };
const inputStyle = { width: "100%", padding: "8px 10px", margin: "8px 0", borderRadius: "6px", border: "1px solid #ccc" };
const buttonStyle = { width: "100%", padding: "10px", backgroundColor: "#28D69F", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const cancelBtnStyle = { backgroundColor: "#ff4d4f", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" };
const formContainer = { marginBottom: "30px", maxWidth: "400px", margin: "20px auto", padding: "20px", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" };

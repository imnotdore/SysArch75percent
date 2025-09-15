import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaSignOutAlt,
  FaHome,
  FaConciergeBell,
  FaBars,
  FaTimes,
  FaFileAlt,
  FaUserCircle,   // 👉 idinagdag ito
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

  const { schedules, fetchSchedules, addSchedule, cancelSchedule } =
    useContext(ScheduleContext);
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
      if (
        isMobile &&
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
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

 
  
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const { dateFrom, dateTo, timeFrom, timeTo, item, quantity } = form;
    if (!dateFrom || !dateTo || !timeFrom || !timeTo || !item) {
      return alert("Please fill out all fields!");
    }

    const newSchedule = {
      dateFrom,
      dateTo,
      timeFrom,
      timeTo,
      item,
      quantity: parseInt(quantity),
      status: "Pending",
    };

    try {
      await addSchedule(newSchedule);
      
      setForm({
        dateFrom: "",
        dateTo: "",
        timeFrom: "",
        timeTo: "",
        item: "",
        quantity: 1,
      });
      navigate("/resident/youraccount");
    } catch {
      alert("Failed to submit schedule.");
    }
  };

  return (
    <div
      style={{
        fontFamily: '"Lexend", sans-serif',
        width: "100%",
        minHeight: "100%",
      }}
    >
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
          <div
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ cursor: "pointer", marginRight: "10px" }}
          >
            {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </div>
        )}
        <h1
          style={{
            margin: 0,
            fontSize: isMobile ? "16px" : "clamp(18px, 2vw, 28px)",
            fontWeight: "bold",
          }}
        >
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
                        backgroundColor: "#A43259", // match ResidentDashboard
                        color: "white",
                        transition: "left 0.3s ease",
                        zIndex: 1000,
                        padding: "20px 10px",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* Your Account box */}
                      <div
                        style={{
                          textAlign: "center",
                          marginBottom: "20px",
                          padding: "10px",
                          backgroundColor: "#f9f9f9",
                          borderRadius: "8px",
                          color: "black",
                          cursor: "pointer",
                          transition: "transform 0.3s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        onClick={() => navigate("/resident/youraccount")}
                      >
                        <FaUserCircle size={50} color="black" />
                        <p style={{ fontWeight: "bold", marginTop: "10px" }}>Your Account</p>
                       
                         
                        
                      </div>
                    
                      {/* Home */}
                      <div
                        style={{
                          ...menuStyle,
                          backgroundColor: "#F4BE2A", // same yellow as dashboard
                          color: "black",
                          borderRadius: "8px",
                          padding: "10px",
                          textAlign: "center",
                          marginBottom: "10px",
                          transition: "transform 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(10px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
                        onClick={() => navigate("/resident/dashboard")}
                      >
                        <FaHome style={{ marginRight: "5px" }} /> Home
                      </div>
                    
                      {/* Services */}
                      <div>
                        <div
                          style={{
                            ...menuStyle,
                            backgroundColor: "#F4BE2A", // yellow permanent
                            color: "black",
                            transition: "transform 0.3s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(10px)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
                          onClick={() => setServicesOpen(!servicesOpen)}
                        >
                          <FaConciergeBell style={iconStyle} /> Services
                        </div>
                    
                        {servicesOpen && (
                          <div
                            style={{
                              marginLeft: "15px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "5px",
                              marginTop: "5px",
                            }}
                          >
                            <div
                              style={{
                                ...submenuStyle,
                                backgroundColor: " #1E90FF", // blue permanent
                                color: "black",
                                transition: "transform 0.3s ease",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(10px)")}
                              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
                              onClick={() => navigate("/resident/request")}
                            >
                              <FaFileAlt style={iconStyle} /> Requests
                            </div>
                            <div
                              style={{
                                ...submenuStyle,
                                backgroundColor: "#26ff1eff",
                                color: "Black",
                                transition: "transform 0.3s ease",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(10px)")}
                              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
                              onClick={() => navigate("/resident/schedule")}
                            >
                              <FaCalendarAlt style={iconStyle} /> Schedule
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
                            transition: "transform 0.2s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(5px)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
                        >
                          <FaSignOutAlt style={iconStyle} /> Logout
                        </button>
                      </div>
                    </aside>
        

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            padding: isMobile ? "15px 10px" : "20px",
            overflowY: "auto",
            minHeight: "100vh",
          }}
        >
         {/* Schedule Form */}
<section style={formContainer}>
  <h2 style={{ color: "#28D69F", textAlign: "center", marginBottom: "20px" }}>
    Submit Schedule
  </h2>

  {/* Date Range */}
  <div style={{ display: "flex", gap: "30px", marginBottom: "20px" }}>
    <div style={{ flex: 1 }}>
      <label style={labelStyle}>Date From</label>
      <input
        type="date"
        name="dateFrom"
        value={form.dateFrom}
        onChange={handleChange}
        style={inputStyle}
      />
    </div>
    <div style={{ flex: 1 }}>
      <label style={labelStyle}>Date To</label>
      <input
        type="date"
        name="dateTo"
        value={form.dateTo}
        onChange={handleChange}
        style={inputStyle}
      />
    </div>
  </div>

  {/* Time Range */}
  <div style={{ display: "flex", gap: "30px", marginBottom: "15px" }}>
    <div style={{ flex: 1 }}>
      <label style={labelStyle}>Time From</label>
      <input
        type="time"
        name="timeFrom"
        value={form.timeFrom}
        onChange={handleChange}
        style={inputStyle}
      />
    </div>
    <div style={{ flex: 1 }}>
      <label style={labelStyle}>Time To</label>
      <input
        type="time"
        name="timeTo"
        value={form.timeTo}
        onChange={handleChange}
        style={inputStyle}
      />
    </div>
  </div>

  {/* Item */}
  <div style={{ marginBottom: "15px" }}>
    <label style={labelStyle}>Item</label>
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

  {/* Quantity */}
  <div style={{ marginBottom: "15px" }}>
    <label style={labelStyle}>Quantity</label>
    <input
      type="number"
      name="quantity"
      min="1"
      value={form.quantity}
      onChange={handleChange}
      style={inputStyle}
      placeholder="Quantity"
    />
  </div>

  <button onClick={handleSubmit} style={buttonStyle}>
    Submit Schedule
  </button>
</section>

        </main>
      </div>
    </div>
  );
}

// Styles
const menuStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
  padding: "10px",
  fontSize: "15px",
  borderRadius: "6px",
  marginBottom: "10px",
};
const submenuStyle = { ...menuStyle, fontSize: "13px", width: "90%", padding: "6px" };
const iconStyle = { fontSize: "16px" };
const tableCellStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "center",
};
const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  margin: "8px 0",
  borderRadius: "6px",
  border: "1px solid #ccc",
};
const buttonStyle = {
  width: "100%",
  padding: "10px",
  backgroundColor: "#28D69F",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};
const cancelBtnStyle = {
  backgroundColor: "#ff4d4f",
  color: "#fff",
  border: "none",
  padding: "5px 10px",
  borderRadius: "5px",
  cursor: "pointer",
};
const formContainer = {
  marginBottom: "30px",
  maxWidth: "400px",
  margin: "20px auto",
  padding: "20px",
  backgroundColor: "#fff",
  borderRadius: "10px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  
};
const labelStyle = {
  display: "block",
  marginBottom: "5px",
  fontWeight: "bold",
  fontSize: "14px",
  color: "#333",
};

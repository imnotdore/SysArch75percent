import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaSignOutAlt, FaHome, FaConciergeBell, FaBars, FaTimes, FaFileAlt, FaUserCircle } from "react-icons/fa";
import axios from "axios";
import { API_URL } from "../config";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Schedule.css";

export default function Schedule() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    dateFrom: "",
    dateTo: "",
    timeTo: "",
    item: "",
    quantity: 1,
    reason: "",
  });

  const [items, setItems] = useState([]);
  const [itemAvailability, setItemAvailability] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [maxAvailable, setMaxAvailable] = useState(1);
  const [availableTimes, setAvailableTimes] = useState([]);

  const formatDate = (date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date - tzOffset).toISOString().split("T")[0];
  };

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

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/items`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setItems(res.data);
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };
    fetchItems();
  }, []);

  // Fetch item availability when item changes
  useEffect(() => {
    if (!form.item) return setItemAvailability([]);

    const fetchAvailability = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/items/availability?item=${form.item}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setItemAvailability(res.data.dates || []);
        const maxQty = res.data.max_quantity || 1;
        setMaxAvailable(maxQty);

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const todayISO = formatDate(today);
        const tomorrowISO = formatDate(tomorrow);

        const todayAvailable = res.data.dates.find((d) => d.date === todayISO)?.available ?? maxQty;
        const tomorrowAvailable = res.data.dates.find((d) => d.date === tomorrowISO)?.available ?? maxQty;
        const minAvailable = Math.min(todayAvailable, tomorrowAvailable);

        setForm((prev) => ({
          ...prev,
          dateFrom: todayISO,
          dateTo: tomorrowISO,
          quantity: minAvailable > 0 ? 1 : 0,
        }));
        setSelectedDates([today, tomorrow]);
        setMaxAvailable(minAvailable);
        generateTimesForSelectedDate(today, minAvailable);
      } catch (err) {
        console.error("Error fetching availability:", err);
      }
    };

    fetchAvailability();
  }, [form.item]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const getDatesBetween = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const dates = [];
    while (s <= e) {
      dates.push(formatDate(s));
      s.setDate(s.getDate() + 1);
    }
    return dates;
  };

  const handleSelectDate = (date) => {
    const iso = formatDate(date);
    const dayAvailable = itemAvailability.find((a) => a.date === iso)?.available ?? 1;
    setSelectedDates([date]);
    setForm((prev) => ({ ...prev, dateFrom: iso, dateTo: iso, quantity: dayAvailable > 0 ? 1 : 0 }));
    setMaxAvailable(dayAvailable);
    generateTimesForSelectedDate(date, dayAvailable);
  };

  const generateTimesForSelectedDate = (date, availableStock) => {
    const today = new Date();
    const selected = new Date(date);
    const slots = [];
    const isToday = selected.toDateString() === today.toDateString();

    const periods = [
      { label: "Morning", start: 8, end: 12 },
      { label: "Afternoon", start: 13, end: 17 },
    ];

    periods.forEach((p) => {
      for (let h = p.start; h <= p.end; h++) {
        if (isToday && h <= today.getHours()) continue;
        if (availableStock < form.quantity) continue;
        const displayHour = h <= 12 ? h : h - 12;
        const ampm = h < 12 ? "AM" : "PM";
        slots.push(`${displayHour}:00 ${ampm}`);
      }
    });

    setAvailableTimes(slots);
    setForm((prev) => ({ ...prev, timeTo: slots[0] || "" }));
  };

  const handleSubmit = async () => {
    const { dateFrom, dateTo, timeTo, item, quantity, reason } = form;
    if (!dateFrom || !dateTo || !timeTo || !item) return alert("⚠️ Please fill out all fields!");

    const datesToBook = getDatesBetween(dateFrom, dateTo);
    const insufficient = datesToBook.some((date) => {
      const day = itemAvailability.find((a) => a.date === date);
      return !day || day.available < quantity;
    });
    if (insufficient) return alert("⚠️ Not enough items available for selected dates");

    try {
      await axios.post(
        `${API_URL}/api/schedules`,
        { date_from: dateFrom, date_to: dateTo, time_from: "08:00", time_to: timeTo, item, quantity, reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("✅ Booking request submitted!");
      setSelectedDates([]);
      setForm({ dateFrom: "", dateTo: "", timeTo: "", item: "", quantity: 1, reason: "" });
      navigate("/resident/youraccount");
    } catch (err) {
      alert(err.response?.data?.error || "❌ Failed to submit booking");
    }
  };

  return (
    <div style={{ fontFamily: '"Lexend", sans-serif', width: "100%", minHeight: "100%" }}>
      <header style={{ backgroundColor: "#F4BE2A", color: "black", padding: "15px 20px", display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 999 }}>
        {isMobile && <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: "pointer", marginRight: "10px" }}>{sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}</div>}
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>MY SCHEDULE</h1>
      </header>

      <div style={{ display: "flex", position: "relative" }}>
        {/* Sidebar */}
        <aside ref={sidebarRef} style={{ position: isMobile ? "fixed" : "relative", top: 0, left: sidebarOpen || !isMobile ? 0 : "-240px", height: "100vh", width: "220px", backgroundColor: "#A43259", color: "white", transition: "left 0.3s ease", zIndex: 1000, padding: "20px 10px", display: "flex", flexDirection: "column" }}>
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
                <div onClick={() => navigate("/resident/request")} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "6px", fontSize: "13px", borderRadius: "6px", backgroundColor: "#1E90FF", color: "white" }}>
                  <FaFileAlt /> Requests
                </div>
                <div onClick={() => navigate("/resident/schedule")} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "6px", fontSize: "13px", borderRadius: "6px", backgroundColor: "#26ff1e", color: "black" }}>
                  <FaCalendarAlt /> Schedule
                </div>
              </div>
            )}
          </div>
          <div style={{ marginTop: "auto", paddingTop: "20px" }}>
            <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ff0000", color: "white", width: "100%", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: "20px", overflowY: "auto", minHeight: "100vh" }}>
          <section style={{ marginBottom: "30px", maxWidth: "600px", margin: "20px auto", padding: "20px", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            <h2 style={{ color: "#28D69F", textAlign: "center", marginBottom: "20px" }}>Submit Schedule</h2>

            {/* Item */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Item</label>
              <select value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc" }}>
                <option value="">-- Select Item --</option>
                {items.map((i) => (
                  <option key={i.id} value={i.item_name} disabled={i.available <= 0}>
                    {i.item_name} {i.available <= 0 ? "(Fully booked)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Calendar */}
            {form.item && (
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Select Date Range</label>
                <Calendar
                  minDate={new Date()}
                  value={selectedDates}
                  tileDisabled={({ date }) => {
                    const iso = formatDate(date);
                    const day = itemAvailability.find((a) => a.date === iso);
                    return !day || day.available <= 0;
                  }}
                  tileClassName={({ date }) => {
                    const iso = formatDate(date);
                    const day = itemAvailability.find((a) => a.date === iso);
                    if (!day || day.available <= 0) return "fully-booked";
                    if (selectedDates.some((d) => formatDate(d) === iso)) return "selected-range";
                    return "available";
                  }}
                  tileContent={({ date }) => {
                    const iso = formatDate(date);
                    const day = itemAvailability.find((a) => a.date === iso);
                    if (day && day.available > 0) return <p style={{ fontSize: "10px", color: "green" }}>{day.available} left</p>;
                    if (!day || day.available <= 0) return <p style={{ fontSize: "10px", color: "red" }}>Fully booked</p>;
                    return null;
                  }}
                  onClickDay={handleSelectDate}
                />
                {selectedDates.length > 0 && <p style={{ marginTop: "5px" }}>Selected Dates: <strong>{selectedDates.map((d) => formatDate(d)).join(", ")}</strong></p>}
              </div>
            )}

            {/* Time */}
            {selectedDates.length > 0 && (
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontWeight: "bold" }}>Select Time</label>
                <select value={form.timeTo} onChange={(e) => setForm({ ...form, timeTo: e.target.value })} style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc" }}>
                  {availableTimes.length === 0 && <option disabled>No slots available</option>}
                  {availableTimes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Reason */}
            {selectedDates.length > 0 && (
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontWeight: "bold" }}>Reason for Borrowing</label>
                <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc" }} placeholder="Enter your reason..." />
              </div>
            )}

            {/* Quantity */}
            {selectedDates.length > 0 && (
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontWeight: "bold" }}>Quantity</label>
                <input type="number" min="1" max={maxAvailable} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc" }} />
              </div>
            )}

            {/* Submit */}
            {selectedDates.length > 0 && (
              <button onClick={handleSubmit} style={{ width: "100%", padding: "10px", backgroundColor: "#28D69F", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                Submit Schedule
              </button>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

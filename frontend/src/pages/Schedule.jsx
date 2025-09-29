// src/pages/resident/Schedule.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaSignOutAlt,
  FaHome,
  FaConciergeBell,
  FaBars,
  FaTimes,
  FaFileAlt,
  FaUserCircle,
} from "react-icons/fa";
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
  });

  const [items, setItems] = useState([]);
  const [itemAvailability, setItemAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [maxAvailable, setMaxAvailable] = useState(1);

  // Helper: format date as YYYY-MM-DD
  const formatDate = (date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date - tzOffset).toISOString().split("T")[0];
  };

  /** 📱 Responsive check */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /** 🟣 Close sidebar when clicking outside (mobile only) */
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  /** 📦 Fetch all items */
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

  /** 📅 Fetch availability when item changes */
  useEffect(() => {
    if (!form.item) {
      setItemAvailability([]);
      setSelectedDate(null);
      setMaxAvailable(1);
      return;
    }

    const fetchAvailability = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/items/availability?item=${form.item}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        const availability = res.data.dates || [];
        setItemAvailability(availability);
        setSelectedDate(null);
        setForm((prev) => ({
          ...prev,
          dateFrom: "",
          dateTo: "",
          quantity: 1,
        }));
      } catch (err) {
        console.error("Error fetching availability:", err);
      }
    };

    fetchAvailability();
  }, [form.item]);

  /** 🚪 Logout */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  /** ✅ Submit Schedule */
  const handleSubmit = async () => {
    const { dateFrom, timeTo, item, quantity } = form;
    if (!dateFrom || !timeTo || !item)
      return alert("⚠️ Please fill out all fields!");
    if (quantity > maxAvailable)
      return alert(`⚠️ Only ${maxAvailable} item(s) available on this date.`);

    try {
      await axios.post(
        `${API_URL}/api/schedules`,
        {
          date_from: dateFrom,
          date_to: dateFrom,
          time_from: "00:00",
          time_to: timeTo,
          item,
          quantity,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("✅ Booking request submitted!");
      navigate("/resident/youraccount");
    } catch (err) {
      console.error("Error submitting booking:", err);
      alert("❌ Failed to submit booking");
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
          <div
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ cursor: "pointer", marginRight: "10px" }}
          >
            {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </div>
        )}
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>MY SCHEDULE</h1>
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
          {/* Sidebar Content */}
          <div
            onClick={() => navigate("/resident/youraccount")}
            style={{
              textAlign: "center",
              marginBottom: "20px",
              padding: "10px",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              color: "black",
              cursor: "pointer",
            }}
          >
            <FaUserCircle size={50} color="black" />
            <p style={{ fontWeight: "bold", marginTop: "10px" }}>Your Account</p>
          </div>

          <div
            onClick={() => navigate("/resident/dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              padding: "10px",
              fontSize: "15px",
              borderRadius: "6px",
              marginBottom: "10px",
              backgroundColor: "#F4BE2A",
              color: "black",
            }}
          >
            <FaHome /> Home
          </div>

          {/* Services */}
          <div>
            <div
              onClick={() => setServicesOpen(!servicesOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                padding: "10px",
                fontSize: "15px",
                borderRadius: "6px",
                marginBottom: "10px",
                backgroundColor: "#F4BE2A",
                color: "black",
              }}
            >
              <FaConciergeBell /> Services
            </div>

            {servicesOpen && (
              <div
                style={{
                  marginLeft: "15px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <div
                  onClick={() => navigate("/resident/request")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    padding: "6px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    backgroundColor: "#1E90FF",
                    color: "white",
                  }}
                >
                  <FaFileAlt /> Requests
                </div>
                <div
                  onClick={() => navigate("/resident/schedule")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    padding: "6px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    backgroundColor: "#26ff1e",
                    color: "black",
                  }}
                >
                  <FaCalendarAlt /> Schedule
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <div style={{ marginTop: "auto", paddingTop: "20px" }}>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#ff0000",
                color: "white",
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
            minHeight: "100vh",
          }}
        >
          <section
            style={{
              marginBottom: "30px",
              maxWidth: "600px",
              margin: "20px auto",
              padding: "20px",
              backgroundColor: "#fff",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ color: "#28D69F", textAlign: "center", marginBottom: "20px" }}>
              Submit Schedule
            </h2>

            {/* Item */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Item
              </label>
              <select
                value={form.item}
                onChange={(e) => setForm({ ...form, item: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc" }}
              >
                <option value="">-- Select Item --</option>
                {items.map((i) => (
                  <option key={i.id} value={i.item_name}>
                    {i.item_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Calendar */}
            {form.item && (
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Select Date
                </label>
                <Calendar
                  minDate={new Date()}
                  tileDisabled={({ date }) => {
                    const iso = formatDate(date);
                    const day = itemAvailability.find((a) => a.date === iso);
                    return !day || day.available <= 0;
                  }}
                  tileClassName={({ date }) => {
                    const iso = formatDate(date);
                    const day = itemAvailability.find((a) => a.date === iso);
                    if (!day) return "fully-booked"; // red default
                    if (day.available <= 0) return "fully-booked"; // red
                    return "available"; // green
                  }}
                  tileContent={({ date }) => {
                    const iso = formatDate(date);
                    const day = itemAvailability.find((a) => a.date === iso);
                    if (day && day.available > 0) {
                      return (
                        <p style={{ fontSize: "10px", color: "green", marginTop: "2px" }}>
                          {day.available} left
                        </p>
                      );
                    }
                    return null;
                  }}
                  onClickDay={(date) => {
                    const iso = formatDate(date);
                    const day = itemAvailability.find((a) => a.date === iso);
                    if (day && day.available > 0) {
                      setForm((prev) => ({
                        ...prev,
                        dateFrom: iso,
                        dateTo: iso,
                        quantity: 1,
                      }));
                      setMaxAvailable(day.available);
                      setSelectedDate(iso);
                    }
                  }}
                />

                {selectedDate && (
                  <p style={{ marginTop: "5px" }}>
                    Selected Date: <strong>{selectedDate}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Time To */}
            {selectedDate && (
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontWeight: "bold" }}>Time To</label>
                <input
                  type="time"
                  name="timeTo"
                  value={form.timeTo}
                  onChange={(e) => setForm({ ...form, timeTo: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            )}

            {/* Quantity */}
            {selectedDate && (
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontWeight: "bold" }}>Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={maxAvailable}
                  name="quantity"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            )}

            {/* Submit */}
            {selectedDate && (
              <button
                onClick={handleSubmit}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#28D69F",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Submit Schedule
              </button>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

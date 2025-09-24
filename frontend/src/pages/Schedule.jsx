// src/pages/resident/Schedule.jsx
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
  FaUserCircle,
} from "react-icons/fa";

import { ScheduleContext } from "../context/ScheduleContext";
import { API_URL } from "../config";

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

  const { addSchedule } = useContext(ScheduleContext);

  // NEW states
  const [items, setItems] = useState([]);
  const [itemAvailability, setItemAvailability] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);

  // detect mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // close sidebar on outside click
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

  // fetch items once
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_URL}/api/items`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load items");
        const data = await res.json();
        setItems(data || []);
      } catch (err) {
        console.error("Failed to fetch items", err);
      }
    };
    fetchItems();
  }, []);

  // fetch availability when item + dates change
  useEffect(() => {
    const fetchAvail = async () => {
      setAvailabilityError(null);
      setItemAvailability([]);
      if (!form.item || !form.dateFrom || !form.dateTo) return;
      if (new Date(form.dateTo) < new Date(form.dateFrom)) {
        setAvailabilityError("Date To cannot be before Date From");
        return;
      }
      setCheckingAvailability(true);
      try {
        const token = localStorage.getItem("token");
        const qs = `item=${encodeURIComponent(
          form.item
        )}&dateFrom=${form.dateFrom}&dateTo=${form.dateTo}`;
        const res = await fetch(`${API_URL}/api/items/availability?${qs}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Failed" }));
          throw new Error(err.error || "Failed to fetch availability");
        }
        const data = await res.json();
        setItemAvailability(data.dates || []);
      } catch (err) {
        console.error("Availability fetch error:", err);
        setAvailabilityError(err.message || "Failed to fetch availability");
      } finally {
        setCheckingAvailability(false);
      }
    };
    fetchAvail();
  }, [form.item, form.dateFrom, form.dateTo]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const { dateFrom, dateTo, timeFrom, timeTo, item, quantity } = form;

    if (!dateFrom || !dateTo || !timeFrom || !timeTo || !item) {
      return alert("Please fill out all fields!");
    }
    if (new Date(dateTo) < new Date(dateFrom))
      return alert("Date To cannot be before Date From");

    const qty = parseInt(quantity) || 1;

    // client-side availability check
    if (itemAvailability && itemAvailability.length) {
      const blocked = itemAvailability.filter((a) => a.available < qty);
      if (blocked.length) {
        const msgs = blocked
          .map((b) => `${b.date_needed} (available: ${b.available})`)
          .join(", ");
        return alert(
          `Not enough units on: ${msgs}. Reduce quantity or pick other dates.`
        );
      }
    }

    const payload = {
      dateFrom,
      dateTo,
      timeFrom,
      timeTo,
      item,
      quantity: qty,
    };
    try {
      await addSchedule(payload);
      setForm({
        dateFrom: "",
        dateTo: "",
        timeFrom: "",
        timeTo: "",
        item: "",
        quantity: 1,
      });
      navigate("/resident/youraccount");
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      alert(
        err.response?.data?.error ||
          err.message ||
          "Failed to submit schedule."
      );
    }
  };

  const today = new Date().toISOString().split("T")[0];

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
            backgroundColor: "#A43259",
            color: "white",
            transition: "left 0.3s ease",
            zIndex: 1000,
            padding: "20px 10px",
            display: "flex",
            flexDirection: "column",
          }}
        >
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
            <p style={{ fontWeight: "bold", marginTop: "10px" }}>
              Your Account
            </p>
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
            <FaHome style={{ fontSize: "16px" }} /> Home
          </div>

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
              <FaConciergeBell style={{ fontSize: "16px" }} /> Services
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
                  <FaFileAlt style={{ fontSize: "16px" }} /> Requests
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
                    backgroundColor: "#26ff1eff",
                    color: "black",
                  }}
                >
                  <FaCalendarAlt style={{ fontSize: "16px" }} /> Schedule
                </div>
              </div>
            )}
          </div>

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
              <FaSignOutAlt style={{ fontSize: "16px" }} /> Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main
          style={{
            flex: 1,
            padding: isMobile ? "15px 10px" : "20px",
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
            <h2
              style={{
                color: "#28D69F",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              Submit Schedule
            </h2>

            {/* Date Range */}
            <div style={{ display: "flex", gap: "30px", marginBottom: "15px" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  Date From
                </label>
                <input
                  type="date"
                  name="dateFrom"
                  value={form.dateFrom}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    margin: "8px 0",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                  min={today}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  Date To
                </label>
                <input
                  type="date"
                  name="dateTo"
                  value={form.dateTo}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    margin: "8px 0",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                  min={form.dateFrom || today}
                />
              </div>
            </div>

            {/* Time Range */}
            <div style={{ display: "flex", gap: "30px", marginBottom: "15px" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  Time From
                </label>
                <input
                  type="time"
                  name="timeFrom"
                  value={form.timeFrom}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    margin: "8px 0",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  Time To
                </label>
                <input
                  type="time"
                  name="timeTo"
                  value={form.timeTo}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    margin: "8px 0",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            </div>

            {/* Item */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Item
              </label>
              <select
                name="item"
                value={form.item}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  margin: "8px 0",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">-- Select Item --</option>
                {items.map((i) => (
                  <option key={i.id} value={i.item_name}>
                    {i.item_name}
                    {i.max_quantity ? ` (total ${i.max_quantity})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  margin: "8px 0",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
                placeholder="Quantity"
              />
            </div>

            {/* availability */}
            {checkingAvailability ? (
              <p>Checking availability…</p>
            ) : availabilityError ? (
              <p style={{ color: "red" }}>{availabilityError}</p>
            ) : itemAvailability.length > 0 ? (
              <div style={{ marginBottom: "10px" }}>
                <strong>Availability for {form.item}:</strong>
                <ul>
                  {itemAvailability.map((a) => (
                    <li key={a.date_needed}>
                      {a.date_needed}:{" "}
                      {a.available > 0
                        ? `${a.available} available`
                        : "FULLY BOOKED"}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

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
          </section>
        </main>
      </div>
    </div>
  );
}

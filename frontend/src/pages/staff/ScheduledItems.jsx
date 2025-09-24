// src/pages/staff/ScheduledItems.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUserCircle,
  FaCalendarAlt,
  FaSignOutAlt,
  FaInbox,
  FaCheckCircle,
  FaBullhorn,
} from "react-icons/fa";
import { API_URL } from "../../config";
import "./StaffDashboard.css"; // reuse dashboard CSS

export default function ScheduledItems() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [schedules, setSchedules] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("username");

  const axiosAuth = axios.create({
    baseURL: API_URL || "http://localhost:3000",
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fetch availability
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/schedules/availability`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch availability");
        const data = await res.json();
        setAvailability(data.dates || []);
      } catch (err) {
        console.error("Error fetching availability:", err);
      }
    };

    fetchAvailability();
  }, []);

  // Redirect if no token
  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await axiosAuth.get("/api/staff/accepted-schedules");
      const processed = Array.isArray(res.data)
        ? res.data
            .filter((s) => s.status === "Approved")
            .map((s, idx) => ({
              ...s,
              id: s.id || s.schedule_id || idx,
              resident_username: s.resident_username || `Resident#${s.user_id}`,
              staff_username: s.staff_username || `Staff#${s.approved_by}`,
              approved_at: s.approved_at ? new Date(s.approved_at) : null,
            }))
        : [];
      setSchedules(processed);
    } catch (err) {
      console.error(
        "Error fetching schedules:",
        err.response?.data || err.message
      );
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar when clicking outside
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("staffId");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        {isMobile && (
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
        )}
        <div className="staff-info">
          <FaUserCircle size={40} />
          {username && <span className="staff-name">Staff: {username}</span>}
        </div>
        <h1 className="dashboard-title">Scheduled Items</h1>
        <div style={{ width: "34px" }} />
      </header>

      {/* Layout */}
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className={`sidebar ${sidebarOpen || !isMobile ? "open" : ""}`}
        >
          <div className="sidebar-header">
            <FaUserCircle size={50} color="black" />
            <p>{username || "Staff Account"}</p>
          </div>

          <div className="menu-item" onClick={() => navigate("/staff/dashboard")}>
            <FaInbox /> Inbox
          </div>
          <div className="menu-item" onClick={() => navigate("/staff/accepted")}>
            <FaCheckCircle /> Accepted List
          </div>
          <div className="menu-item active">
            <FaCalendarAlt /> Scheduled Items
          </div>
          <div
            className="menu-item"
            onClick={() => navigate("/staff/announcements")}
          >
            <FaBullhorn /> Announcements
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </aside>

        {/* Main */}
        <main className="dashboard-main">
          <h2>Item Availability</h2>
          {availability.length === 0 ? (
            <p>No availability data.</p>
          ) : (
            <div className="availability-list">
              {availability.map((a) => (
                <div key={a.date_needed}>
                  <span>{a.date_needed}</span> →{" "}
                  {a.isFull ? (
                    <span className="text-red-500 font-bold">FULLY BOOKED</span>
                  ) : (
                    <span className="text-green-600">Available</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <h2>Approved Schedules</h2>
          {loading ? (
            <p>Loading schedules...</p>
          ) : schedules.length === 0 ? (
            <p>No scheduled items found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Approved By</th>
                  <th>Date Approved</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={`schedule-${s.id}`}>
                    <td>{s.resident_username}</td>
                    <td>{s.item}</td>
                    <td>{s.quantity}</td>
                    <td>{s.staff_username}</td>
                    <td>
                      {s.approved_at
                        ? s.approved_at.toLocaleString("en-PH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div>🌿 Barangay Logo</div>
        <div>📞 0917-123-4567</div>
      </footer>
    </div>
  );
}

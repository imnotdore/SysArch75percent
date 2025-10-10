// src/pages/resident/RequestPage.jsx
import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileAlt,
  FaSignOutAlt,
  FaHome,
  FaCalendarAlt,
  FaConciergeBell,
  FaBars,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Request.css";
import { FileContext } from "../context/Filecontext";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function RequestPage() {
  const { fetchFiles: fetchContextFiles } = useContext(FileContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const MAX_PAGES_PER_FILE = 30;
  const today = new Date();

  const [selectedFile, setSelectedFile] = useState(null);
  const [dateNeeded, setDateNeeded] = useState(null);
  const [pageLimit, setPageLimit] = useState(0);
  const [purpose, setPurpose] = useState("");
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [limits, setLimits] = useState({ resident: 10, global: 100 });
  const [showConfirm, setShowConfirm] = useState(false); // ✅ modal

  // --- utils ---
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // --- fetch availability ---
  const fetchAvailability = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      const { data } = await axios.get(`${API_URL}/api/files/availability`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLimits(data.limits || { resident: 10, global: 100 });
      setUnavailableDates(
        data.dates.map((d) => ({
          date: new Date(d.date_needed),
          totalPages: d.totalPages,
          residentPages: d.residentPages,
        }))
      );
    } catch (err) {
      console.error("Error fetching availability:", err);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- file change ---
  // --- file change ---
const handleFileChange = async (e) => {
  const file = e.target.files[0];
  setSelectedFile(file);

  if (file && (file.type === "application/pdf" || file.type.includes("word"))) {
    if (file.type === "application/pdf") {
      try {
        const pdfData = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        setPageLimit(pdf.numPages);

        if (pdf.numPages > MAX_PAGES_PER_FILE) {
          alert(`❌ Max ${MAX_PAGES_PER_FILE} pages allowed.`);
          setSelectedFile(null);
          setPageLimit(0);
        }
      } catch {
        alert("Failed to read file.");
        setPageLimit(0);
      }
    } else {
      // ✅ DOC/DOCX fallback
      const userPages = prompt("Enter number of pages for this Word document:");
      const num = parseInt(userPages);

      if (!num || num <= 0) {
        alert("❌ Invalid page count.");
        setSelectedFile(null);
        setPageLimit(0);
        return;
      }

      if (num > MAX_PAGES_PER_FILE) {
        alert(`❌ Max ${MAX_PAGES_PER_FILE} pages allowed.`);
        setSelectedFile(null);
        setPageLimit(0);
        return;
      }

      setPageLimit(num);
    }
  } else {
    alert("❌ Only PDF or Word files are accepted.");
    setPageLimit(0);
    setSelectedFile(null);
  }
};

  // --- upload ---
  const confirmUpload = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("dateNeeded", formatDate(dateNeeded));
      formData.append("pageCount", pageLimit.toString());
      formData.append("purpose", purpose);

      await axios.post(`${API_URL}/api/files/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Upload successful!");
      setSelectedFile(null);
      setDateNeeded(null);
      setPageLimit(0);
      setPurpose("");
      fetchContextFiles();
      fetchAvailability();
      navigate("/resident/youraccount");
    } catch (err) {
      alert(`❌ Upload failed: ${err.response?.data?.error || "Server error"}`);
    } finally {
      setShowConfirm(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const isUploadDisabled = !purpose || !selectedFile || !dateNeeded;

  return (
    <div className="request-page">
      {/* Header */}
      <header className="header">
        {isMobile && (
          <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: "pointer", marginRight: 10 }}>
            {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </div>
        )}
        <h1>REQUEST PRINTING</h1>
      </header>

      <div className="main-layout">
        {/* Sidebar */}
        <aside className="sidebar" ref={sidebarRef} style={{ left: sidebarOpen || !isMobile ? 0 : "-240px" }}>
          <div className="account-box" onClick={() => navigate("/resident/youraccount")}>
            <FaUserCircle size={50} color="black" />
            <p>Your Account</p>
          </div>

          <div className="menu-item" style={{ background: "#F4BE2A", color: "#000" }} onClick={() => navigate("/resident/dashboard")}>
            <FaHome /> Home
          </div>

          <div>
            <div
              className="menu-item"
              style={{ background: "#F4BE2A", color: "#000" }}
              onClick={() => setServicesOpen(!servicesOpen)}
            >
              <FaConciergeBell /> Services
            </div>
            {servicesOpen && (
              <div style={{ marginLeft: 15 }}>
                <div
                  className="submenu-item"
                  style={{ background: "#1E90FF", color: "#fff", borderRadius: "6px", marginBottom: "5px" }}
                  onClick={() => navigate("/resident/request")}
                >
                  <FaFileAlt /> Requests
                </div>
                <div
                  className="submenu-item"
                  style={{ background: "#26ff1e", color: "#000", borderRadius: "6px" }}
                  onClick={() => navigate("/resident/schedule")}
                >
                  <FaCalendarAlt /> Schedule
                </div>
              </div>
            )}
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </aside>

        {/* Main Card */}
        <main style={{ flex: 1, padding: "20px" }}>
          <section className="main-card">
            <h2>Libreng Print para sa kabarangay ng Sto. Domingo</h2>

            <ul style={{ fontSize: "14px", marginBottom: "20px" }}>
              <li>✅ PDF and Word files only</li>
              <li>✅ Max {MAX_PAGES_PER_FILE} pages per file</li>
              <li>✅ Purpose must be school or work related</li>
              <li>⚠ Claiming requires plastic bottles</li>
            </ul>

            <label>Purpose</label>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)} style={{ width: "100%", marginBottom: "15px" }}>
              <option value="">-- Select Purpose --</option>
              <option value="School Purposes">School Purposes</option>
              <option value="Barangay Requirement">Barangay Requirement</option>
              <option value="Job Application">Job Application</option>
            </select>

            <label>Date Needed</label>
            <DatePicker
              selected={dateNeeded}
              onChange={setDateNeeded}
              minDate={today}
              placeholderText="Select a date"
              dateFormat="yyyy-MM-dd"
            />

            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ marginTop: 15 }} />
            {selectedFile && (
              <p>
                <strong>{selectedFile.name}</strong> {pageLimit > 0 && `📄 Pages: ${pageLimit}`}
              </p>
            )}

            <button
              className={`upload-btn ${isUploadDisabled ? "disabled" : ""}`}
              onClick={() => setShowConfirm(true)}
              disabled={isUploadDisabled}
            >
              Upload
            </button>
          </section>
        </main>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <h3>Confirm Your Request</h3>
            <p>📌 Purpose: {purpose}</p>
            <p>📄 File: {selectedFile?.name} ({pageLimit} pages)</p>
            <p>📅 Date Needed: {dateNeeded ? formatDate(dateNeeded) : "Not set"}</p>
            <p>⚠ Reminder: Bring plastic bottles to claim your print.</p>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
              <button onClick={confirmUpload}>Confirm</button>
              <button style={{ backgroundColor: "#ccc", color: "#000" }} onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

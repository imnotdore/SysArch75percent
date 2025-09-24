import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

import { FileContext } from "../context/Filecontext";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Request.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function RequestPage() {
  const { fetchFiles: fetchContextFiles } = useContext(FileContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dateNeeded, setDateNeeded] = useState(null);
  const [pageLimit, setPageLimit] = useState(0);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [limits, setLimits] = useState({ resident: 10, global: 100 });
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const MAX_PAGES_PER_FILE = 20;
  const today = new Date();

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchAvailability = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      const { data } = await axios.get(`${API_URL}/api/files/availability`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLimits(data.limits || { resident: 10, global: 100 });

      const unavailable = data.dates.map((d) => ({
        date: new Date(d.date_needed),
        totalPages: d.totalPages,
        residentPages: d.residentPages,
        residentFull: d.residentPages >= (data.limits.resident || 10),
        globalFull: d.totalPages >= (data.limits.global || 100),
      }));

      setUnavailableDates(unavailable);
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

  const uploadedPagesForDate = () => {
    if (!dateNeeded) return 0;
    const dayInfo = unavailableDates.find((d) => isSameDay(d.date, dateNeeded));
    return dayInfo?.residentPages || 0;
  };

  const remainingResidentPages = () => Math.max(limits.resident - uploadedPagesForDate(), 0);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file && file.type === "application/pdf") {
      try {
        const pdfData = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        setPageLimit(pdf.numPages);

        if (pdf.numPages > MAX_PAGES_PER_FILE) {
          alert(`❌ Maximum ${MAX_PAGES_PER_FILE} pages allowed per file. Your file has ${pdf.numPages} pages.`);
          setSelectedFile(null);
          setPageLimit(0);
          return;
        }

        if (pdf.numPages > remainingResidentPages()) {
          alert(`❌ You can only upload ${remainingResidentPages()} more pages for ${formatDate(dateNeeded)}.`);
          setSelectedFile(null);
          setPageLimit(0);
          return;
        }
      } catch (err) {
        console.error(err);
        alert("Failed to read PDF file.");
        setPageLimit(0);
      }
    } else {
      setPageLimit(0);
    }
  };

  const handleUpload = async () => {
    try {
      if (!selectedFile) return alert("Please select a file");
      if (!dateNeeded) return alert("Please select a date");
      if (pageLimit > MAX_PAGES_PER_FILE) return alert(`File exceeds ${MAX_PAGES_PER_FILE}-page limit`);
      if (pageLimit > remainingResidentPages()) return alert(`❌ You can only upload ${remainingResidentPages()} pages for ${formatDate(dateNeeded)}.`);

      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("dateNeeded", formatDate(dateNeeded));
      formData.append("pageCount", pageLimit.toString());

      await axios.post(`${API_URL}/api/files/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Upload successful!");
      setSelectedFile(null);
      setDateNeeded(null);
      setPageLimit(0);
      fetchContextFiles();
      fetchAvailability();
      navigate("/resident/youraccount");
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      alert(`❌ Upload failed: ${err.response?.data?.error || "Server error"}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const isUploadDisabled = !selectedFile || !dateNeeded || pageLimit > remainingResidentPages() || dateNeeded < today;
  const now = new Date();
  const isTodaySelected = dateNeeded && isSameDay(dateNeeded, now);
  const showTimeWarning = isTodaySelected && now.getHours() >= 22;

  const getSlotsLeft = (day) => {
    const dayInfo = unavailableDates.find((d) => isSameDay(d.date, day));
    const residentPages = dayInfo?.residentPages || 0;
    const totalPages = dayInfo?.totalPages || 0;
    const extraPages = day && dateNeeded && isSameDay(day, dateNeeded) ? pageLimit : 0;

    const residentUsed = residentPages + extraPages;
    const globalUsed = totalPages + extraPages;

    return {
      resident: Math.max(limits.resident - residentUsed, 0),
      totalPages: totalPages,
      fillRatio: residentUsed / limits.resident,
      isResidentFull: residentUsed >= limits.resident,
      isGlobalFull: globalUsed >= limits.global,
    };
  };

  const openModal = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  return (
    <div className="request-page">
      <header className="header">
        {isMobile && (
          <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: "pointer", marginRight: 10 }}>
            {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </div>
        )}
        <h1>UPLOAD REQUEST FILE</h1>
      </header>

      <div className="main-layout">
        <aside ref={sidebarRef} className="sidebar" style={{ left: sidebarOpen || !isMobile ? 0 : "-240px" }}>
          <div className="account-box" onClick={() => navigate("/resident/youraccount")}>
            <FaUserCircle size={50} color="#333" />
            <p>Your Account</p>
          </div>
          <div className="menu-item" onClick={() => navigate("/resident/dashboard")}>
            <FaHome /> Home
          </div>
          <div>
            <div className="menu-item" onClick={() => setServicesOpen(!servicesOpen)}>
              <FaConciergeBell /> Services
            </div>
            {servicesOpen && (
              <div style={{ marginLeft: 15, display: "flex", flexDirection: "column", gap: 5 }}>
                <div className="submenu-item" onClick={() => navigate("/resident/request")}>
                  <FaFileAlt /> Requests
                </div>
                <div className="submenu-item" onClick={() => navigate("/resident/schedule")}>
                  <FaCalendarAlt /> Schedule
                </div>
              </div>
            )}
          </div>
          <div style={{ marginTop: "auto", paddingTop: 20 }}>
            <button onClick={handleLogout} className="logout-btn">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </aside>

        <main style={{ flex: 1, padding: isMobile ? 15 : 30 }}>
          <div className="main-card">
            <h2>Upload File for Printing</h2>

            <label>When do you need it?</label>
            <DatePicker
              selected={dateNeeded}
              onChange={setDateNeeded}
              minDate={today}
              placeholderText="Select a date"
              dateFormat="yyyy-MM-dd"
              filterDate={(date) => {
                const slots = getSlotsLeft(date);
                if (date < today) return false;
                return !slots.isResidentFull && !slots.isGlobalFull;
              }}
              onSelect={(date) => {
                const slots = getSlotsLeft(date);
                if (slots.isGlobalFull || slots.isResidentFull) {
                  openModal("❌ Sorry, this date is fully booked. Please choose another date.");
                  return;
                }
                setDateNeeded(date);
              }}
              renderDayContents={(day, date) => {
                const slots = getSlotsLeft(date);
                let className = "available";
                if (slots.isGlobalFull || slots.isResidentFull) className = "fully-booked";
                else if (slots.fillRatio >= 0.5) className = "partially-booked";
                if (isSameDay(date, today)) className += " today";
                if (date < today) className = "past-date";

                return (
                  <div
                    title={`Pages to upload ${slots.resident} / ${limits.resident}`}
                    className={className}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                  >
                    <span className="day-number">{day}</span>
                    {!slots.isResidentFull && (
                      <span style={{ fontSize: 10, color: "#555" }}> </span>
                    )}
                  </div>
                );
              }}
            />

            {dateNeeded && (
              <p style={{ marginTop: 5 }}>
                You can upload up to <strong>{remainingResidentPages()}</strong> pages for {formatDate(dateNeeded)}.
              </p>
            )}

            {showTimeWarning && (
              <p style={{ color: "red", marginTop: 5 }}>
                ⚠ Cannot schedule for today after 10 PM. Please choose a future date.
              </p>
            )}

            <input type="file" accept=".pdf" onChange={handleFileChange} style={{ marginTop: 20 }} />
            {selectedFile && (
              <p>
                <strong>{selectedFile.name}</strong> {pageLimit > 0 && `📄 Pages: ${pageLimit}`}
              </p>
            )}

            <button
              onClick={handleUpload}
              disabled={isUploadDisabled || showTimeWarning}
              className={`upload-btn ${isUploadDisabled || showTimeWarning ? "disabled" : ""}`}
            >
              Upload
            </button>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="custom-modal-overlay" onClick={closeModal}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <p>{modalMessage}</p>
            <button onClick={closeModal}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUserCircle,
  FaFileAlt,
  FaInbox,
  FaBullhorn,
  FaCalendarAlt,
  FaCheckCircle,
  FaSignOutAlt,
  FaSearch,
} from "react-icons/fa";
import "./StaffDashboard.css";

export default function StaffDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const [returnedSchedules, setReturnedSchedules] = useState([]);
  const [releasedSchedules, setReleasedSchedules] = useState([]);
  const [username, setUsername] = useState("");
  const [staffId, setStaffId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [residents, setResidents] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);
  const [selectedResidentRequests, setSelectedResidentRequests] = useState({ files: [], schedules: [] });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [acceptedFiles, setAcceptedFiles] = useState([]);
  const [acceptedSchedules, setAcceptedSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState("inbox"); // inbox, accepted, scheduled, returned, released

  const token = localStorage.getItem("token");

  const axiosAuth = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    headers: { Authorization: `Bearer ${token}` },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/");
    const storedUsername = localStorage.getItem("username");
    const storedStaffId = localStorage.getItem("staffId");
    if (storedUsername) setUsername(storedUsername);
    if (storedStaffId) setStaffId(Number(storedStaffId));
  }, [navigate, token]);

  // Responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // Fetch residents with pending requests
  useEffect(() => {
    const fetchResidents = async () => {
      if (!token) return;
      try {
        const res = await axiosAuth.get("/api/staff/residents/pending");
        setResidents(res.data);
      } catch (err) {
        console.error("Error fetching residents:", err.response?.data || err.message);
      }
    };
    fetchResidents();
  }, [token]);

  // Fetch accepted requests (files & schedules)
  const fetchAcceptedRequests = async () => {
    try {
      const [filesRes, schedulesRes] = await Promise.all([
        axiosAuth.get("/api/staff/accepted"),
        axiosAuth.get("/api/staff/accepted-schedules"),
      ]);

      setAcceptedFiles(
        Array.isArray(filesRes.data)
          ? filesRes.data.map((f) => ({
              ...f,
              id: f.request_id,
              approved_at: f.approved_at ? new Date(f.approved_at) : null,
              staff_username: f.staff_username || `Staff#${f.approved_by}`,
            }))
          : []
      );

      setAcceptedSchedules(
        Array.isArray(schedulesRes.data)
          ? schedulesRes.data.map((s, idx) => ({
              ...s,
              id: s.id ?? s.schedule_id ?? idx,
              approved_at: s.approved_at ? new Date(s.approved_at) : null,
              staff_username: s.staff_username || `Staff#${s.approved_by}`,
            }))
          : []
      );
    } catch (err) {
      console.error("Error fetching accepted requests:", err.response?.data || err.message);
      setAcceptedFiles([]);
      setAcceptedSchedules([]);
    }
  };

  useEffect(() => {
    if (["accepted", "scheduled", "released"].includes(activeTab)) fetchAcceptedRequests();
    if (activeTab === "returned") fetchReturnedSchedules();
    if (activeTab === "released") fetchReleasedSchedules();
  }, [activeTab]);

  // Fetch returned schedules
  const fetchReturnedSchedules = async () => {
    try {
      const res = await axiosAuth.get("/api/staff/returned-schedules");
      setReturnedSchedules(
        Array.isArray(res.data)
          ? res.data.map((s, idx) => ({
              ...s,
              id: s.id ?? idx,
              returned_at: s.returned_at ? new Date(s.returned_at) : null,
              staff_username: s.staff_username || `Staff#${s.approved_by}`,
            }))
          : []
      );
    } catch (err) {
      console.error("Error fetching returned schedules:", err.response?.data || err.message);
      setReturnedSchedules([]);
    }
  };

  // Fetch released schedules
  const fetchReleasedSchedules = async () => {
    try {
      const res = await axiosAuth.get("/api/staff/released-schedules");
      setReleasedSchedules(
        Array.isArray(res.data)
          ? res.data.map((s, idx) => ({
              ...s,
              id: s.id ?? idx,
              released_at: s.released_at ? new Date(s.released_at) : null,
              released_by_username: s.released_by_username || `Staff#${s.released_by}`,
            }))
          : []
      );
    } catch (err) {
      console.error("Error fetching released schedules:", err.response?.data || err.message);
      setReleasedSchedules([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("staffId");
    navigate("/");
  };

  const updateInboxIfNoPending = (residentId, updatedFiles, updatedSchedules) => {
    const hasPending = updatedFiles.length > 0 || updatedSchedules.length > 0;
    if (!hasPending) {
      setResidents((prev) => prev.filter((r) => r.id !== residentId));
      setSelectedResident(null);
      setSelectedResidentRequests({ files: [], schedules: [] });
    } else {
      setSelectedResidentRequests({ files: updatedFiles, schedules: updatedSchedules });
    }
  };

  const handleFileStatusChange = async (fileId, status) => {
    if (!staffId || !selectedResident) return;
    try {
      const payload = { status };
      if (status.toLowerCase() === "approved") payload.approved_by = staffId;

      await axiosAuth.put(`/api/staff/files/${fileId}`, payload);

      const updatedFiles = selectedResidentRequests.files.filter((f) => f.id !== fileId);
      const updatedSchedules = selectedResidentRequests.schedules;

      updateInboxIfNoPending(selectedResident.id, updatedFiles, updatedSchedules);
      fetchAcceptedRequests();
      setSelectedFile(null);
    } catch (err) {
      console.error("Error updating file status:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to update file status");
    }
  };

  const handleScheduleStatusChange = async (scheduleId, status) => {
    if (!staffId || !selectedResident) return;
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    try {
      await axiosAuth.put(`/api/staff/schedules/${scheduleId}/status`, {
        status: normalizedStatus,
        approved_by: staffId,
      });

      const updatedSchedules = selectedResidentRequests.schedules.filter((s) => s.id !== scheduleId);
      const updatedFiles = selectedResidentRequests.files;

      updateInboxIfNoPending(selectedResident.id, updatedFiles, updatedSchedules);
      fetchAcceptedRequests();
      setSelectedSchedule(null);
    } catch (err) {
      console.error("Error updating schedule status:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to update schedule status");
    }
  };

  const handleReleaseSchedule = async (scheduleId) => {
    if (!staffId) return;
    try {
      await axiosAuth.put(`/api/staff/schedules/${scheduleId}/release`, { released_by: staffId });
      fetchAcceptedRequests();
      if (activeTab === "released") fetchReleasedSchedules();
    } catch (err) {
      console.error("Error releasing schedule:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to release schedule");
    }
  };

  const fetchResidentRequests = async (residentId) => {
    try {
      const [filesRes, schedulesRes] = await Promise.all([
        axiosAuth.get(`/api/staff/files/resident/${residentId}`),
        axiosAuth.get(`/api/staff/schedules/resident/${residentId}`),
      ]);

      setSelectedResidentRequests({
        files: Array.isArray(filesRes.data) ? filesRes.data.filter((f) => f.status !== "approved") : [],
        schedules: Array.isArray(schedulesRes.data) ? schedulesRes.data.filter((s) => s.status === "Pending") : [],
      });
    } catch (err) {
      console.error("Error fetching resident requests:", err.response?.data || err.message);
      setSelectedResidentRequests({ files: [], schedules: [] });
    }
  };

  const filteredResidents = residents.filter((r) =>
    (r.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        {isMobile && <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>}
        <div className="staff-info">
          <FaUserCircle size={40} />
          {username && <span className="staff-name">Staff: {username}</span>}
        </div>
        <h1 className="dashboard-title">Staff Dashboard</h1>
        <div style={{ width: "34px" }} />
      </header>

      {/* Layout */}
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside ref={sidebarRef} className={`sidebar ${sidebarOpen || !isMobile ? "open" : ""}`}>
          <div className="sidebar-header">
            <FaUserCircle size={50} color="black" />
            <p>{username || "Staff Account"}</p>
          </div>

          <div className={`menu-item ${activeTab === "inbox" ? "active" : ""}`} onClick={() => setActiveTab("inbox")}>
            <FaInbox /> Inbox
            {residents.some((r) => r.pending_count > 0) && (
              <span className="notification-badge">
                {residents.reduce((acc, r) => acc + r.pending_count, 0)}
              </span>
            )}
          </div>

          <div className={`menu-item ${activeTab === "accepted" ? "active" : ""}`} onClick={() => setActiveTab("accepted")}>
            <FaCheckCircle /> Accepted List
          </div>

          <div className={`menu-item ${activeTab === "scheduled" ? "active" : ""}`} onClick={() => setActiveTab("scheduled")}>
            <FaCalendarAlt /> Scheduled Items
          </div>

          <div className={`menu-item ${activeTab === "released" ? "active" : ""}`} onClick={() => setActiveTab("released")}>
            <FaCheckCircle /> Released Items
          </div>

          <div className={`menu-item ${activeTab === "returned" ? "active" : ""}`} onClick={() => setActiveTab("returned")}>
            <FaCheckCircle /> Returned Items
          </div>

          <div className="menu-item" onClick={() => navigate("/staff/announcements")}>
            <FaBullhorn /> Announcements
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </aside>

        {/* Main */}
        <main className="dashboard-main">
          {/* INBOX */}
          {activeTab === "inbox" && (
            <>
              <div className="search-bar">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search resident..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {!selectedResident ? (
  <section className="resident-list">
    <h2>Residents with Requests</h2>
    {filteredResidents.map((r) => (
      <div
        key={`resident-${r.id}`}
        className="resident-item"
        onClick={() => {
          setSelectedResident(r);
          fetchResidentRequests(r.id);
        }}
      >
        <span>{r.username || "Unnamed Resident"}</span>
        <span className="pending-count">{r.pending_count}</span>
      </div>
    ))}
  </section>
) : (
  <section className="resident-requests">
    <button
      className="back-btn"
      onClick={() => {
        setSelectedResident(null);
        setSelectedResidentRequests({ files: [], schedules: [] });
      }}
      style={{ marginBottom: "0.5rem" }} // optional spacing
    >
      ← Back
    </button>

    <h2>{selectedResident.username}'s Requests</h2>

    {/* FILES */}
    {selectedResidentRequests.files.length > 0 && (
      <div className="resident-files">
        <h3>File Requests</h3>
        {selectedResidentRequests.files.map((f) => (
          <div key={f.id} className="file-card">
            <div className="file-icon">
              <FaFileAlt size={28} color="#e37400" />
            </div>
            <div className="file-info" onClick={() => setSelectedFile(f)}>
              <h4 className="file-title">{f.filename}</h4>
              <p><strong>Pages:</strong> {f.page_count}</p>
              <p><strong>Date Needed:</strong> {new Date(f.date_needed).toLocaleDateString("en-PH")}</p>
              <p><strong>Uploaded:</strong> {new Date(f.created_at).toLocaleString("en-PH")}</p>
            </div>
            <div className={`file-status ${f.status.toLowerCase()}`}>
              {f.status}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* SCHEDULES */}
    {selectedResidentRequests.schedules.length > 0 && (
      <div className="resident-schedules">
        <h3>Schedule Requests</h3>
        {selectedResidentRequests.schedules.map((s) => (
          <div key={s.id} className="schedule-card" onClick={() => setSelectedSchedule(s)}>
            <div className="schedule-icon">
              <FaCalendarAlt size={28} color="#1a73e8" />
            </div>
            <div className="schedule-info">
              <h4 className="schedule-title">{s.item}</h4>
              <p><strong>Quantity:</strong> {s.quantity}</p>
              <p><strong>Date:</strong> {new Date(s.date_from).toLocaleString("en-PH")} → {new Date(s.date_to).toLocaleString("en-PH")}</p>
            </div>
            <div className={`schedule-status ${s.status.toLowerCase()}`}>
              {s.status}
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
)}

            </>
          )}

          {/* ACCEPTED LIST */}
          {activeTab === "accepted" && (
            <section className="accepted-list">
              <h2>Accepted Requests</h2>
              {(acceptedFiles.length === 0 && acceptedSchedules.length === 0) ? (
                <p>No accepted requests yet.</p>
              ) : (
                <>
                  <h3>Files</h3>
                  {acceptedFiles.length === 0 ? <p>No accepted files.</p> : (
                    <table>
                      <thead>
                        <tr>
                          <th>Resident</th>
                          <th>File Name</th>
                          <th>Approved By</th>
                          <th>Date Approved</th>
                        </tr>
                      </thead>
                      <tbody>
                        {acceptedFiles.map((f, idx) => (
                          <tr key={`accepted-file-${f.id ?? idx}`}>
                            <td>{f.resident_username || `Resident#${f.resident_id}`}</td>
                            <td>{f.filename}</td>
                            <td>{f.staff_username}</td>
                            <td>{f.approved_at?.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  <h3>Schedules</h3>
                  {acceptedSchedules.length === 0 ? <p>No accepted schedules.</p> : (
                    <table>
                      <thead>
                        <tr>
                          <th>Resident</th>
                          <th>Item</th>
                          <th>Quantity</th>
                          <th>Approved By</th>
                          <th>Date Approved</th>
                          <th>Release</th>
                        </tr>
                      </thead>
                      <tbody>
                        {acceptedSchedules.map((s, idx) => (
                          <tr key={`accepted-schedule-${s.id ?? idx}`}>
                            <td>{s.resident_username || `Resident#${s.user_id}`}</td>
                            <td>{s.item}</td>
                            <td>{s.quantity}</td>
                            <td>{s.staff_username}</td>
                            <td>{s.approved_at?.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) || "N/A"}</td>
                            <td>
                              <button className="btn-blue" onClick={() => handleReleaseSchedule(s.id)}>Release</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </section>
          )}

          {/* SCHEDULED ITEMS */}
          {activeTab === "scheduled" && (
            <section className="scheduled-list">
              <h2>Scheduled Items</h2>
              {acceptedSchedules.length === 0 ? <p>No scheduled items.</p> : (
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
                    {acceptedSchedules.map((s) => (
                      <tr key={`scheduled-${s.id}`}>
                        <td>{s.resident_username || `Resident#${s.user_id}`}</td>
                        <td>{s.item}</td>
                        <td>{s.quantity}</td>
                        <td>{s.staff_username}</td>
                        <td>{s.approved_at ? new Date(s.approved_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}

          {/* RELEASED ITEMS */}
          {activeTab === "released" && (
            <section className="released-list">
              <h2>Released Items</h2>
              {releasedSchedules.length === 0 ? <p>No released schedules yet.</p> : (
                <table>
                  <thead>
                    <tr>
                      <th>Resident</th>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Approved By</th>
                      <th>Date Approved</th>
                      <th>Released By</th>
                      <th>Date Released</th>
                    </tr>
                  </thead>
                  <tbody>
                    {releasedSchedules.map((s) => (
                      <tr key={`released-${s.id}`}>
                        <td>{s.resident_username || `Resident#${s.user_id}`}</td>
                        <td>{s.item}</td>
                        <td>{s.quantity}</td>
                        <td>{s.staff_username}</td>
                        <td>{s.approved_at ? new Date(s.approved_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : "N/A"}</td>
                        <td>{s.released_by_username}</td>
                        <td>{s.released_at ? new Date(s.released_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}

          {/* RETURNED ITEMS */}
          {activeTab === "returned" && (
            <section className="returned-list">
              <h2>Returned Items</h2>
              {returnedSchedules.length === 0 ? <p>No returned items.</p> : (
                <table>
                  <thead>
                    <tr>
                      <th>Resident</th>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Returned By</th>
                      <th>Date Returned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnedSchedules.map((s) => (
                      <tr key={`returned-${s.id}`}>
                        <td>{s.resident_username || `Resident#${s.user_id}`}</td>
                        <td>{s.item}</td>
                        <td>{s.quantity}</td>
                        <td>{s.staff_username}</td>
                        <td>{s.returned_at ? new Date(s.returned_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}
    


          {/* FILE MODAL */}
          {selectedFile && (
            <div className="modal-overlay" onClick={() => setSelectedFile(null)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>{selectedFile.filename}</h2>
                <iframe src={`${import.meta.env.VITE_API_URL}/uploads/${selectedFile.filename}`} title={selectedFile.filename}></iframe>
                <div className="modal-buttons">
                  <button className="btn-green" onClick={() => handleFileStatusChange(selectedFile.id, "approved")}>Accept</button>
                  <button className="btn-red" onClick={() => handleFileStatusChange(selectedFile.id, "rejected")}>Reject</button>
                  <button className="btn-gray" onClick={() => setSelectedFile(null)}>Close</button>
                </div>
              </div>
            </div>
          )}
        {activeTab === "released" && (
  <section className="released-list">
    <h2>Released Items</h2>
    {releasedSchedules.length === 0 ? (
      <p>No released schedules yet.</p>
    ) : (
      <table>
        <thead>
          <tr>
            <th>Resident</th>
            <th>Item</th>
            <th>Quantity</th>
            <th>Approved By</th>
            <th>Date Approved</th>
            <th>Released By</th>
            <th>Date Released</th>
          </tr>
        </thead>
        <tbody>
          {releasedSchedules.map(s => (
            <tr key={s.id}>
              <td>{s.resident_username || `Resident#${s.user_id}`}</td>
              <td>{s.item}</td>
              <td>{s.quantity}</td>
              <td>{s.staff_username}</td>
              <td>{s.approved_at ? new Date(s.approved_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : "N/A"}</td>
              <td>{s.released_by_username}</td>
              <td>{s.released_at ? new Date(s.released_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </section>
)}

          {/* SCHEDULE MODAL */}
{selectedSchedule && (
  <div className="modal-overlay" onClick={() => setSelectedSchedule(null)}>
    <div className="modal schedule-modal" onClick={(e) => e.stopPropagation()}>
      <div className="schedule-modal-header">
        <div className="date-box">
          <span>{new Date(selectedSchedule.date_from).toLocaleDateString("en-PH", { weekday: "short" })}</span>
          <h3>{new Date(selectedSchedule.date_from).toLocaleDateString("en-PH", { day: "numeric", month: "short" })}</h3>
        </div>
        <div className="details-box">
          <h2>{selectedSchedule.item}</h2>
          <p><strong>Quantity:</strong> {selectedSchedule.quantity}</p>
          <p><strong>Date:</strong> {new Date(selectedSchedule.date_from).toLocaleString("en-PH")} → {new Date(selectedSchedule.date_to).toLocaleString("en-PH")}</p>
          <p><strong>Status:</strong> 
            <span className={`status-badge ${selectedSchedule.status.toLowerCase()}`}>
              {selectedSchedule.status}
            </span>
          </p>
        </div>
      </div>
      <div className="modal-buttons">
        <button className="btn-green" onClick={() => handleScheduleStatusChange(selectedSchedule.id, "Approved")}>Approve</button>
        <button className="btn-red" onClick={() => handleScheduleStatusChange(selectedSchedule.id, "Rejected")}>Reject</button>
        <button className="btn-gray" onClick={() => setSelectedSchedule(null)}>Close</button>
      </div>
    </div>
  </div>
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

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUserCircle,
  FaInbox,
  FaBullhorn,
  FaCalendarAlt,
  FaCheckCircle,
  FaSignOutAlt,
  FaSearch,
} from "react-icons/fa";

export default function StaffDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [residents, setResidents] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Get username
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
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

  // Fetch all residents
  useEffect(() => {
    async function fetchResidents() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:3000/api/staff/residents",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setResidents(res.data);
      } catch (err) {
        console.error("Error fetching residents:", err);
      }
    }
    fetchResidents();
  }, []);

  const fetchFiles = async (residentId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:3000/api/staff/files/resident/${residentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFiles(res.data);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/staff/files/${id}`,
        { status: "accepted" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "accepted" } : f))
      );
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/staff/files/${id}`,
        { status: "rejected" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "rejected" } : f))
      );
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        fontFamily: '"Lexend", sans-serif',
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: "#F4BE2A",
          color: "black",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 999,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "black",
              marginRight: "10px",
            }}
          >
            ☰
          </button>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaUserCircle size={40} />
          {username && (
            <span style={{ fontWeight: "bold", fontSize: "18px" }}>
              Staff: {username}
            </span>
          )}
        </div>

        <h1
          style={{
            margin: 0,
            textAlign: "center",
            flex: 1,
            fontSize: isMobile ? "16px" : "clamp(18px, 2vw, 28px)",
            fontWeight: "bold",
          }}
        >
          Staff Dashboard
        </h1>

        <div style={{ width: "34px" }} />
      </header>

      {/* Layout */}
      <div style={{ display: "flex" }}>
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
              {username || "Staff Account"}
            </p>
          </div>

          <div style={menuStyle} onClick={() => navigate("/staff/dashboard")}>
            <FaInbox style={iconStyle} /> Inbox
          </div>
          <div style={menuStyle} onClick={() => navigate("/staff/announcements")}>
            <FaBullhorn style={iconStyle} /> Announcements
          </div>
          <div style={menuStyle} onClick={() => navigate("/staff/scheduled")}>
            <FaCalendarAlt style={iconStyle} /> Scheduled Items
          </div>
          <div style={menuStyle} onClick={() => navigate("/staff/accepted")}>
            <FaCheckCircle style={iconStyle} /> Accepted List
          </div>

          <div style={{ marginTop: "auto" }}>
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
        <main
          style={{
            flex: 1,
            padding: isMobile ? "15px 10px" : "20px",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          {/* Search bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "2px solid #A43259",
                borderRadius: "30px",
                padding: "5px 15px",
                width: "80%",
                maxWidth: "600px",
                backgroundColor: "white",
              }}
            >
              <FaSearch style={{ marginRight: "10px", color: "#A43259" }} />
              <input
                type="text"
                placeholder="Search resident..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  flex: 1,
                  fontSize: "16px",
                }}
              />
            </div>
          </div>

          {/* Resident List */}
          {!selectedResident && (
            <section
              style={{
                backgroundColor: "white",
                borderRadius: "10px",
                padding: "20px",
                boxShadow: "0 0 5px #999",
              }}
            >
              <h2>Residents</h2>
              {residents
  .filter((r) => {
    const name = r.fullname || ""; // default to empty string if undefined
    const term = searchTerm || "";
    return name.toLowerCase().includes(term.toLowerCase());
  })
  .map((r) => (
    <div
      key={r.id}
      style={{
        padding: "10px",
        borderBottom: "1px solid #ccc",
        cursor: "pointer",
      }}
      onClick={() => {
        setSelectedResident(r);
        fetchFiles(r.id);
      }}
    >
      {r.fullname || r.username || "Unnamed Resident"}
    </div>
  ))}

              
            </section>
          )}

          {/* Resident Files */}
          {selectedResident && (
            <section
              style={{
                backgroundColor: "white",
                borderRadius: "10px",
                padding: "20px",
                boxShadow: "0 0 5px #999",
              }}
            >
              <h2>{selectedResident.fullname}Resident's Requests</h2>
              {files.map((f) => (
                <div
                  key={f.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px",
                    borderBottom: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedFile(f)}
                >
                  <span>{f.filename}</span>
                  <span>{f.status}</span>
                </div>
              ))}

              <button
                onClick={() => {
                  setSelectedResident(null);
                  setFiles([]);
                }}
                style={{
                  marginTop: "10px",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Back to Residents
              </button>
            </section>
          )}

          {/* File Modal */}
          {selectedFile && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.6)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 2000,
              }}
              onClick={() => setSelectedFile(null)}
            >
              <div
                style={{
                  position: "relative",
                  background: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  maxWidth: "500px",
                  width: "90%",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  textAlign: "center",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2>{selectedFile.filename}</h2>
                <iframe
                  src={`http://localhost:3000/uploads/${selectedFile.filename}`}
                  title={selectedFile.filename}
                  style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}
                />
                <div
                  style={{
                    marginTop: "15px",
                    display: "flex",
                    gap: "10px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={() => handleAccept(selectedFile.id)}
                    style={{
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(selectedFile.id)}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setSelectedFile(null)}
                    style={{
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#28D69F",
          color: "black",
          padding: isMobile ? "10px 15px" : "15px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: isMobile ? "column" : "row",
          textAlign: "center",
          gap: isMobile ? "10px" : "0",
        }}
      >
        <div style={{ fontWeight: "bold" }}>🌿 Barangay Logo</div>
        <div>📞 0917-123-4567</div>
      </footer>
    </div>
  );
}

const menuStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
  padding: "10px",
  fontSize: "15px",
  borderRadius: "6px",
  marginBottom: "10px",
  transition: "background 0.3s",
};

const iconStyle = { fontSize: "16px" };

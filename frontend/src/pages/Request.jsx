import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaFileAlt, FaSignOutAlt, FaHome, FaCalendarAlt, FaConciergeBell, FaBars, FaTimes } from "react-icons/fa";

export default function RequestPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedFile, setSelectedFile] = useState(null);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar if clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);
  const handleUpload = () => {
    if (selectedFile) {
      alert(`Uploaded: ${selectedFile.name}`);
      setSelectedFile(null);
    } else {
      alert("Please select a file to upload.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const getMenuStyle = (path) => ({
    ...menuStyle,
    backgroundColor: location.pathname === path ? "#FFC107" : "transparent",
    color: location.pathname === path ? "black" : "white",
  });

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
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        {isMobile && (
          <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: "pointer", marginRight: "10px" }}>
            {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </div>
        )}
        <h1 style={{ margin: 0, fontSize: isMobile ? "16px" : "clamp(18px, 2vw, 28px)", fontWeight: "bold" }}>
          UPLOAD REQUEST FILE
        </h1>
      </header>

      <div style={{ display: "flex", position: "relative" }}>
      {/* Sidebar */}
<aside
  ref={sidebarRef}
  style={{
    position: isMobile ? "fixed" : "relative",
    top: 0,
    transform: sidebarOpen || !isMobile ? "translateX(0)" : "translateX(-250px)",
    transition: "transform 0.3s ease",
    height: "100vh",
    width: "220px",
    backgroundColor: "#A43259",
    color: "white",
    zIndex: 1000,
    padding: "20px 10px",
    display: "flex",
    flexDirection: "column",
    boxShadow: isMobile && sidebarOpen ? "2px 0 6px rgba(0,0,0,0.3)" : "none",
  }}
>

        
          {/* Home */}
          <div
            style={{
              ...getMenuStyle("/resident/dashboard"),
              backgroundColor: "#F4BE2A",
              color: "black",
              borderRadius: "8px",
              padding: "10px",
              textAlign: "center",
              marginBottom: "10px",
              transition: "transform 0.3s",
            }}
            onClick={() => navigate("/resident/dashboard")}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <FaHome style={{ marginRight: "5px" }} /> Home
          </div>

          {/* Services */}
          <div>
            <div
              style={{
                ...menuStyle,
                backgroundColor: "#F4BE2A",
                color: "black",
                transition: "transform 0.3s",
              }}
              onClick={() => setServicesOpen(!servicesOpen)}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(10px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
            >
              <FaConciergeBell style={iconStyle} /> Services
            </div>

            {servicesOpen && (
              <div style={{ marginLeft: "15px", display: "flex", flexDirection: "column", gap: "5px", marginTop: "5px" }}>
                <div
                  style={{
                    ...submenuStyle,
                    backgroundColor: location.pathname === "/resident/request" ? "#1E90FF" : "#1E90FF",
                    color: "white",
                    transition: "transform 0.3s",
                  }}
                  onClick={() => navigate("/resident/request")}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(10px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
                >
                  <FaFileAlt style={iconStyle} /> Requests
                </div>
                <div
                  style={{
                    ...submenuStyle,
                    backgroundColor: location.pathname === "/resident/schedule" ? "#1E90FF" : "#1E90FF",
                    color: "white",
                    transition: "transform 0.3s",
                  }}
                  onClick={() => navigate("/resident/schedule")}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(10px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
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
                transition: "transform 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <FaSignOutAlt style={iconStyle} /> Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main
          style={{
            flex: 1,
            padding: isMobile ? "15px 10px" : "20px",
            overflowY: "auto",
            minHeight: "100vh",
            boxSizing: "border-box",
            transition: "margin-left 0.3s ease",
            marginLeft: isMobile && sidebarOpen ? "220px" : "0",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              padding: "20px",
              border: "1px solid #ccc",
              borderRadius: "10px",
              backgroundColor: "#fff",
            }}
          >
            <h2 style={{ marginBottom: "15px", color: "#28D69F" }}>Upload File for Printing</h2>
            <input type="file" onChange={handleFileChange} style={{ marginBottom: "15px" }} />
            {selectedFile && <p><strong>Selected File:</strong> {selectedFile.name}</p>}
            <button
              onClick={handleUpload}
              style={{
                marginTop: "10px",
                padding: "10px 15px",
                backgroundColor: "#28D69F",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Upload
            </button>
          </div>
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
          gap: isMobile ? "8px" : "0",
        }}
      >
        <div style={{ fontWeight: "bold" }}>🌿 Barangay Logo</div>
        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
          <a href="#">Facebook</a>
          <a href="#">Twitter</a>
          <a href="#">Instagram</a>
        </div>
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
  transition: "all 0.3s",
};

const submenuStyle = { ...menuStyle, fontSize: "13px", width: "90%", padding: "6px" };
const iconStyle = { fontSize: "16px" };

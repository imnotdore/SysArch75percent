import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaClipboardList,
  FaConciergeBell,
  FaFileAlt,
  FaSignOutAlt,
} from "react-icons/fa";

const RequestPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedFile, setSelectedFile] = useState(null);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const handleResize = () => setIsMobile(window.innerWidth <= 768);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

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

  const menuStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 15px",
    cursor: "pointer",
    borderRadius: "8px",
    marginBottom: "10px",
    transition: "background 0.3s",
    color: "#333",
  };

  const iconStyle = { color: "#28D69F", minWidth: "20px" };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        style={{
          position: isMobile ? "fixed" : "relative",
          top: 0,
          left: sidebarOpen || !isMobile ? 0 : "-260px",
          height: "100vh",
          width: "240px",
          backgroundColor: "#8d6262ff",
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          transition: "left 0.3s ease",
          zIndex: 1000,
          padding: "20px 10px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <FaUserCircle size={50} color="#28D69F" />
          <p style={{ fontWeight: "bold", marginTop: "10px" }}>Resident</p>
        </div>

        <div style={menuStyle} onClick={() => navigate("/resident/dashboard")}>
          <FaClipboardList style={iconStyle} /> Dashboard
        </div>
        <div style={menuStyle} onClick={() => navigate("/resident/request")}>
          <FaFileAlt style={iconStyle} /> Request
        </div>
        <div
          style={menuStyle}
          onClick={() => navigate("/resident/disclosure-board")}
        >
          <FaConciergeBell style={iconStyle} /> Disclosure Board
        </div>
        <div style={menuStyle} onClick={handleLogout}>
          <FaSignOutAlt style={iconStyle} /> Logout
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header
          style={{
            backgroundColor: "#28D69F",
            color: "black",
            padding: "15px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 999,
          }}
        >
          <h1 style={{ margin: 0, fontSize: "20px" }}>Resident Request</h1>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "black",
              }}
            >
              ☰
            </button>
          )}
        </header>

        {/* Upload Section */}
        <main style={{ flex: 1, padding: "20px" }}>
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
            <h2 style={{ marginBottom: "15px", color: "#28D69F" }}>
              Upload File for Printing
            </h2>
            <input
              type="file"
              onChange={handleFileChange}
              style={{ marginBottom: "15px" }}
            />
            {selectedFile && (
              <p>
                <strong>Selected File:</strong> {selectedFile.name}
              </p>
            )}
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
              }}
            >
              Upload
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RequestPage;

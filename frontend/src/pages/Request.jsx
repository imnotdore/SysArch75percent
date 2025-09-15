import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  FaClipboardList,
} from 'react-icons/fa';

import { FileContext } from "../context/Filecontext";

export default function RequestPage() {
  const { fetchFiles: fetchContextFiles } = useContext(FileContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedFile, setSelectedFile] = useState(null);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // File selection
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  // File upload
  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      const res = await axios.post(`${API_URL}/api/files/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      
      setSelectedFile(null);
      fetchContextFiles(); // Update context so YourAccount.jsx sees the new file
      navigate("/resident/youraccount");
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed");
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
      <header style={headerStyle}>
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
                 left: sidebarOpen || !isMobile ? 0 : "-240px",
                 height: "100vh",
                 width: "220px",
                 backgroundColor: "#A43259", // match ResidentDashboard
                 color: "white",
                 transition: "left 0.3s ease",
                 zIndex: 1000,
                 padding: "20px 10px",
                 display: "flex",
                 flexDirection: "column",
               }}
             >
               {/* Your Account box */}
               <div
                 style={{
                   textAlign: "center",
                   marginBottom: "20px",
                   padding: "10px",
                   backgroundColor: "#f9f9f9",
                   borderRadius: "8px",
                   color: "black",
                   cursor: "pointer",
                   transition: "transform 0.3s ease",
                 }}
                 onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                 onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                 onClick={() => navigate("/resident/youraccount")}
               >
                 <FaUserCircle size={50} color="black" />
                 <p style={{ fontWeight: "bold", marginTop: "10px" }}>Your Account</p>
                
                  
                 
               </div>
             
               {/* Home */}
               <div
                 style={{
                   ...menuStyle,
                   backgroundColor: "#F4BE2A", // same yellow as dashboard
                   color: "black",
                   borderRadius: "8px",
                   padding: "10px",
                   textAlign: "center",
                   marginBottom: "10px",
                   transition: "transform 0.2s ease",
                 }}
                 onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(10px)")}
                 onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
                 onClick={() => navigate("/resident/dashboard")}
               >
                 <FaHome style={{ marginRight: "5px" }} /> Home
               </div>
             
               {/* Services */}
               <div>
                 <div
                   style={{
                     ...menuStyle,
                     backgroundColor: "#F4BE2A", // yellow permanent
                     color: "black",
                     transition: "transform 0.3s ease",
                   }}
                   onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(10px)")}
                   onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
                   onClick={() => setServicesOpen(!servicesOpen)}
                 >
                   <FaConciergeBell style={iconStyle} /> Services
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
                       style={{
                         ...submenuStyle,
                         backgroundColor: "#26ff1eff", // blue permanent
                         color: "black",
                         transition: "transform 0.3s ease",
                       }}
                       onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(10px)")}
                       onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
                       onClick={() => navigate("/resident/request")}
                     >
                       <FaFileAlt style={iconStyle} /> Requests
                     </div>
                     <div
                       style={{
                         ...submenuStyle,
                         backgroundColor: "#1E90FF",
                         color: "white",
                         transition: "transform 0.3s ease",
                       }}
                       onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(10px)")}
                       onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
                       onClick={() => navigate("/resident/schedule")}
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
                     transition: "transform 0.2s ease",
                   }}
                   onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(5px)")}
                   onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
                 >
                   <FaSignOutAlt style={iconStyle} /> Logout
                 </button>
               </div>
             </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: isMobile ? "15px 10px" : "20px", overflowY: "auto", minHeight: "100vh", boxSizing: "border-box" }}>
          <div style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            backgroundColor: "#fff",
          }}>
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
    </div>
  );
}

// ------------------ Styles ------------------ //
const menuStyle = { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "10px", fontSize: "15px", borderRadius: "6px", marginBottom: "10px", transition: "all 0.3s" };
const submenuStyle = { ...menuStyle, fontSize: "13px", width: "90%", padding: "6px" };
const iconStyle = { fontSize: "16px" };
const headerStyle = { backgroundColor: "#F4BE2A", color: "black", padding: "15px 20px", display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 999, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" };

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ResidentSidebar from "./ResidentSidebar";
import ResidentHeader from "./ResidentHeader";
import ResidentFooter from "./ResidentFooter";

export default function ResidentLayout({ children, title = "Resident Dashboard" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

 return (
    <div style={{ 
      fontFamily: '"Lexend", sans-serif', 
      width: "100%", 
      minHeight: "100vh", 
      backgroundImage: "url('/pic1.jpg')",
      backgroundSize: "fill",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      position: "relative"
    }}>
      {/* Overlay para mas readable ang content */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(245, 246, 250, 0.8)", // Light overlay
        zIndex: 0
      }}></div>
      
      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Overlay for mobile when sidebar is open */}
        {isMobile && sidebarOpen && (
          <div 
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 999,
            }}
          />
        )}
        
        <ResidentHeader 
          title={title}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
        />
        
        <div style={{ display: "flex", position: "relative" }}>
          <ResidentSidebar
            sidebarRef={sidebarRef}
            sidebarOpen={sidebarOpen}
            isMobile={isMobile}
            onLogout={handleLogout}
          />
          
          <main 
            className="resident-main-content"
            style={{ 
              flex: 1, 
              padding: isMobile ? "15px 10px" : "20px", 
              overflowY: "auto", 
              minHeight: "100vh",
              boxSizing: "border-box",
            }}
          >
            {children}
          </main>
        </div>
        
        <ResidentFooter />
      </div>
    </div>
 );
}
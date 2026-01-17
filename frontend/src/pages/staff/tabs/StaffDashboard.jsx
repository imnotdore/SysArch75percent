// StaffDashboard.js
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Import components
import Sidebar from "../components/StaffSidebar";
import Footer from "../components/StaffFooter";

// Import tabs
import InboxTab from "./InboxTab";
import AcceptedTab from "./AcceptedTab";
import ScheduledTab from "./ScheduledTab";
import PrintedTab from "./PrintedTab";
import ReleasedTab from "./ReleasedTab";
import ReturnedTab from "./ReturnedTab";
import AccountsTab from "./AccountsTab";

// Import modals
import FileModal from "../modals/FileModal";
import ScheduleModal from "../modals/ScheduleModal";
import AcceptedModal from "../modals/AcceptedModal";
import PendingAccountModal from "../modals/PendingAccountModal";

// Import hooks
import useStaffAuth from "../hooks/useStaffAuth";
import useStaffData from "../hooks/useStaffData";
import useResponsive from "../hooks/useResponsive";

// import ng css
import "./StaffDashboard.css";
import "./tabs.css/AccountsTab.css";
import "./tabs.css/InboxTab.css";
import "./tabs.css/AcceptedTab.css";
import "./tabs.css/PrintedTab.css";
import "./tabs.css/ScheduledTab.css";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  
  // State management - get from localStorage or default to "inbox"
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("staffActiveTab");
    return savedTab || "inbox";
  });
  
  // Set sidebarOpen to true by default
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Custom hooks
  const { isMobile } = useResponsive(sidebarRef);
  const { username, staffId, token, handleLogout } = useStaffAuth(navigate);

  const {
    // State
    residents,
    selectedResident,
    selectedResidentRequests,
    selectedFile,
    selectedSchedule,
    selectedAccepted,
    selectedPendingAccount,
    acceptedFiles,
    acceptedSchedules,
    returnedSchedules,
    releasedSchedules,
    printedFiles,
    pendingAccounts,
    searchTerm,
    modalLoading,
    
    // Setters
    setSelectedResident,
    setSelectedFile,
    setSelectedSchedule,
    setSelectedAccepted,
    setSelectedPendingAccount,
    setSearchTerm,
    setModalLoading,
    
    // Functions
    fetchResidentRequests,
    handleFileStatusChange,
    handleScheduleStatusChange,
    handleAccountAction,
    fetchPrintedFiles,
    releaseSchedule, 
    returnSchedule   
  } = useStaffData(staffId, activeTab);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("staffActiveTab", activeTab);
  }, [activeTab]);

  // Calculate badge counts for sidebar - AUTOMATICALLY UPDATED
  const badgeCounts = {
    inbox: residents?.length || 0,
    accepted: acceptedFiles?.length || 0,
    scheduled: acceptedSchedules?.length || 0,
    printed: printedFiles?.length || 0,
    released: releasedSchedules?.length || 0,
    returned: returnedSchedules?.length || 0,
    accounts: pendingAccounts?.length || 0 // ✅ RESIDENT LANG ANG COUNT
  };

  // Sidebar click outside - only close on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    
    if (sidebarOpen && isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen, isMobile]);

  // Close modals with Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setSelectedFile(null);
        setSelectedSchedule(null);
        setSelectedAccepted(null);
        setSelectedPendingAccount(null);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // Custom setActiveTab function to handle tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Only close sidebar on mobile when changing tabs
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Toggle sidebar function - FIXED VERSION
  const toggleSidebar = () => {
    const isDesktop = window.innerWidth > 900;
    
    if (isDesktop) {
      // Desktop: toggle between expanded and collapsed
      const newCollapsedState = !sidebarCollapsed;
      setSidebarCollapsed(newCollapsedState);
      setSidebarOpen(true); // Always keep sidebar "open" on desktop, just collapsed
    } else {
      // Mobile: toggle between open and closed
      setSidebarOpen(!sidebarOpen);
      setSidebarCollapsed(false); // Always expanded on mobile when open
    }
  };

  // Render active tab content
  const renderActiveTab = () => {
    const commonProps = {
      staffId,
      searchTerm,
      setSearchTerm,
      setSelectedFile,
      setSelectedSchedule,
      setSelectedAccepted,
      setSelectedPendingAccount,
      modalLoading,
      setModalLoading
    };

    switch (activeTab) {
      case "inbox":
        return (
          <InboxTab
            {...commonProps}
            residents={residents}
            selectedResident={selectedResident}
            selectedResidentRequests={selectedResidentRequests}
            setSelectedResident={setSelectedResident}
            fetchResidentRequests={fetchResidentRequests}
            handleFileStatusChange={handleFileStatusChange}
            handleScheduleStatusChange={handleScheduleStatusChange}
          />
        );
      
      case "accepted":
        return (
          <AcceptedTab
            {...commonProps}
            acceptedFiles={acceptedFiles}
            acceptedSchedules={acceptedSchedules}
            fetchPrintedFiles={fetchPrintedFiles}
          />
        );
      
      case "scheduled":
        return <ScheduledTab acceptedSchedules={acceptedSchedules} onReleaseSchedule={releaseSchedule}/>;
      
      case "printed":
        return <PrintedTab printedFiles={printedFiles} />;
      
      case "released":
        return <ReleasedTab releasedSchedules={releasedSchedules} onReturnSchedule={returnSchedule} />;
      
      case "returned":
        return <ReturnedTab returnedSchedules={returnedSchedules} />;
      
      case "accounts":
        return (
          <AccountsTab
            {...commonProps}
            pendingAccounts={pendingAccounts}
            handleAccountAction={handleAccountAction}
          />
        );
      
      default:
        return (
          <div className="dashboard-welcome">
            <h2>Welcome, {username}!</h2>
          </div>
        );
    }
  };

  return (
    <div className="staff-wrapper">
      {/* Sidebar Overlay - only show when sidebar is open AND on mobile */}
      <div 
        className={`sidebar-overlay ${sidebarOpen && isMobile ? 'active' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Sidebar Component */}
      <Sidebar
        sidebarRef={sidebarRef}
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
        username={username}
        badgeCounts={badgeCounts}
      />

      {/* Main Content */}
      <div className={`staff-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="staff-header">
          <button 
            className="menu-icon" 
            onClick={toggleSidebar}
          >
            ☰
          </button>
          <h1>Staff Dashboard</h1>
          <div className="staff-info">
            <span>{username}</span>
          </div>
        </header>

        <div className="staff-content">
          {renderActiveTab()}

          {/* Modals */}
          {selectedFile && (
            <FileModal
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              handleFileStatusChange={handleFileStatusChange}
              modalLoading={modalLoading}
              setModalLoading={setModalLoading}
            />
          )}

          {selectedSchedule && (
            <ScheduleModal
              selectedSchedule={selectedSchedule}
              setSelectedSchedule={setSelectedSchedule}
              handleScheduleStatusChange={handleScheduleStatusChange}
              modalLoading={modalLoading}
              setModalLoading={setModalLoading}
            />
          )}

          {selectedAccepted && (
            <AcceptedModal
              selectedAccepted={selectedAccepted}
              setSelectedAccepted={setSelectedAccepted}
              fetchPrintedFiles={fetchPrintedFiles}
            />
          )}

          {selectedPendingAccount && (
            <PendingAccountModal
              selectedPendingAccount={selectedPendingAccount}
              setSelectedPendingAccount={setSelectedPendingAccount}
              handleAccountAction={handleAccountAction}
            />
          )}
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
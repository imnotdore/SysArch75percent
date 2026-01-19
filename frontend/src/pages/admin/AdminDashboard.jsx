import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBars } from "react-icons/fa";
import DashboardCards from "./DashboardCards";
import UsersTable from "./UsersTable";
import AddStaffModal from "./AddStaffModal";
import ConfirmationModal from "./ConfirmationModal";
import EditUserModal from "./EditUserModal";
import "./admin.css";
import ItemManager from "./ItemManager";
import Sidebar from "./Sidebar";
import PageLimitManager from "./PageLimitManager";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [approvedStaff, setApprovedStaff] = useState([]); // Removed pendingStaff
  const [pendingResidents, setPendingResidents] = useState([]);
  const [approvedResidents, setApprovedResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [modal, setModal] = useState({ show: false, user: null, action: "", type: "" });
  const [editModal, setEditModal] = useState({ show: false, user: null, viewOnly: false, type: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    staff_id: '',
    username: '',
    name: '',
    contact: '',
    password: ''
  });

  const prevCounts = useRef({ approvedStaff:0, pendingRes:0, approvedRes:0 }); // Removed pendingStaff
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const sidebarRef = useRef(null);

  // Function to generate staff ID
  const generateStaffId = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `STAFF${timestamp}`;
  };

  // Initialize with generated staff ID when modal opens
  useEffect(() => {
    if (showAddStaffModal) {
      setNewStaff(prev => ({
        ...prev,
        staff_id: generateStaffId()
      }));
    }
  }, [showAddStaffModal]);

  const handleLogout = async () => {
    try {
      await axios.post(`${baseUrl}/api/auth/logout`); 
      localStorage.removeItem('token'); 
      navigate('/'); 
    } catch (err) {
      console.error("Logout failed:", err);
      navigate('/'); 
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [approvedStaffRes, pendingResRes, approvedResRes] = await Promise.all([
        axios.get(`${baseUrl}/api/auth/admin/staff/approved`),
        axios.get(`${baseUrl}/api/auth/admin/residents/pending`),
        axios.get(`${baseUrl}/api/auth/admin/residents/approved`)
      ]);

      prevCounts.current = {
        approvedStaff: approvedStaffRes.data.length,
        pendingRes: pendingResRes.data.length,
        approvedRes: approvedResRes.data.length
      };

      setApprovedStaff(approvedStaffRes.data);
      setPendingResidents(pendingResRes.data);
      setApprovedResidents(approvedResRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Failed to load data. Check backend or routes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sidebar click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    
    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  const handleAction = async () => {
    try {
      const { user, action, type } = modal;
      if (!user) return;

      let endpoint = "";
      if (type === "staff") {
        if (action === "delete") {
          const res = await axios.delete(`${baseUrl}/api/auth/admin/staff/${user.id}`);
          if (res.status === 200) setApprovedStaff(prev => prev.filter(s => s.id !== user.id));
        }
      } else if (type === "resident") {
        if (action === "delete") {
          await axios.delete(`${baseUrl}/api/auth/admin/residents/${user.id}`);
          setApprovedResidents(prev => prev.filter(r => r.id !== user.id));
        } else if (action === "accept") {
          endpoint = `${baseUrl}/api/auth/admin/residents/${user.id}/approve`;
          await axios.put(endpoint); 
          setApprovedResidents(prev => [...prev, { ...user, status:"approved" }]);
          setPendingResidents(prev => prev.filter(r => r.id !== user.id));
        } else if (action === "reject") {
          endpoint = `${baseUrl}/api/auth/admin/residents/${user.id}/reject`;
          await axios.delete(endpoint);
          setPendingResidents(prev => prev.filter(r => r.id !== user.id));
        }
      }

      setModal({ show:false, user:null, action:"", type:"" });
      fetchData();
    } catch (err) {
      console.error("Error updating:", err);
      alert(err.response?.data?.error || "Failed to update status. Check backend.");
    }
  };

  const handleSaveEdit = async (updatedUser) => {
    if (!updatedUser?.id) return alert("Invalid user data");
    try {
      const type = editModal.type;
      const endpointType = type === 'resident' ? 'residents' : 'staff';

      const formData = new FormData();
      
      if (type === "staff") {
        formData.append("username", updatedUser.username || "");
        formData.append("name", updatedUser.name || "");
        formData.append("contact", updatedUser.contact || "");
        formData.append("staff_id", updatedUser.staff_id || "");
      } else if (type === "resident") {
        // Personal Information
        formData.append("first_name", updatedUser.first_name || "");
        formData.append("middle_name", updatedUser.middle_name || "");
        formData.append("last_name", updatedUser.last_name || "");
        formData.append("suffix", updatedUser.suffix || "");
        formData.append("sex", updatedUser.sex || "");
        formData.append("birthday", updatedUser.birthday || "");
        formData.append("age", updatedUser.age || "");
        formData.append("civil_status", updatedUser.civil_status || "");
        formData.append("citizenship", updatedUser.citizenship || "");
        
        // Address Information
        formData.append("house_no_street", updatedUser.house_no_street || "");
        formData.append("purok_sitio", updatedUser.purok_sitio || "");
        formData.append("barangay", updatedUser.barangay || "");
        formData.append("city_municipality", updatedUser.city_municipality || "");
        formData.append("province", updatedUser.province || "");
        
        // Contact Information
        formData.append("mobile_number", updatedUser.mobile_number || "");
        formData.append("email_address", updatedUser.email_address || "");
        formData.append("email", updatedUser.email_address || "");
        
        // Identity Verification
        formData.append("valid_id_type", updatedUser.valid_id_type || "");
        formData.append("valid_id_number", updatedUser.valid_id_number || "");
        
        // Household Information
        formData.append("household_id", updatedUser.household_id || "");
        formData.append("family_role", updatedUser.family_role || "");
        formData.append("household_members", updatedUser.household_members || "");
        formData.append("emergency_contact_name", updatedUser.emergency_contact_name || "");
        formData.append("emergency_contact_number", updatedUser.emergency_contact_number || "");
        
        // Account
        formData.append("username", updatedUser.username || "");
      }

      const res = await axios.put(
        `${baseUrl}/api/auth/admin/${endpointType}/${updatedUser.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.status === 200) {
        const updatedData = res.data.data || updatedUser;
        
        if (type === "staff") {
          setApprovedStaff(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedData } : u));
        }
        if (type === "resident") {
          setApprovedResidents(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedData } : u));
        }
        
        alert(res.data.message || "Updated successfully");
        setEditModal({ show: false, user: null, viewOnly: false, type: "" });
        fetchData();
      }
    } catch (err) {
      console.error("Error saving:", err);
      alert(`Error saving: ${err.message}. ${err.response?.data?.error || ""}`);
    }
  };

  // Handle creating staff account
  const handleAddStaff = async () => {
    try {
      if (!newStaff.username || !newStaff.name || !newStaff.password) {
        alert("Please fill all required fields");
        return;
      }

      const response = await axios.post(
        `${baseUrl}/api/auth/admin/create-staff`,
        newStaff
      );

      if (response.status === 201) {
        alert("Staff account created successfully!");
        setShowAddStaffModal(false);
        setNewStaff({
          staff_id: '',
          username: '',
          name: '',
          contact: '',
          password: ''
        });
        
        fetchData();
      }
    } catch (err) {
      console.error("Error creating staff:", err);
      alert(err.response?.data?.error || "Failed to create staff account");
    }
  };

  if (loading) return <p className="admin-loading">Loading data...</p>;

  return (
    <div className="admin-wrapper">
      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
      
      {/* Sidebar Component */}
      <Sidebar
        sidebarRef={sidebarRef}
        sidebarOpen={sidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <button 
            className="menu-icon"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars />
          </button>
          <h1>Admin Dashboard</h1>
        </header>

        <div className="admin-content">
          {/* Dashboard Cards */}
          {activeTab === "dashboard" && (
            <DashboardCards
              approvedStaff={approvedStaff}
              pendingResidents={pendingResidents}
              approvedResidents={approvedResidents}
              prevCounts={prevCounts}
              setActiveTab={setActiveTab}
              setShowAddStaffModal={setShowAddStaffModal}
            />
          )}
          
          {/* Item Manager */}
          {activeTab === "items" && (
            <ItemManager />
          )}
          
          {/* Page Limit Manager */}
          {activeTab === "page-limits" && (
            <PageLimitManager />
          )}
          
          {/* Users Table */}
          {activeTab !== "dashboard" && 
           activeTab !== "items" && 
           activeTab !== "page-limits" && (
            <UsersTable
              activeTab={activeTab}
              approvedStaff={approvedStaff}
              pendingResidents={pendingResidents}
              approvedResidents={approvedResidents}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              baseUrl={baseUrl}
              setModal={setModal}
              setEditModal={setEditModal}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmationModal
        modal={modal}
        setModal={setModal}
        handleAction={handleAction}
      />

      <EditUserModal
        editModal={editModal}
        setEditModal={setEditModal}
        baseUrl={baseUrl}
        handleSaveEdit={handleSaveEdit}
      />

      <AddStaffModal
        showAddStaffModal={showAddStaffModal}
        setShowAddStaffModal={setShowAddStaffModal}
        newStaff={newStaff}
        setNewStaff={setNewStaff}
        handleAddStaff={handleAddStaff}
      />
    </div>
  );
}
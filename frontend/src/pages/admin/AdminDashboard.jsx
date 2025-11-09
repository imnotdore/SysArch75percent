import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBars } from "react-icons/fa";
import Sidebar from "./Sidebar";
import DashboardCards from "./DashboardCards";
import UsersTable from "./UsersTable";
import AddStaffModal from "./AddStaffModal";
import ConfirmationModal from "./ConfirmationModal";
import EditUserModal from "./EditUserModal";
import "./admin.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingStaff, setPendingStaff] = useState([]);
  const [approvedStaff, setApprovedStaff] = useState([]);
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

  const prevCounts = useRef({ pendingStaff:0, approvedStaff:0, pendingRes:0, approvedRes:0 });
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
      const [pendingStaffRes, approvedStaffRes, pendingResRes, approvedResRes] = await Promise.all([
        axios.get(`${baseUrl}/api/auth/admin/staff/pending`),
        axios.get(`${baseUrl}/api/auth/admin/staff/approved`),
        axios.get(`${baseUrl}/api/auth/admin/residents/pending`),
        axios.get(`${baseUrl}/api/auth/admin/residents/approved`)
      ]);

      prevCounts.current = {
        pendingStaff: pendingStaffRes.data.length,
        approvedStaff: approvedStaffRes.data.length,
        pendingRes: pendingResRes.data.length,
        approvedRes: approvedResRes.data.length
      };

      setPendingStaff(pendingStaffRes.data);
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
        } else {
          endpoint = `${baseUrl}/api/auth/admin/staff-requests/${user.id}/${action}`;
          const res = await axios.post(endpoint);
          if (res.status === 200) {
            if (action === "accept") {
              setApprovedStaff(prev => [...prev, { ...user, status:"approved" }]);
              setPendingStaff(prev => prev.filter(s => s.id !== user.id));
            } else if (action === "reject") {
              setPendingStaff(prev => prev.filter(s => s.id !== user.id));
            }
          }
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
      formData.append("username", updatedUser.username || "");
      formData.append("contact", updatedUser.contact || "");
      
      const userFullName = updatedUser.name || updatedUser.full_name || "";

      if (type === "staff") {
        formData.append("name", userFullName);
        formData.append("staff_id", updatedUser.staff_id || "");
      } else if (type === "resident") {
        formData.append("full_name", userFullName); 
      }
      
      if (type === "resident") {
        formData.append("address", updatedUser.address || "");
        formData.append("age", updatedUser.age || "");
        formData.append("gender", updatedUser.gender || "");
        formData.append("civil_status", updatedUser.civil_status || "");
        formData.append("youth_classification", updatedUser.youth_classification || "");
        formData.append("education", updatedUser.education || "");
        formData.append("registered_sk", updatedUser.registered_sk || "");
        formData.append("registered_national", updatedUser.registered_national || "");
        formData.append("birthday", updatedUser.birthday || "");
        
        if (updatedUser.id_picture instanceof File) {
          formData.append("id_picture", updatedUser.id_picture);
        }
      }

      const res = await axios.put(
        `${baseUrl}/api/auth/admin/${endpointType}/${updatedUser.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.status === 200) {
        const updatedData = res.data.data || updatedUser;
        
        if (type==="staff") {
          setApprovedStaff(prev => prev.map(u => u.id===updatedUser.id ? {...u,...updatedData, name: userFullName}:u));
        }
        if (type==="resident") {
          setApprovedResidents(prev => prev.map(u => u.id===updatedUser.id ? {...u,...updatedData, full_name: userFullName}:u));
        }
        
        alert(res.data.message || "Updated successfully");
        setEditModal({ show:false, user:null, viewOnly:false, type:"" });
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
              pendingStaff={pendingStaff}
              approvedStaff={approvedStaff}
              pendingResidents={pendingResidents}
              approvedResidents={approvedResidents}
              prevCounts={prevCounts}
              setActiveTab={setActiveTab}
              setShowAddStaffModal={setShowAddStaffModal}
            />
          )}

          {/* Users Table */}
          {activeTab !== "dashboard" && (
            <UsersTable
              activeTab={activeTab}
              pendingStaff={pendingStaff}
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
import React, { useState, useEffect } from "react";
import axios from "axios";
import UsersTable from "./UsersTable";
import EditUserModal from "./EditUserModal";
import { 
  FaUsers, 
  FaUserCheck, 
  FaUserClock, 
  FaUserTie, 
  FaSearch, 
  FaSync 
} from "react-icons/fa";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, user: null, action: "", type: "" });
  const [editModal, setEditModal] = useState({ show: false, user: null, viewOnly: false, type: "" });
  const [refreshKey, setRefreshKey] = useState(0);
  
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Fetch all users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/api/auth/users`);
      setUsers(response.data);
      
      // Apply current filter
      filterUsers(response.data, activeTab, searchTerm);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on tab and search term
  const filterUsers = (userList, tab, search) => {
    let filtered = userList;
    
    // Apply tab filter
    switch(tab) {
      case "approved-staff":
        filtered = filtered.filter(u => u.role === "staff" && u.status === "approved");
        break;
      case "pending-res":
        filtered = filtered.filter(u => u.role === "resident" && u.status === "pending");
        break;
      case "approved-res":
        filtered = filtered.filter(u => u.role === "resident" && u.status === "approved");
        break;
      case "all-staff":
        filtered = filtered.filter(u => u.role === "staff");
        break;
      case "all-residents":
        filtered = filtered.filter(u => u.role === "resident");
        break;
      case "all":
      default:
        // Show all users
        break;
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(u => 
        (u.username && u.username.toLowerCase().includes(searchLower)) ||
        (u.full_name && u.full_name.toLowerCase().includes(searchLower)) ||
        (u.name && u.name.toLowerCase().includes(searchLower)) ||
        (u.email_address && u.email_address.toLowerCase().includes(searchLower)) ||
        (u.email && u.email.toLowerCase().includes(searchLower)) ||
        (u.mobile_number && u.mobile_number.includes(search)) ||
        (u.barangay && u.barangay.toLowerCase().includes(searchLower)) ||
        (u.staff_id && u.staff_id.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredUsers(filtered);
  };

  // Handle search
  useEffect(() => {
    filterUsers(users, activeTab, searchTerm);
  }, [searchTerm, activeTab, users]);

  // Fetch users on component mount and refresh
  useEffect(() => {
    fetchUsers();
  }, [refreshKey]);

  // Handle user actions (approve/reject/delete)
  const handleUserAction = async (user, action, type) => {
    try {
      let response;
      
      switch(action) {
        case "approve":
        case "accept":
          response = await axios.put(`${baseUrl}/api/auth/users/${user.id}/approve`);
          break;
        case "reject":
          response = await axios.put(`${baseUrl}/api/auth/users/${user.id}/reject`);
          break;
        case "delete":
          response = await axios.delete(`${baseUrl}/api/auth/users/${user.id}`);
          break;
        default:
          return;
      }
      
      if (response.data.success) {
        // Refresh the user list
        setRefreshKey(prev => prev + 1);
        setModal({ show: false, user: null, action: "", type: "" });
        
        // Show success message
        alert(`User ${action}ed successfully!`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`Failed to ${action} user: ${error.response?.data?.error || error.message}`);
    }
  };

  // Handle user update
  const handleUpdateUser = async (updatedUser) => {
    try {
      const response = await axios.put(
        `${baseUrl}/api/auth/users/${updatedUser.id}`, 
        updatedUser
      );
      
      if (response.data.success) {
        // Refresh the user list
        setRefreshKey(prev => prev + 1);
        return { success: true, message: "User updated successfully" };
      }
      
      return { success: false, message: response.data.error };
    } catch (error) {
      console.error("Error updating user:", error);
      return { 
        success: false, 
        message: error.response?.data?.error || "Failed to update user" 
      };
    }
  };

  // Tab statistics
  const getTabStats = () => {
    return {
      all: users.length,
      'approved-staff': users.filter(u => u.role === "staff" && u.status === "approved").length,
      'pending-res': users.filter(u => u.role === "resident" && u.status === "pending").length,
      'approved-res': users.filter(u => u.role === "resident" && u.status === "approved").length,
      'all-staff': users.filter(u => u.role === "staff").length,
      'all-residents': users.filter(u => u.role === "resident").length,
    };
  };

  const tabStats = getTabStats();

  return (
    <div className="user-management-page">
      {/* Header */}
      <div className="management-header">
        <div className="header-content">
          <h1 className="page-title">
            <FaUsers className="title-icon" />
            User Management
          </h1>
          <p className="page-subtitle">
            Manage all registered users in the system
          </p>
        </div>
        
        <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={() => setRefreshKey(prev => prev + 1)}
            disabled={isLoading}
          >
            <FaSync className={isLoading ? "spinning-icon" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="user-tabs">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <FaUsers />
          All Users
          <span className="tab-count">{tabStats.all}</span>
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'pending-res' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending-res')}
        >
          <FaUserClock />
          Pending Residents
          <span className="tab-count">{tabStats['pending-res']}</span>
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'approved-res' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved-res')}
        >
          <FaUserCheck />
          Approved Residents
          <span className="tab-count">{tabStats['approved-res']}</span>
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'approved-staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved-staff')}
        >
          <FaUserTie />
          Approved Staff
          <span className="tab-count">{tabStats['approved-staff']}</span>
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'all-staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('all-staff')}
        >
          <FaUserTie />
          All Staff
          <span className="tab-count">{tabStats['all-staff']}</span>
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'all-residents' ? 'active' : ''}`}
          onClick={() => setActiveTab('all-residents')}
        >
          <FaUsers />
          All Residents
          <span className="tab-count">{tabStats['all-residents']}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name, username, email, mobile, barangay..." 
            className="search-input" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm("")}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <UsersTable
          users={filteredUsers}
          activeTab={activeTab}
          setModal={setModal}
          setEditModal={setEditModal}
          baseUrl={baseUrl}
        />
      )}

      {/* Edit Modal */}
      <EditUserModal
        editModal={editModal}
        setEditModal={setEditModal}
        baseUrl={baseUrl}
        handleUpdateUser={handleUpdateUser}
      />

      {/* Action Confirmation Modal */}
      {modal.show && (
        <div className="modal-overlay">
          <div className="action-modal">
            <h3>Confirm Action</h3>
            <p>
              Are you sure you want to {modal.action} user <strong>{modal.user?.username}</strong>?
            </p>
            <div className="modal-actions">
              <button 
                className="confirm-btn"
                onClick={() => handleUserAction(modal.user, modal.action, modal.type)}
              >
                Yes, {modal.action}
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setModal({ show: false, user: null, action: "", type: "" })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
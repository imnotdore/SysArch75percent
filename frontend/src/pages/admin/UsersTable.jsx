import React from "react";
import { FaSearch, FaEye, FaEdit, FaTrash, FaCheck, FaTimes, FaUser } from "react-icons/fa";

const UsersTable = ({
  activeTab,
  approvedStaff,
  pendingResidents,
  approvedResidents,
  searchTerm,
  setSearchTerm,
  baseUrl,
  setModal,
  setEditModal
}) => {
  
  const currentList = (() => {
    switch(activeTab) {
      case "approved-staff": 
        return approvedStaff;
      case "pending-res": 
        return pendingResidents;
      case "approved-res": 
        return approvedResidents;
      case "all-staff": 
        return approvedStaff;
      case "all-residents":
        return [...pendingResidents, ...approvedResidents];
      case "all": 
        return [...approvedStaff, ...pendingResidents, ...approvedResidents];
      default: 
        return [];
    }
  })();

  const filteredList = currentList.filter(u => {
    const searchTermLower = searchTerm.toLowerCase();
    const username = u.username?.toLowerCase() || "";
    const name = u.name?.toLowerCase() || "";
    const full_name = u.full_name?.toLowerCase() || "";
    const contact = u.contact?.toLowerCase() || "";
    const mobile_number = u.mobile_number?.toLowerCase() || "";
    const email_address = u.email_address?.toLowerCase() || "";
    const barangay = u.barangay?.toLowerCase() || "";
    const staff_id = u.staff_id?.toLowerCase() || "";
    
    return username.includes(searchTermLower) || 
           name.includes(searchTermLower) || 
           full_name.includes(searchTermLower) ||
           contact.includes(searchTermLower) || 
           mobile_number.includes(searchTermLower) ||
           email_address.includes(searchTermLower) ||
           barangay.includes(searchTermLower) ||
           staff_id.includes(searchTermLower);
  });

  const isResidentTab = /res/i.test(activeTab) || activeTab === "all-residents";
  const isStaffTab = /staff/i.test(activeTab) || activeTab === "all-staff";

  const getFullName = (user) => {
    if (user.name) return user.name;
    
    const parts = [
      user.first_name,
      user.middle_name,
      user.last_name,
      user.suffix
    ].filter(part => part && part.trim() !== "");
    
    return parts.join(' ');
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#f97316';
      case 'approved': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusBgColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#ffedd5';
      case 'approved': return '#dcfce7';
      default: return '#f3f4f6';
    }
  };

  const getTitle = () => {
    const titles = {
      "approved-staff": "Approved Staff",
      "pending-res": "Pending Residents",
      "approved-res": "Approved Residents",
      "all-staff": "All Staff",
      "all-residents": "All Residents",
      "all": "All Users"
    };
    return titles[activeTab] || "Users";
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <h2 className="page-title">{getTitle()}</h2>
        <div className="search-container">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search users..." 
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
      </div>

      {filteredList.length === 0 ? (
        <div className="no-results">
          <FaUser className="no-results-icon" />
          <p>No users found</p>
          {searchTerm && (
            <p className="no-results-hint">Try adjusting your search terms</p>
          )}
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  {isStaffTab && <th className="staff-id-col">Staff ID</th>}
                  <th className="name-col">Full Name</th>
                  <th className="username-col">Username</th>
                  {isResidentTab ? (
                    <>
                      <th className="contact-col">Contact</th>
                      <th className="email-col">Email</th>
                      <th className="barangay-col">Barangay</th>
                      <th className="age-col">Age</th>
                      <th className="id-type-col">ID Type</th>
                      <th className="id-pic-col">ID Picture</th>
                    </>
                  ) : (
                    <th className="contact-col">Contact</th>
                  )}
                  <th className="status-col">Status</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((u, index) => {
                  const isResident = 'first_name' in u || 'full_name' in u;
                  const type = isResident ? "resident" : "staff";
                  const fullName = getFullName(u);
                  
                  return (
                    <tr key={u.id} className={`user-row ${index % 2 === 0 ? 'even' : 'odd'}`}>
                      {isStaffTab && (
                        <td className="staff-id-cell">
                          <span className="staff-id">{u.staff_id || "N/A"}</span>
                        </td>
                      )}
                      <td className="name-cell">
                        <div className="user-name-wrapper">
                          <span className="user-name">{fullName || "N/A"}</span>
                          {isResident && (
                            <div className="user-tags">
                              {u.sex && <span className="tag sex-tag">{u.sex}</span>}
                              {u.civil_status && <span className="tag civil-tag">{u.civil_status}</span>}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="username-cell">
                        <span className="username-text">{u.username || "N/A"}</span>
                      </td>
                      
                      {isResidentTab ? (
                        <>
                          <td className="contact-cell">
                            {u.mobile_number ? (
                              <a href={`tel:${u.mobile_number}`} className="contact-link">
                                {u.mobile_number}
                              </a>
                            ) : "N/A"}
                          </td>
                          <td className="email-cell">
                            {u.email_address || u.email ? (
                              <a href={`mailto:${u.email_address || u.email}`} className="email-link">
                                {u.email_address || u.email}
                              </a>
                            ) : "N/A"}
                          </td>
                          <td className="barangay-cell">
                            <span className="barangay-text">{u.barangay || "N/A"}</span>
                          </td>
                          <td className="age-cell">
                            <span className="age-number">{u.age || "N/A"}</span>
                          </td>
                          <td className="id-type-cell">
                            <span className="id-type-text">{u.valid_id_type || "N/A"}</span>
                          </td>
                          <td className="id-pic-cell">
                            {u.id_picture ? (
                              <div className="id-image-wrapper">
                                <img 
                                  src={`${baseUrl}/uploads/ids/${u.id_picture}`} 
                                  alt="ID" 
                                  className="id-thumbnail"
                                  onClick={() => setEditModal({show:true, user:u, viewOnly:true, type: type})}
                                />
                                <button 
                                  className="view-image-btn"
                                  onClick={() => setEditModal({show:true, user:u, viewOnly:true, type: type})}
                                >
                                  View
                                </button>
                              </div>
                            ) : (
                              <span className="no-id">No ID</span>
                            )}
                          </td>
                        </>
                      ) : (
                        <td className="contact-cell">
                          {u.contact ? (
                            <a href={`tel:${u.contact}`} className="contact-link">
                              {u.contact}
                            </a>
                          ) : "N/A"}
                        </td>
                      )}

                      <td className="status-cell">
                        <span 
                          className="status-label"
                          style={{
                            backgroundColor: getStatusBgColor(u.status),
                            color: getStatusColor(u.status),
                            borderColor: getStatusColor(u.status)
                          }}
                        >
                          {u.status || "N/A"}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons-wrapper">
                          {u.status === "pending" ? (
                            <>
                              <button 
                                className="action-button approve-btn"
                                onClick={() => setModal({show:true, user:u, action:"accept", type: type})}
                                title="Approve"
                              >
                                <FaCheck />
                                <span>Approve</span>
                              </button>
                              <button 
                                className="action-button reject-btn"
                                onClick={() => setModal({show:true, user:u, action:"reject", type: type})}
                                title="Reject"
                              >
                                <FaTimes />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                className="action-button view-btn"
                                onClick={() => setEditModal({show:true, user:u, viewOnly:true, type: type})}
                                title="View Details"
                              >
                                <FaEye />
                              </button>
                              <button 
                                className="action-button edit-btn"
                                onClick={() => setEditModal({show:true, user:u, viewOnly:false, type: type})}
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="action-button delete-btn"
                                onClick={() => setModal({show:true, user:u, action:"delete", type: type})}
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="table-footer">
            <div className="results-count">
              Showing <span className="count-number">{filteredList.length}</span> of{" "}
              <span className="count-number">{currentList.length}</span> users
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UsersTable;
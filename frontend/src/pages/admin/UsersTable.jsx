const UsersTable = ({
  activeTab,
  pendingStaff,
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
      case "pending-staff": 
        return pendingStaff;
      case "approved-staff": 
        return approvedStaff;
      case "pending-res": 
        return pendingResidents;
      case "approved-res": 
        return approvedResidents;
      case "all-staff": 
        return [...pendingStaff, ...approvedStaff];
      case "all-residents":
        return [...pendingResidents, ...approvedResidents];
      case "all": 
        return [...pendingStaff, ...approvedStaff, ...pendingResidents, ...approvedResidents];
      default: 
        return [];
    }
  })();

  const filteredList = currentList.filter(u => {
    const username = u.username?.toLowerCase() || "";
    const name = u.name?.toLowerCase() || "";
    const full_name = u.full_name?.toLowerCase() || "";
    const contact = u.contact?.toLowerCase() || "";
    const mobile_number = u.mobile_number?.toLowerCase() || "";
    const email_address = u.email_address?.toLowerCase() || "";
    const barangay = u.barangay?.toLowerCase() || "";
    const staff_id = u.staff_id?.toLowerCase() || "";
    
    return username.includes(searchTerm.toLowerCase()) || 
           name.includes(searchTerm.toLowerCase()) || 
           full_name.includes(searchTerm.toLowerCase()) ||
           contact.includes(searchTerm.toLowerCase()) || 
           mobile_number.includes(searchTerm.toLowerCase()) ||
           email_address.includes(searchTerm.toLowerCase()) ||
           barangay.includes(searchTerm.toLowerCase()) ||
           staff_id.includes(searchTerm.toLowerCase());
  });

  const isResidentTab = /res/i.test(activeTab) || activeTab === "all-residents";
  const isStaffTab = /staff/i.test(activeTab) || activeTab === "all-staff";

  // Function para i-compose ang full name
  const getFullName = (user) => {
    if (user.name) return user.name; // For staff
    
    // For residents
    const parts = [
      user.first_name,
      user.middle_name,
      user.last_name,
      user.suffix
    ].filter(part => part && part.trim() !== "");
    
    return parts.join(' ');
  };

  return (
    <>
      <input 
        type="text" 
        placeholder="Search by name, username, contact, email, barangay, or staff ID..." 
        className="admin-search" 
        value={searchTerm} 
        onChange={e => setSearchTerm(e.target.value)}
      />
      
      {filteredList.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              {isStaffTab && <th>Staff ID</th>}
              <th>Full Name</th>
              <th>Username</th>
              {isResidentTab ? (
                <>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Barangay</th>
                  <th>Age</th>
                  <th>ID Type</th>
                  <th>ID Picture</th>
                </>
              ) : (
                <th>Contact</th>
              )}
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map(u => {
              const isResident = 'first_name' in u || 'full_name' in u;
              const type = isResident ? "resident" : "staff";
              
              return (
                <tr key={u.id} style={{backgroundColor: u.status === "pending" ? "#fff3cd" : "#d4edda"}}>
                  {isStaffTab && <td>{u.staff_id || "N/A"}</td>}
                  <td>
                    {getFullName(u)}
                    {isResident && (
                      <div style={{fontSize: '12px', color: '#666'}}>
                        {u.sex} • {u.civil_status}
                      </div>
                    )}
                  </td>
                  <td>{u.username || "N/A"}</td>
                  
                  {isResidentTab ? (
                    <>
                      <td>{u.mobile_number || "N/A"}</td>
                      <td>{u.email_address || u.email || "N/A"}</td>
                      <td>{u.barangay || "N/A"}</td>
                      <td>{u.age || "N/A"}</td>
                      <td>{u.valid_id_type || "N/A"}</td>
                      <td>
                        {u.id_picture ? (
                          <img 
                            src={`${baseUrl}/uploads/ids/${u.id_picture}`} 
                            alt="ID" 
                            style={{
                              width:"60px", 
                              height:"60px", 
                              objectFit:"cover", 
                              borderRadius:"4px", 
                              cursor:"pointer",
                              border: "1px solid #ddd"
                            }}
                            onClick={() => setEditModal({show:true, user:u, viewOnly:true, type: type})}
                            title="Click to view details"
                          />
                        ) : "N/A"}
                      </td>
                    </>
                  ) : (
                    <td>{u.contact || "N/A"}</td>
                  )}

                  <td>
                    <span className={`status-badge ${u.status}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {u.status === "pending" ? (
                        <>
                          <button 
                            className="btn-accept" 
                            onClick={() => setModal({show:true, user:u, action:"accept", type: type})}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn-reject" 
                            onClick={() => setModal({show:true, user:u, action:"reject", type: type})}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className="btn-view" 
                            onClick={() => setEditModal({show:true, user:u, viewOnly:true, type: type})}
                            title="View Full Details"
                          >
                            View
                          </button>
                          <button 
                            className="btn-edit" 
                            onClick={() => setEditModal({show:true, user:u, viewOnly:false, type: type})}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn-delete" 
                            onClick={() => setModal({show:true, user:u, action:"delete", type: type})}
                          >
                            Delete
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
      )}
    </>
  );
};

export default UsersTable;
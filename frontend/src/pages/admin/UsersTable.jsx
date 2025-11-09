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
      case "all-residents": // IDAGDAG ITO
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
    const contact = u.contact?.toLowerCase() || "";
    const full_name = u.full_name?.toLowerCase() || "";
    const staff_id = u.staff_id?.toLowerCase() || "";
    return username.includes(searchTerm.toLowerCase()) || 
           name.includes(searchTerm.toLowerCase()) || 
           contact.includes(searchTerm.toLowerCase()) || 
           full_name.includes(searchTerm.toLowerCase()) ||
           staff_id.includes(searchTerm.toLowerCase());
  });

  // Baguhin ang logic para matukoy kung resident o staff
  const isResidentTab = /res/i.test(activeTab) || activeTab === "all-residents";
  const isStaffTab = /staff/i.test(activeTab) || activeTab === "all-staff";

  return (
    <>
      <input 
        type="text" 
        placeholder="Search by username, name, contact, or staff ID..." 
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
              <th>Username</th>
              <th>Name</th>
              <th>Contact</th>
              {isResidentTab && <th>ID Picture</th>}
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map(u => (
              <tr key={u.id} style={{backgroundColor: u.status === "pending" ? "#fff3cd" : "#d4edda"}}>
                {isStaffTab && <td>{u.staff_id || "N/A"}</td>}
                <td>{u.username || "N/A"}</td>
                <td>{u.name || u.full_name || "N/A"}</td>
                <td>{u.contact || "N/A"}</td>
                
                {isResidentTab && (
                  <td>
                    {u.id_picture ? (
                      <img 
                        src={`${baseUrl}/uploads/ids/${u.id_picture}`} 
                        alt="ID" 
                        style={{width:"50px", height:"50px", objectFit:"cover", borderRadius:"4px", cursor:"pointer"}}
                        onClick={() => setEditModal({show:true, user:u, viewOnly:true, type: u.full_name ? "resident" : "staff"})}
                      />
                    ) : "N/A"}
                  </td>
                )}

                <td>{u.status}</td>
                <td>
                  {u.status === "pending" ? (
                    <>
                      <button 
                        className="btn-accept" 
                        onClick={() => setModal({show:true, user:u, action:"accept", type: u.name ? "staff" : "resident"})}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn-reject" 
                        onClick={() => setModal({show:true, user:u, action:"reject", type: u.name ? "staff" : "resident"})}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="btn-view" 
                        onClick={() => setEditModal({show:true, user:u, viewOnly:true, type: u.name ? "staff" : "resident"})}
                      >
                        View
                      </button>
                      <button 
                        className="btn-edit" 
                        onClick={() => setEditModal({show:true, user:u, viewOnly:false, type: u.name ? "staff" : "resident"})}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => setModal({show:true, user:u, action:"delete", type: u.name ? "staff" : "resident"})}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default UsersTable;
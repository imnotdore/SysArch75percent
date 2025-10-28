import { useState, useEffect, useRef } from  "react"; // ⬅️ MALI DITO
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaBars, FaTimes, FaUserCheck, FaUserClock, FaTachometerAlt, FaSignOutAlt 
} from "react-icons/fa";
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

  const prevCounts = useRef({ pendingStaff:0, approvedStaff:0, pendingRes:0, approvedRes:0 });

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const sidebarRef = useRef(null);




const handleLogout = async () => {
    try {
      // I-delete ang token/session sa backend
      await axios.post(`${baseUrl}/api/auth/logout`); 
      
      // Opsyonal: I-clear ang anumang local storage/session storage
      localStorage.removeItem('token'); 

      // I-redirect ang user sa login page ('/')
      navigate('/'); 
    } catch (err) {
      console.error("Logout failed:", err);
      // Kahit mag-fail ang server logout, i-redirect pa rin para ma-logout sa client side
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

    // Only update prevCounts after fetching data
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
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) setSidebarOpen(false);
    };
    if (sidebarOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

 // ... (mga imports at state declarations)

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
        } 
        // ⭐ DITO ANG PAGBABAGO/DAGDAG PARA SA RESIDENT APPROVE/REJECT
        else if (action === "accept") {
          endpoint = `${baseUrl}/api/auth/admin/residents/${user.id}/approve`;
          await axios.put(endpoint); 
          setApprovedResidents(prev => [...prev, { ...user, status:"approved" }]);
          setPendingResidents(prev => prev.filter(r => r.id !== user.id));
        } else if (action === "reject") {
          // 🛑 Tiyakin na ang endpoint na ito ay tama sa backend mo para sa pag-reject
          endpoint = `${baseUrl}/api/auth/admin/residents/${user.id}/reject`; // Halimbawa: /residents/123/reject
          await axios.delete(endpoint); // Gumamit ng DELETE or PUT/POST depende sa backend mo, DELETE ang kadalasan.
          setPendingResidents(prev => prev.filter(r => r.id !== user.id)); // Tanggalin sa pending list
        }
      }
      // -------------------------------------------------------------

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
    
    // FIX: Use 'residents' for the URL endpoint if the type is 'resident'
    const endpointType = type === 'resident' ? 'residents' : type; 

    const formData = new FormData();
    formData.append("username", updatedUser.username || "");
    formData.append("contact", updatedUser.contact || "");
    
    // --- Handling Staff 'name' vs Resident 'full_name' ---
    const userFullName = updatedUser.name || updatedUser.full_name || "";

    if (type === "staff") {
      // Staff uses 'name' in the DB
      formData.append("name", userFullName);
    } else if (type === "resident") {
      // Resident uses 'full_name' in the DB
      formData.append("full_name", userFullName); 
    }
    
    // Only append these for residents
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
      // Handle file upload (Wala nang new file upload, gamit na lang ang existing)
        // I-check kung may bago pa ring file sa state (maliit na chance pero mas safe)
      if (updatedUser.id_picture instanceof File) {
        formData.append("id_picture", updatedUser.id_picture);
      }
    }
    // -----------------------------------------------------------------

    const res = await axios.put(
      `${baseUrl}/api/auth/admin/${endpointType}/${updatedUser.id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (res.status === 200) {
      // Update local state for immediate visual feedback
      const updatedData = res.data.data || updatedUser; // Use response data if provided, otherwise local data
      
      if (type==="staff") {
        setApprovedStaff(prev => prev.map(u => u.id===updatedUser.id ? {...u,...updatedData, name: userFullName}:u));
      }
      if (type==="resident") {
        setApprovedResidents(prev => prev.map(u => u.id===updatedUser.id ? {...u,...updatedData, full_name: userFullName}:u));
      }
      
      alert(res.data.message || "Updated successfully");
      setEditModal({ show:false, user:null, viewOnly:false, type:"" });
      fetchData(); // Refetch data to ensure accuracy
    }
  } catch (err) {
    console.error("Error saving:", err);
    alert(`Error saving: ${err.message}. ${err.response?.data?.error || ""}`);
  }
};


  // Dashboard counts
  const totalStaff = pendingStaff.length + approvedStaff.length;
  const totalResidents = pendingResidents.length + approvedResidents.length;

  const currentList = (() => {
  if (activeTab==="pending-staff") return pendingStaff;
  if (activeTab==="approved-staff") return approvedStaff;
  if (activeTab==="pending-res") return pendingResidents;
  if (activeTab==="approved-res") return approvedResidents;
  if (activeTab==="all-staff") return [...pendingStaff, ...approvedStaff];
  if (activeTab==="all-residents") return [...pendingResidents, ...approvedResidents];
  if (activeTab==="all") return [...pendingStaff,...approvedStaff,...pendingResidents,...approvedResidents];
  return [];
})();


  const filteredList = currentList.filter(u => {
    const username = u.username?.toLowerCase() || "";
    const name = u.name?.toLowerCase() || "";
    const contact = u.contact?.toLowerCase() || "";
    const full_name = u.full_name?.toLowerCase() || "";
    return username.includes(searchTerm.toLowerCase()) || name.includes(searchTerm.toLowerCase()) || contact.includes(searchTerm.toLowerCase()) || full_name.includes(searchTerm.toLowerCase());
  });

  // Helper function to check if the current view is for Residents
  const isResidentTab = /res/i.test(activeTab);

  if (loading) return <p className="admin-loading">Loading data...</p>;

  return (
    <div className="admin-wrapper">
      {/* Sidebar */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={()=>setSidebarOpen(false)}></div>}
      <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <FaTimes className="close-icon" onClick={()=>setSidebarOpen(false)} />
        </div>
        <nav className="sidebar-nav">
          <button onClick={()=>setActiveTab("dashboard")} className={activeTab==="dashboard"?"active":""}><FaTachometerAlt/> Dashboard</button>
          <button onClick={()=>setActiveTab("pending-staff")} className={activeTab==="pending-staff"?"active":""}><FaUserClock/> Pending Staff</button>
          <button onClick={()=>setActiveTab("approved-staff")} className={activeTab==="approved-staff"?"active":""}><FaUserCheck/> Approved Staff</button>
          <button onClick={()=>setActiveTab("pending-res")} className={activeTab==="pending-res"?"active":""}><FaUserClock/> Pending Residents</button>
          <button onClick={()=>setActiveTab("approved-res")} className={activeTab==="approved-res"?"active":""}><FaUserCheck/> Approved Residents</button>
          <button onClick={()=>setActiveTab("all")} className={activeTab==="all"?"active":""}>All Users</button>
          <button onClick={handleLogout} className="logout-btn"><FaSignOutAlt/> Logout</button>
        </nav>
      </div>

      {/* Main */}
      <div className="admin-main">
        <header className="admin-header">
          <FaBars className="menu-icon" onClick={()=>setSidebarOpen(true)}/>
          <h1>kunyare dashboard putanginang system ang sakit sa mata</h1>
        </header>

        <div className="admin-content">
          {/* Dashboard Cards */}
{activeTab === "dashboard" && (
  <div className="dashboard-cards">
    
    {/* Total Staff */}
<div className="dashboard-card total-card" onClick={() => setActiveTab("all-staff")}>
  <div className="card-left">
    <div className="icon-wrapper"><FaUserCheck className="icon" /></div>
    <h2>{pendingStaff.length + approvedStaff.length}</h2>
    <span>Total Staff</span>
  </div>
  <div className="card-right">
    <p className="growth">
      {(() => {
        const currentTotal = pendingStaff.length + approvedStaff.length;
        const prevTotal = prevCounts.current.pendingStaff + prevCounts.current.approvedStaff;
        const growth = prevTotal === 0 ? (currentTotal === 0 ? 0 : 100)
          : Math.round(((currentTotal - prevTotal) / prevTotal) * 100);
        return growth > 0 ? `+${growth}%` : `${growth}%`;
      })()}
    </p>
    <span>Growth</span>
  </div>
</div>


    {/* Pending Staff */}
    <div className="dashboard-card pending-card" onClick={() => setActiveTab("pending-staff")}>
      <div className="card-left">
        <div className="icon-wrapper"><FaUserClock className="icon" /></div>
        <h2>{pendingStaff.length}</h2>
        <span>Pending Staff</span>
          </div>
      <div className="card-right">
        <p className="growth">
          {(() => {
            const growth = prevCounts.current.pendingStaff === 0
              ? pendingStaff.length === 0 ? 0 : 100
              : Math.round(((pendingStaff.length - prevCounts.current.pendingStaff) / prevCounts.current.pendingStaff) * 100);
            return growth > 0 ? `+${growth}%` : `${growth}%`;
          })()}
        </p>
        <span>Growth</span>
      </div>
    </div>

    {/* Approved Staff */}
    <div className="dashboard-card approved-card" onClick={() => setActiveTab("approved-staff")}>
      <div className="card-left">
        <div className="icon-wrapper"><FaUserCheck className="icon" /></div>
        <h2>{approvedStaff.length}</h2>
        <span>Approved Staff</span>
      </div>
      <div className="card-right">
        <p className="growth">
          {(() => {
            const growth = prevCounts.current.approvedStaff === 0
              ? approvedStaff.length === 0 ? 0 : 100
              : Math.round(((approvedStaff.length - prevCounts.current.approvedStaff) / prevCounts.current.approvedStaff) * 100);
            return growth > 0 ? `+${growth}%` : `${growth}%`;
          })()}
        </p>
        <span>Growth</span>
      </div>
    </div>

    {/* Total Residents */}
<div className="dashboard-card total-card" onClick={() => setActiveTab("all-residents")}>
  <div className="card-left">
    <div className="icon-wrapper"><FaUserCheck className="icon" /></div>
    <h2>{pendingResidents.length + approvedResidents.length}</h2>
    <span>Total Residents</span>
    </div>
  <div className="card-right">
    <p className="growth">
      {(() => {
        const currentTotal = pendingResidents.length + approvedResidents.length;
        const prevTotal = prevCounts.current.pendingRes + prevCounts.current.approvedRes;
        const growth = prevTotal === 0 ? (currentTotal === 0 ? 0 : 100)
          : Math.round(((currentTotal - prevTotal) / prevTotal) * 100);
        return growth > 0 ? `+${growth}%` : `${growth}%`;
      })()}
    </p>
    <span>Growth</span>
  </div>
</div>


    {/* Pending Residents */}
    <div className="dashboard-card pending-card" onClick={() => setActiveTab("pending-res")}>
      <div className="card-left">
        <div className="icon-wrapper"><FaUserClock className="icon" /></div>
        <h2>{pendingResidents.length}</h2>
        <span>Pending Residents</span>
      </div>
      <div className="card-right">
        <p className="growth">
          {(() => {
            const growth = prevCounts.current.pendingRes === 0
              ? pendingResidents.length === 0 ? 0 : 100
              : Math.round(((pendingResidents.length - prevCounts.current.pendingRes) / prevCounts.current.pendingRes) * 100);
            return growth > 0 ? `+${growth}%` : `${growth}%`;
          })()}
        </p>
        <span>Growth</span>
      </div>
    </div>

    {/* Approved Residents */}
    <div className="dashboard-card approved-card" onClick={() => setActiveTab("approved-res")}>
      <div className="card-left">
        <div className="icon-wrapper"><FaUserCheck className="icon" /></div>
        <h2>{approvedResidents.length}</h2> 
        <span>Approved Residents</span>
      </div>
      <div className="card-right">
        <p className="growth">
          {(() => {
            const growth = prevCounts.current.approvedRes === 0
              ? approvedResidents.length === 0 ? 0 : 100
              : Math.round(((approvedResidents.length - prevCounts.current.approvedRes) / prevCounts.current.approvedRes) * 100);
            return growth > 0 ? `+${growth}%` : `${growth}%`;
          })()}
        </p>
        <span>Growth</span>
        </div>
      </div>
  </div>
)}


          {/* Users Table */}
{activeTab!=="dashboard" && (
  <>
    <input 
      type="text" 
      placeholder="Search..." 
      className="admin-search" 
      value={searchTerm} 
      onChange={e=>setSearchTerm(e.target.value)}
    />
    {filteredList.length===0 ? <p>No users found.</p> :
    <table className="admin-table">
      <thead>
        <tr>
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
          <tr key={u.id} style={{backgroundColor: u.status==="pending"?"#fff3cd":"#d4edda"}}>
            <td>{u.username||"N/A"}</td>
            <td>{u.name||u.full_name||"N/A"}</td>
            <td>{u.contact||"N/A"}</td>
            {/* I-HIDE ANG ID PICTURE COLUMN SA STAFF VIEW */}
            {isResidentTab && (
              <td>
                {u.id_picture ? (
                  <img 
                    src={`${baseUrl}/uploads/ids/${u.id_picture}`} 
                    alt="ID" 
                    style={{width:"50px", height:"50px", objectFit:"cover", borderRadius:"4px", cursor:"pointer"}}
                    // FIX: Palitan ang setEditModal.user.name sa full_name para sa resident
                    onClick={() => setEditModal({show:true, user:u, viewOnly:true, type: u.full_name?"resident":"staff"})}
                  />
                ) : "N/A"}
              </td>
            )}

            <td>{u.status}</td>
           <td>
              {u.status==="pending" ? (
                <>
                  <button 
                    className="btn-accept" 
                    onClick={()=>setModal({show:true,user:u,action:"accept",type: u.name?"staff":"resident"})}
                  >
                    Approve
                  </button>
                  {/* Reject button para sa Staff at Residents na pending */}
                  <button 
                    className="btn-reject" 
                    onClick={()=>setModal({show:true,user:u,action:"reject",type: u.name?"staff":"resident"})}
                  >
                    Reject
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="btn-view" 
                    onClick={()=>setEditModal({show:true,user:u,viewOnly:true,type:u.name?"staff":"resident"})}
                  >
                    View
                  </button>
                  <button 
                    className="btn-edit" 
                    onClick={()=>setEditModal({show:true,user:u,viewOnly:false,type:u.name?"staff":"resident"})}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={()=>setModal({show:true,user:u,action:"delete",type:u.name?"staff":"resident"})}
                  >
                    Delete
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>}
  </>
)}

        </div>
      </div>

      {/* Confirmation Modal */}
      {modal.show && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm {modal.action}</h3>
            <p>Are you sure you want to {modal.action} <strong>{modal.user?.name||modal.user?.full_name||modal.user?.username}</strong>?</p>
            <div className="modal-buttons">
              <button className="btn-accept" onClick={handleAction}>Yes</button>
              <button className="btn-reject" onClick={()=>setModal({show:false,user:null,action:"",type:""})}>Cancel</button>
            </div>
          </div>
        </div>
      )}

{/* Edit / View Modal */}
{editModal.show && (
  <div className="modal-overlay">
    <div className="modal" style={{maxWidth: editModal.type === "resident" ? "600px" : "400px"}}>
      <h3 className="modal-title">{editModal.viewOnly ? "User Details" : "Edit User"}</h3>
      
      {/* ID Picture Preview (Visible only for Residents) */}
      {editModal.type === "resident" && (
        <div style={{marginBottom: "20px"}}>
          <label>ID Picture:</label>
          {/* Check if there's a file object (newly selected) or a string (existing image) */}
          {
            (editModal.user?.id_picture instanceof File) ? (
              <img 
                src={URL.createObjectURL(editModal.user.id_picture)} 
                alt="New ID" 
                className="id-preview" 
                style={{width:"220px", height:"150px", objectFit:"cover", marginBottom:"10px"}}
              />
            ) : (editModal.user?.id_picture) && (
              <img 
                src={`${baseUrl}/uploads/ids/${editModal.user.id_picture}`} 
                alt="Existing ID" 
                className="id-preview" 
                style={{width:"220px", height:"150px", objectFit:"cover", marginBottom:"10px"}}
              />
            )
          }
          
          {/* TANGGALIN ANG UPLOAD FIELD PARA HINDI NA MABABAGO ANG PICTURE SA EDIT */}
          {/* {!editModal.viewOnly && (
            <div>
              <p style={{fontSize: '0.8em', color: '#666'}}>Select a new file to replace the current one.</p>
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => setEditModal(prev => ({...prev, user:{...prev.user, id_picture:e.target.files[0]}}))}
              />
            </div>
          )} */}
        </div>
      )}
      
      <div className="modal-content" style={{display:'grid', gridTemplateColumns: editModal.type === "resident" ? "1fr 1fr" : "1fr"}}>
        
        {/* USERNAME */}
        <div className="form-group">
          <label>Username:</label>
          <input 
            type="text" 
            value={editModal.user?.username || ""} 
            readOnly={editModal.viewOnly} 
            onChange={e => !editModal.viewOnly && setEditModal(prev => ({...prev, user:{...prev.user, username:e.target.value}}))}
          />
        </div>

        {/* NAME (Staff) / FULL NAME (Resident) */}
        <div className="form-group">
          <label>{editModal.type === "staff" ? "Staff Name" : "Full Name"}:</label>
          <input 
            type="text" 
            value={editModal.user?.name || editModal.user?.full_name || ""} 
            readOnly={editModal.viewOnly} 
            // FIX: Update the correct field (name for staff, full_name for resident)
            onChange={e => !editModal.viewOnly && setEditModal(prev => ({...prev, user:{...prev.user, [editModal.type==="staff"?"name":"full_name"]:e.target.value}}))}
          />
        </div>

        {/* CONTACT */}
        <div className="form-group">
          <label>Contact:</label>
          <input 
            type="text" 
            value={editModal.user?.contact || ""} 
            readOnly={editModal.viewOnly} 
            onChange={e => !editModal.viewOnly && setEditModal(prev => ({...prev, user:{...prev.user, contact:e.target.value}}))}
          />
        </div>
        
        {/* RESIDENT-ONLY FIELDS (I-hide sa Staff) */}
        {editModal.type === "resident" && (
          <>
            <div className="form-group">
              <label>Address:</label>
              <input 
                type="text" 
                value={editModal.user?.address || ""} 
                readOnly={editModal.viewOnly} 
                onChange={e => !editModal.viewOnly && setEditModal(prev => ({...prev, user:{...prev.user, address:e.target.value}}))}
              />
            </div>

            <div className="form-group">
              <label>Age:</label>
              <input 
                type="number" 
                value={editModal.user?.age || ""} 
                readOnly={editModal.viewOnly} 
                onChange={e => !editModal.viewOnly && setEditModal(prev => ({...prev, user:{...prev.user, age:e.target.value}}))}
              />
            </div>

            <div className="form-group">
              <label>Gender:</label>
              <input 
                type="text" 
                value={editModal.user?.gender || ""} 
                readOnly={editModal.viewOnly} 
                onChange={e => !editModal.viewOnly && setEditModal(prev => ({...prev, user:{...prev.user, gender:e.target.value}}))}
              />
            </div>

            <div className="form-group">
              <label>Civil Status:</label>
              <input 
                type="text" 
                value={editModal.user?.civil_status || ""} 
                readOnly={editModal.viewOnly} 
                onChange={e => !editModal.viewOnly && setEditModal(prev => ({...prev, user:{...prev.user, civil_status:e.target.value}}))}
              />
            </div>

            <div className="form-group">
              <label>Youth Classification:</label>
              <input 
                type="text" 
                value={editModal.user?.youth_classification || ""} 
                readOnly={editModal.viewOnly} 
                onChange={e => !editModal.viewOnly && setEditModal(prev => ({...prev, user:{...prev.user, youth_classification:e.target.value}}))}
              />
            </div>

            <div className="form-group">
              <label>Education:</label>
              <input 
                type="text" 
                value={editModal.user?.education || ""} 
                readOnly={editModal.viewOnly} 
                onChange={e => !editModal.viewOnly && setEditModal(prev => ({...prev, user:{...prev.user, education:e.target.value}}))}
              />
            </div>

            <div className="form-group">
              <label>Registered SK:</label>
              <input 
                type="text" 
                value={editModal.user?.registered_sk || ""} 
                readOnly={editModal.viewOnly} 
                onChange={e => !editModal.viewOnly && setEditModal(prev => ({...prev, user:{...prev.user, registered_sk:e.target.value}}))}
              />
            </div>

            <div className="form-group">
              <label>Registered National:</label>
              <input 
                type="text" 
                value={editModal.user?.registered_national || ""} 
                readOnly={editModal.viewOnly} 
                onChange={e => !editModal.viewOnly && setEditModal(prev => ({...prev, user:{...prev.user, registered_national:e.target.value}}))}
              />
            </div>

            <div className="form-group">
              <label>Birthday:</label>
              <input 
                type="date" 
                value={editModal.user?.birthday?.split("T")[0] || ""} 
                readOnly={editModal.viewOnly} 
                onChange={e => !editModal.viewOnly && setEditModal(prev => ({...prev, user:{...prev.user, birthday:e.target.value}}))}
              />
            </div>
          </>
        )}
       
      </div>

      <div className="modal-buttons">
        {!editModal.viewOnly && (
          <button className="btn-accept" onClick={() => handleSaveEdit(editModal.user)}>Save</button>
        )}
        <button className="btn-reject" onClick={() => setEditModal({show:false,user:null,viewOnly:false,type:""})}>
          {editModal.viewOnly ? "Close" : "Cancel"}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
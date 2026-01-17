const EditUserModal = ({ editModal, setEditModal, baseUrl, handleSaveEdit }) => {
  if (!editModal.show) return null;

  const handleFieldChange = (field, value) => {
    if (editModal.viewOnly) return;
    
    setEditModal(prev => ({
      ...prev,
      user: {
        ...prev.user,
        [field]: value
      }
    }));
  };

  const isResident = editModal.type === "resident";

  // Function para i-compose ang full name
  const getFullName = () => {
    if (!editModal.user) return "";
    
    if (editModal.user.name) return editModal.user.name; // Staff
    
    // Resident
    const parts = [
      editModal.user.first_name,
      editModal.user.middle_name,
      editModal.user.last_name,
      editModal.user.suffix
    ].filter(part => part && part.trim() !== "");
    
    return parts.join(' ');
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{maxWidth: isResident ? "800px" : "500px"}}>
        <h3 className="modal-title">
          {editModal.viewOnly ? "User Details" : "Edit User"}
          {isResident && (
            <span style={{fontSize: '14px', color: '#666', marginLeft: '10px'}}>
              ID: {editModal.user?.id || 'N/A'}
            </span>
          )}
        </h3>
        
        {/* ID Picture for Residents */}
        {isResident && editModal.user?.id_picture && (
          <div style={{marginBottom: "20px", textAlign: 'center'}}>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
              ID Picture:
            </label>
            <img 
              src={`${baseUrl}/uploads/ids/${editModal.user.id_picture}`} 
              alt="ID" 
              className="id-preview" 
              style={{
                width:"250px", 
                height:"180px", 
                objectFit:"cover", 
                borderRadius:"8px",
                border: "2px solid #e0e0e0"
              }}
            />
            <div style={{marginTop: '8px', fontSize: '14px', color: '#666'}}>
              ID Type: <strong>{editModal.user?.valid_id_type || 'N/A'}</strong> • 
              ID No: <strong>{editModal.user?.valid_id_number || 'N/A'}</strong>
            </div>
          </div>
        )}
        
        <div className="modal-content" style={{
          display: 'grid', 
          gridTemplateColumns: isResident ? "1fr 1fr" : "1fr",
          gap: "15px",
          maxHeight: "60vh",
          overflowY: "auto",
          paddingRight: "10px"
        }}>
          
          {/* Staff ID Field (for staff only) */}
          {!isResident && (
            <div className="form-group">
              <label>Staff ID:</label>
              <input 
                type="text" 
                value={editModal.user?.staff_id || ""} 
                readOnly={editModal.viewOnly} 
                onChange={e => handleFieldChange("staff_id", e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Username:</label>
            <input 
              type="text" 
              value={editModal.user?.username || ""} 
              readOnly={editModal.viewOnly} 
              onChange={e => handleFieldChange("username", e.target.value)}
            />
          </div>

          {isResident ? (
            // Resident Fields
            <>
              <div className="form-group">
                <label>First Name:</label>
                <input 
                  type="text" 
                  value={editModal.user?.first_name || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("first_name", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Middle Name:</label>
                <input 
                  type="text" 
                  value={editModal.user?.middle_name || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("middle_name", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Last Name:</label>
                <input 
                  type="text" 
                  value={editModal.user?.last_name || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("last_name", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Suffix:</label>
                <input 
                  type="text" 
                  value={editModal.user?.suffix || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("suffix", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Sex:</label>
                <select 
                  value={editModal.user?.sex || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("sex", e.target.value)}
                  className={`form-select ${editModal.viewOnly ? 'readonly' : ''}`}
                  disabled={editModal.viewOnly}
                >
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="form-group">
                <label>Birthday:</label>
                <input 
                  type="date" 
                  value={editModal.user?.birthday?.split("T")[0] || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("birthday", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Age:</label>
                <input 
                  type="number" 
                  value={editModal.user?.age || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("age", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Civil Status:</label>
                <select 
                  value={editModal.user?.civil_status || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("civil_status", e.target.value)}
                  className={`form-select ${editModal.viewOnly ? 'readonly' : ''}`}
                  disabled={editModal.viewOnly}
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>

              <div className="form-group">
                <label>Citizenship:</label>
                <input 
                  type="text" 
                  value={editModal.user?.citizenship || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("citizenship", e.target.value)}
                />
              </div>

              {/* Address Information */}
              <div className="form-group" style={{gridColumn: "span 2"}}>
                <h4 style={{margin: "15px 0 10px 0", color: "#444", borderBottom: "1px solid #eee", paddingBottom: "5px"}}>
                  Address Information
                </h4>
              </div>

              <div className="form-group">
                <label>House No./Street:</label>
                <input 
                  type="text" 
                  value={editModal.user?.house_no_street || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("house_no_street", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Purok/Sitio:</label>
                <input 
                  type="text" 
                  value={editModal.user?.purok_sitio || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("purok_sitio", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Barangay:</label>
                <input 
                  type="text" 
                  value={editModal.user?.barangay || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("barangay", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>City/Municipality:</label>
                <input 
                  type="text" 
                  value={editModal.user?.city_municipality || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("city_municipality", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Province:</label>
                <input 
                  type="text" 
                  value={editModal.user?.province || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("province", e.target.value)}
                />
              </div>

              {/* Contact Information */}
              <div className="form-group" style={{gridColumn: "span 2"}}>
                <h4 style={{margin: "15px 0 10px 0", color: "#444", borderBottom: "1px solid #eee", paddingBottom: "5px"}}>
                  Contact Information
                </h4>
              </div>

              <div className="form-group">
                <label>Mobile Number:</label>
                <input 
                  type="text" 
                  value={editModal.user?.mobile_number || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("mobile_number", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email Address:</label>
                <input 
                  type="email" 
                  value={editModal.user?.email_address || editModal.user?.email || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("email_address", e.target.value)}
                />
              </div>

              {/* Household Information */}
              <div className="form-group" style={{gridColumn: "span 2"}}>
                <h4 style={{margin: "15px 0 10px 0", color: "#444", borderBottom: "1px solid #eee", paddingBottom: "5px"}}>
                  Household Information
                </h4>
              </div>

              <div className="form-group">
                <label>Household ID:</label>
                <input 
                  type="text" 
                  value={editModal.user?.household_id || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("household_id", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Family Role:</label>
                <input 
                  type="text" 
                  value={editModal.user?.family_role || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("family_role", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Household Members:</label>
                <input 
                  type="number" 
                  value={editModal.user?.household_members || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("household_members", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Name:</label>
                <input 
                  type="text" 
                  value={editModal.user?.emergency_contact_name || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("emergency_contact_name", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Number:</label>
                <input 
                  type="text" 
                  value={editModal.user?.emergency_contact_number || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("emergency_contact_number", e.target.value)}
                />
              </div>

              {/* System Information */}
              <div className="form-group" style={{gridColumn: "span 2"}}>
                <h4 style={{margin: "15px 0 10px 0", color: "#444", borderBottom: "1px solid #eee", paddingBottom: "5px"}}>
                  System Information
                </h4>
              </div>

              <div className="form-group">
                <label>Status:</label>
                <input 
                  type="text" 
                  value={editModal.user?.status || ""} 
                  readOnly
                  className="readonly"
                />
              </div>

              <div className="form-group">
                <label>Registration Date:</label>
                <input 
                  type="text" 
                  value={editModal.user?.created_at ? new Date(editModal.user.created_at).toLocaleDateString() : ""} 
                  readOnly
                  className="readonly"
                />
              </div>
            </>
          ) : (
            // Staff Fields
            <>
              <div className="form-group">
                <label>Staff Name:</label>
                <input 
                  type="text" 
                  value={editModal.user?.name || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("name", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Contact:</label>
                <input 
                  type="text" 
                  value={editModal.user?.contact || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("contact", e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="modal-buttons">
          {!editModal.viewOnly && (
            <button className="btn-accept" onClick={() => handleSaveEdit(editModal.user)}>
              Save Changes
            </button>
          )}
          <button className="btn-reject" onClick={() => setEditModal({show:false, user:null, viewOnly:false, type:""})}>
            {editModal.viewOnly ? "Close" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
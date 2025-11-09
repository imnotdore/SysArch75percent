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

  return (
    <div className="modal-overlay">
      <div className="modal" style={{maxWidth: isResident ? "600px" : "400px"}}>
        <h3 className="modal-title">{editModal.viewOnly ? "User Details" : "Edit User"}</h3>
        
        {/* ID Picture for Residents */}
        {isResident && (
          <div style={{marginBottom: "20px"}}>
            <label>ID Picture:</label>
            {editModal.user?.id_picture && (
              <img 
                src={`${baseUrl}/uploads/ids/${editModal.user.id_picture}`} 
                alt="Existing ID" 
                className="id-preview" 
                style={{width:"220px", height:"150px", objectFit:"cover", marginBottom:"10px"}}
              />
            )}
          </div>
        )}
        
        <div className="modal-content" style={{display:'grid', gridTemplateColumns: isResident ? "1fr 1fr" : "1fr"}}>
          
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

          <div className="form-group">
            <label>{isResident ? "Full Name" : "Staff Name"}:</label>
            <input 
              type="text" 
              value={editModal.user?.name || editModal.user?.full_name || ""} 
              readOnly={editModal.viewOnly} 
              onChange={e => handleFieldChange(isResident ? "full_name" : "name", e.target.value)}
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
          
          {/* Resident-only fields */}
          {isResident && (
            <>
              <div className="form-group">
                <label>Address:</label>
                <input 
                  type="text" 
                  value={editModal.user?.address || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("address", e.target.value)}
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
                <label>Gender:</label>
                <input 
                  type="text" 
                  value={editModal.user?.gender || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("gender", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Civil Status:</label>
                <input 
                  type="text" 
                  value={editModal.user?.civil_status || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("civil_status", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Youth Classification:</label>
                <input 
                  type="text" 
                  value={editModal.user?.youth_classification || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("youth_classification", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Education:</label>
                <input 
                  type="text" 
                  value={editModal.user?.education || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("education", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Registered SK:</label>
                <input 
                  type="text" 
                  value={editModal.user?.registered_sk || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("registered_sk", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Registered National:</label>
                <input 
                  type="text" 
                  value={editModal.user?.registered_national || ""} 
                  readOnly={editModal.viewOnly} 
                  onChange={e => handleFieldChange("registered_national", e.target.value)}
                />
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
            </>
          )}
        </div>

        <div className="modal-buttons">
          {!editModal.viewOnly && (
            <button className="btn-accept" onClick={() => handleSaveEdit(editModal.user)}>
              Save
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
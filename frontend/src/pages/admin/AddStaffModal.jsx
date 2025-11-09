const AddStaffModal = ({ showAddStaffModal, setShowAddStaffModal, newStaff, setNewStaff, handleAddStaff }) => {
  if (!showAddStaffModal) return null;

  const handleInputChange = (field, value) => {
    setNewStaff(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateStaffId = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `STAFF${timestamp}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Create New Staff Account</h3>
        <div className="modal-content">
          <div className="form-group">
            <label>Staff ID *</label>
            <input 
              type="text" 
              value={newStaff.staff_id || generateStaffId()}
              onChange={e => handleInputChange("staff_id", e.target.value)}
              placeholder="Staff ID will be auto-generated"
              readOnly
            />
            <small style={{fontSize: '12px', color: '#666'}}>Staff can login using this ID or username</small>
          </div>
          <div className="form-group">
            <label>Username *</label>
            <input 
              type="text" 
              value={newStaff.username}
              onChange={e => handleInputChange("username", e.target.value)}
              placeholder="Enter username"
            />
          </div>
          <div className="form-group">
            <label>Full Name *</label>
            <input 
              type="text" 
              value={newStaff.name}
              onChange={e => handleInputChange("name", e.target.value)}
              placeholder="Enter full name"
            />
          </div>
          <div className="form-group">
            <label>Contact</label>
            <input 
              type="text" 
              value={newStaff.contact}
              onChange={e => handleInputChange("contact", e.target.value)}
              placeholder="Enter contact number"
            />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input 
              type="password" 
              value={newStaff.password}
              onChange={e => handleInputChange("password", e.target.value)}
              placeholder="Enter password"
            />
          </div>
        </div>
        <div className="modal-buttons">
          <button className="btn-accept" onClick={handleAddStaff}>
            Create Staff Account
          </button>
          <button className="btn-reject" onClick={() => setShowAddStaffModal(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStaffModal;
import React from "react";
import { FaTimes, FaUser, FaKey, FaIdCard, FaPhone, FaUserCircle } from "react-icons/fa";

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

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddStaff();
  };

  const closeModal = () => {
    setShowAddStaffModal(false);
    // Reset form
    setNewStaff({
      staff_id: '',
      username: '',
      name: '',
      contact: '',
      password: ''
    });
  };

  return (
    <div className="modal-overlay">
      <div className="add-staff-modal">
        <div className="modal-header">
          <div className="modal-title-section">
            <h3 className="modal-title">Create New Staff Account</h3>
            <p className="modal-subtitle">Add a new staff member to the system</p>
          </div>
          <button className="close-modal-btn" onClick={closeModal}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-sections">
              {/* Account Information */}
              <div className="form-section">
                <div className="section-header">
                  <FaUser className="section-icon" />
                  <h4>Account Information</h4>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <FaIdCard className="field-icon" />
                      Staff ID *
                    </label>
                    <div className="input-with-hint">
                      <input 
                        type="text" 
                        value={newStaff.staff_id || generateStaffId()}
                        onChange={e => handleInputChange("staff_id", e.target.value)}
                        placeholder="Auto-generated"
                        readOnly
                        className="readonly-input"
                      />
                      <div className="input-hint">
                        Staff can login using this ID or username
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <FaUserCircle className="field-icon" />
                      Username *
                    </label>
                    <input 
                      type="text" 
                      value={newStaff.username}
                      onChange={e => handleInputChange("username", e.target.value)}
                      placeholder="Enter username"
                      required
                    />
                    {newStaff.username && (
                      <div className="input-validation">
                        <span className="valid-icon">✓</span>
                        {newStaff.username.length >= 3 ? "Valid username" : "Must be at least 3 characters"}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      <FaKey className="field-icon" />
                      Password *
                    </label>
                    <div className="password-input-wrapper">
                      <input 
                        type="password" 
                        value={newStaff.password}
                        onChange={e => handleInputChange("password", e.target.value)}
                        placeholder="Enter password"
                        required
                        minLength="6"
                      />
                      {newStaff.password && (
                        <div className="password-strength">
                          <div className={`strength-bar ${newStaff.password.length >= 8 ? 'strong' : newStaff.password.length >= 6 ? 'medium' : 'weak'}`}></div>
                          <span className="strength-text">
                            {newStaff.password.length >= 8 ? 'Strong' : newStaff.password.length >= 6 ? 'Medium' : 'Weak'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="password-hint">
                      Password must be at least 6 characters long
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="form-section">
                <div className="section-header">
                  <FaUser className="section-icon" />
                  <h4>Personal Information</h4>
                </div>
                
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>
                      <FaUserCircle className="field-icon" />
                      Full Name *
                    </label>
                    <input 
                      type="text" 
                      value={newStaff.name}
                      onChange={e => handleInputChange("name", e.target.value)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FaPhone className="field-icon" />
                      Contact Number
                    </label>
                    <input 
                      type="tel" 
                      value={newStaff.contact}
                      onChange={e => handleInputChange("contact", e.target.value)}
                      placeholder="Enter contact number"
                      pattern="[0-9]{10,11}"
                    />
                    <div className="input-hint">
                      Format: 09XXXXXXXXX (10-11 digits)
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="requirements-section">
                <h5>Password Requirements:</h5>
                <ul className="requirements-list">
                  <li className={newStaff.password.length >= 6 ? 'met' : ''}>
                    ✓ At least 6 characters long
                  </li>
                  <li className={/[A-Z]/.test(newStaff.password) ? 'met' : ''}>
                    {/[A-Z]/.test(newStaff.password) ? '✓' : '○'} Contains uppercase letter
                  </li>
                  <li className={/[a-z]/.test(newStaff.password) ? 'met' : ''}>
                    {/[a-z]/.test(newStaff.password) ? '✓' : '○'} Contains lowercase letter
                  </li>
                  <li className={/\d/.test(newStaff.password) ? 'met' : ''}>
                    {/\d/.test(newStaff.password) ? '✓' : '○'} Contains number
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={closeModal}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="create-btn"
              disabled={!newStaff.username || !newStaff.name || !newStaff.password}
            >
              Create Staff Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;
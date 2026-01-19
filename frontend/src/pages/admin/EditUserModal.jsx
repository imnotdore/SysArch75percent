import React from "react";
import { FaTimes, FaUser, FaHome, FaPhone, FaUsers, FaInfoCircle, FaCalendarAlt } from "react-icons/fa";

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

  const getFullName = () => {
    if (!editModal.user) return "";
    
    if (editModal.user.name) return editModal.user.name;
    
    const parts = [
      editModal.user.first_name,
      editModal.user.middle_name,
      editModal.user.last_name,
      editModal.user.suffix
    ].filter(part => part && part.trim() !== "");
    
    return parts.join(' ');
  };

  const closeModal = () => {
    setEditModal({show:false, user:null, viewOnly:false, type:""});
  };

  return (
    <div className="modal-overlay">
      <div className="edit-modal">
        <div className="modal-header">
          <div className="modal-title-section">
            <h3 className="modal-title">
              {editModal.viewOnly ? "User Details" : "Edit User"}
            </h3>
            <p className="modal-subtitle">{getFullName()}</p>
          </div>
          <button className="close-modal-btn" onClick={closeModal}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {/* ID Picture Section for Residents */}
          {isResident && editModal.user?.id_picture && (
            <div className="id-picture-section">
              <div className="section-header">
                <FaUser className="section-icon" />
                <h4>ID Verification</h4>
              </div>
              <div className="id-preview-wrapper">
                <img 
                  src={`${baseUrl}/uploads/ids/${editModal.user.id_picture}`} 
                  alt="ID" 
                  className="id-preview-image"
                />
                <div className="id-info">
                  <div className="info-row">
                    <span className="info-label">ID Type:</span>
                    <span className="info-value">{editModal.user?.valid_id_type || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">ID Number:</span>
                    <span className="info-value">{editModal.user?.valid_id_number || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="form-sections">
            {/* Personal Information Section */}
            <div className="form-section">
              <div className="section-header">
                <FaUser className="section-icon" />
                <h4>Personal Information</h4>
              </div>
              <div className="form-grid">
                {isResident ? (
                  <>
                    <div className="form-group">
                      <label>First Name</label>
                      <input 
                        type="text" 
                        value={editModal.user?.first_name || ""} 
                        readOnly={editModal.viewOnly} 
                        onChange={e => handleFieldChange("first_name", e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Middle Name</label>
                      <input 
                        type="text" 
                        value={editModal.user?.middle_name || ""} 
                        readOnly={editModal.viewOnly} 
                        onChange={e => handleFieldChange("middle_name", e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Last Name</label>
                      <input 
                        type="text" 
                        value={editModal.user?.last_name || ""} 
                        readOnly={editModal.viewOnly} 
                        onChange={e => handleFieldChange("last_name", e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Suffix</label>
                      <input 
                        type="text" 
                        value={editModal.user?.suffix || ""} 
                        readOnly={editModal.viewOnly} 
                        onChange={e => handleFieldChange("suffix", e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Sex</label>
                      <select 
                        value={editModal.user?.sex || ""} 
                        disabled={editModal.viewOnly} 
                        onChange={e => handleFieldChange("sex", e.target.value)}
                      >
                        <option value="">Select Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Birthday</label>
                      <input 
                        type="date" 
                        value={editModal.user?.birthday?.split("T")[0] || ""} 
                        readOnly={editModal.viewOnly} 
                        onChange={e => handleFieldChange("birthday", e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Age</label>
                      <input 
                        type="number" 
                        value={editModal.user?.age || ""} 
                        readOnly={editModal.viewOnly} 
                        onChange={e => handleFieldChange("age", e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Civil Status</label>
                      <select 
                        value={editModal.user?.civil_status || ""} 
                        disabled={editModal.viewOnly} 
                        onChange={e => handleFieldChange("civil_status", e.target.value)}
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Citizenship</label>
                      <input 
                        type="text" 
                        value={editModal.user?.citizenship || ""} 
                        readOnly={editModal.viewOnly} 
                        onChange={e => handleFieldChange("citizenship", e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Staff ID</label>
                      <input 
                        type="text" 
                        value={editModal.user?.staff_id || ""} 
                        readOnly={editModal.viewOnly} 
                        onChange={e => handleFieldChange("staff_id", e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        value={editModal.user?.name || ""} 
                        readOnly={editModal.viewOnly} 
                        onChange={e => handleFieldChange("name", e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Contact</label>
                      <input 
                        type="text" 
                        value={editModal.user?.contact || ""} 
                        readOnly={editModal.viewOnly} 
                        onChange={e => handleFieldChange("contact", e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Account Information (Common for both) */}
                <div className="form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    value={editModal.user?.username || ""} 
                    readOnly={editModal.viewOnly} 
                    onChange={e => handleFieldChange("username", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Address Information Section (Residents only) */}
            {isResident && (
              <div className="form-section">
                <div className="section-header">
                  <FaHome className="section-icon" />
                  <h4>Address Information</h4>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>House No./Street</label>
                    <input 
                      type="text" 
                      value={editModal.user?.house_no_street || ""} 
                      readOnly={editModal.viewOnly} 
                      onChange={e => handleFieldChange("house_no_street", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Purok/Sitio</label>
                    <input 
                      type="text" 
                      value={editModal.user?.purok_sitio || ""} 
                      readOnly={editModal.viewOnly} 
                      onChange={e => handleFieldChange("purok_sitio", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Barangay</label>
                    <input 
                      type="text" 
                      value={editModal.user?.barangay || ""} 
                      readOnly={editModal.viewOnly} 
                      onChange={e => handleFieldChange("barangay", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>City/Municipality</label>
                    <input 
                      type="text" 
                      value={editModal.user?.city_municipality || ""} 
                      readOnly={editModal.viewOnly} 
                      onChange={e => handleFieldChange("city_municipality", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Province</label>
                    <input 
                      type="text" 
                      value={editModal.user?.province || ""} 
                      readOnly={editModal.viewOnly} 
                      onChange={e => handleFieldChange("province", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information Section (Residents only) */}
            {isResident && (
              <div className="form-section">
                <div className="section-header">
                  <FaPhone className="section-icon" />
                  <h4>Contact Information</h4>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input 
                      type="text" 
                      value={editModal.user?.mobile_number || ""} 
                      readOnly={editModal.viewOnly} 
                      onChange={e => handleFieldChange("mobile_number", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      value={editModal.user?.email_address || editModal.user?.email || ""} 
                      readOnly={editModal.viewOnly} 
                      onChange={e => handleFieldChange("email_address", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Household Information Section (Residents only) */}
            {isResident && (
              <div className="form-section">
                <div className="section-header">
                  <FaUsers className="section-icon" />
                  <h4>Household Information</h4>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Household ID</label>
                    <input 
                      type="text" 
                      value={editModal.user?.household_id || ""} 
                      readOnly={editModal.viewOnly} 
                      onChange={e => handleFieldChange("household_id", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Family Role</label>
                    <input 
                      type="text" 
                      value={editModal.user?.family_role || ""} 
                      readOnly={editModal.viewOnly} 
                      onChange={e => handleFieldChange("family_role", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Household Members</label>
                    <input 
                      type="number" 
                      value={editModal.user?.household_members || ""} 
                      readOnly={editModal.viewOnly} 
                      onChange={e => handleFieldChange("household_members", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Emergency Contact Name</label>
                    <input 
                      type="text" 
                      value={editModal.user?.emergency_contact_name || ""} 
                      readOnly={editModal.viewOnly} 
                      onChange={e => handleFieldChange("emergency_contact_name", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Emergency Contact Number</label>
                    <input 
                      type="text" 
                      value={editModal.user?.emergency_contact_number || ""} 
                      readOnly={editModal.viewOnly} 
                      onChange={e => handleFieldChange("emergency_contact_number", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* System Information Section */}
            <div className="form-section">
              <div className="section-header">
                <FaInfoCircle className="section-icon" />
                <h4>System Information</h4>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">User ID:</span>
                  <span className="info-value">{editModal.user?.id || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`status-badge ${editModal.user?.status?.toLowerCase()}`}>
                    {editModal.user?.status || "N/A"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Registration Date:</span>
                  <span className="info-value">
                    {editModal.user?.created_at ? new Date(editModal.user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : "N/A"}
                  </span>
                </div>
                {editModal.user?.last_login && (
                  <div className="info-item">
                    <span className="info-label">Last Login:</span>
                    <span className="info-value">
                      {new Date(editModal.user.last_login).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {!editModal.viewOnly && (
            <button className="save-btn" onClick={() => handleSaveEdit(editModal.user)}>
              Save Changes
            </button>
          )}
          <button className="close-btn" onClick={closeModal}>
            {editModal.viewOnly ? "Close" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
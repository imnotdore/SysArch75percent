

// TODO: dagdagan yung css niya para mas accurate sa design
import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import '../styles/Register.css';
import ReCAPTCHA from "react-google-recaptcha";
import { 
  FaUserCircle, 
  FaEye, 
  FaEyeSlash, 
  FaCheck,
  FaUsers, 
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaHome,
  FaIdCard,
  FaRobot,
  FaShieldAlt,
  FaExclamationTriangle,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaFileUpload,
  FaSignInAlt,
  FaSync,
} from "react-icons/fa";

// ============ MEMOIZED COMPONENTS ============
const StepIndicator = memo(({ currentStep, totalSteps }) => (
  <div className="step-indicator">
    <div className="progress-line"></div>
    {[1, 2, 3, 4, 5, 6, 7].map((step) => (
      <div key={step} className="step-container">
        <div className={`step-dot ${step <= currentStep ? 'active' : ''} ${step === currentStep ? 'current' : ''}`}>
          {step}
        </div>
        <div className="step-label">
          {step === 1 && "Personal"}
          {step === 2 && "Address"}
          {step === 3 && "Contact"}
          {step === 4 && "ID"}
          {step === 5 && "Account"}
          {step === 6 && "Family"}
          {step === 7 && "Verify"}
        </div>
      </div>
    ))}
  </div>
));

const PasswordRequirement = memo(({ met, text }) => (
  <div className="password-requirement">
    {met ? (
      <FaCheck className="check-icon" />
    ) : (
      <FaTimes className="times-icon" />
    )}
    <span className={`requirement-text ${met ? 'met' : ''}`}>
      {text}
    </span>
  </div>
));

// ============ STEP COMPONENTS ============
const Step1Personal = memo(({ 
  form, 
  errors, 
  handleChange, 
  isCheckingDuplicate,
  duplicateCheckResult,
  showDuplicateErrors 
}) => (
  <div>
    <h3 className="step-title">
      <FaUser className="step-icon" />
      Personal Information
    </h3>
    <p className="step-description">
      Please provide your personal details. Fields marked with * are required.
    </p>
    
    {/* Duplicate Name Warning */}
    {showDuplicateErrors.names && duplicateCheckResult.names?.duplicate && (
      <div className="duplicate-warning warning-yellow">
        <div className="warning-content">
          <FaExclamationTriangle className="warning-icon" />
          <div>
            <p className="warning-title">Possible Duplicate Registration Found</p>
            <p className="warning-message">
              A resident with similar name (<strong>{duplicateCheckResult.names.similarName}</strong>) 
              already exists in our system. Please verify that you haven't registered before.
            </p>
          </div>
        </div>
      </div>
    )}
    
    <div className="grid-2">
      {/* First Name */}
      <div className="input-container">
        <div className="input-header">
          <small className="input-label">First Name *</small>
          {isCheckingDuplicate && (
            <small className="checking-text">
              <FaSync className="spinning-icon" />
              Checking...
            </small>
          )}
        </div>
        <input
          name="first_name"
          placeholder="Juan"
          value={form.first_name}
          onChange={handleChange}
          className={`form-input ${errors.first_name ? 'error' : ''}`}
          autoComplete="given-name"
        />
        {errors.first_name && <p className="error-text">{errors.first_name}</p>}
      </div>

      {/* Middle Name */}
      <div className="input-container">
        <small className="input-label">Middle Name (Optional)</small>
        <input
          name="middle_name"
          placeholder="Santos"
          value={form.middle_name}
          onChange={handleChange}
          className="form-input"
          autoComplete="additional-name"
        />
      </div>

      {/* Last Name */}
      <div className="input-container">
        <small className="input-label">Last Name *</small>
        <input
          name="last_name"
          placeholder="Dela Cruz"
          value={form.last_name}
          onChange={handleChange}
          className={`form-input ${errors.last_name ? 'error' : ''}`}
          autoComplete="family-name"
        />
        {errors.last_name && <p className="error-text">{errors.last_name}</p>}
      </div>

      {/* Suffix */}
      <div className="input-container">
        <small className="input-label">Suffix (Optional)</small>
        <select 
          name="suffix" 
          value={form.suffix} 
          onChange={handleChange} 
          className="form-select"
          autoComplete="off"
        >
          <option value="">No Suffix</option>
          <option value="Jr.">Jr.</option>
          <option value="Sr.">Sr.</option>
          <option value="II">II</option>
          <option value="III">III</option>
          <option value="IV">IV</option>
        </select>
      </div>

      {/* Sex */}
      <div className="input-container">
        <small className="input-label">Sex *</small>
        <select 
          name="sex" 
          value={form.sex} 
          onChange={handleChange} 
          className={`form-select ${errors.sex ? 'error' : ''}`}
          autoComplete="off"
        >
          <option value="">Select Sex</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        {errors.sex && <p className="error-text">{errors.sex}</p>}
      </div>

      {/* Date of Birth */}
      <div className="input-container">
        <small className="input-label">Date of Birth *</small>
        <input
          type="date"
          name="birthday"
          value={form.birthday || ""}
          onChange={handleChange}
          className={`form-input ${errors.birthday ? 'error' : ''}`}
          max={new Date().toISOString().split('T')[0]}
          autoComplete="off"
        />
        {errors.birthday && <p className="error-text">{errors.birthday}</p>}
      </div>

      {/* Civil Status */}
      <div className="input-container">
        <small className="input-label">Civil Status *</small>
        <select 
          name="civil_status" 
          value={form.civil_status} 
          onChange={handleChange} 
          className={`form-select ${errors.civil_status ? 'error' : ''}`}
          autoComplete="off"
        >
          <option value="">Select Civil Status</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Widowed">Widowed</option>
          <option value="Separated">Separated</option>
        </select>
        {errors.civil_status && <p className="error-text">{errors.civil_status}</p>}
      </div>

      {/* Citizenship */}
      <div className="input-container">
        <small className="input-label">Citizenship *</small>
        <input
          name="citizenship"
          placeholder="Filipino"
          value={form.citizenship}
          onChange={handleChange}
          className={`form-input ${errors.citizenship ? 'error' : ''}`}
          autoComplete="country"
        />
        {errors.citizenship && <p className="error-text">{errors.citizenship}</p>}
      </div>
    </div>
  </div>
));

const Step2Address = memo(({ form, errors, handleChange }) => (
  <div>
    <h3 className="step-title">
      <FaHome className="step-icon" />
      Address Information
    </h3>
    <p className="step-description">
      Please provide your complete address. Fields marked with * are required.
    </p>
    
    <div className="grid-2">
      {/* House No. / Street */}
      <div className="input-container">
        <small className="input-label">House No. / Street *</small>
        <input
          name="house_no_street"
          placeholder="123 Main Street"
          value={form.house_no_street}
          onChange={handleChange}
          className={`form-input ${errors.house_no_street ? 'error' : ''}`}
          autoComplete="off"
        />
        {errors.house_no_street && <p className="error-text">{errors.house_no_street}</p>}
      </div>

      {/* Purok / Sitio */}
      <div className="input-container">
        <small className="input-label">Purok / Sitio (Optional)</small>
        <input
          name="purok_sitio"
          placeholder="Purok 5 / Sitio Maligaya"
          value={form.purok_sitio}
          onChange={handleChange}
          className="form-input"
          autoComplete="off"
        />
      </div>

      {/* Barangay (Fixed) */}
      <div className="input-container">
        <small className="input-label">Barangay (Fixed)</small>
        <input
          name="barangay"
          value={form.barangay}
          readOnly
          className="form-input disabled"
          autoComplete="off"
        />
      </div>

      {/* City / Municipality */}
      <div className="input-container">
        <small className="input-label">City / Municipality *</small>
        <input
          name="city_municipality"
          placeholder="Manila City"
          value={form.city_municipality}
          onChange={handleChange}
          className={`form-input ${errors.city_municipality ? 'error' : ''}`}
          autoComplete="off"
        />
        {errors.city_municipality && <p className="error-text">{errors.city_municipality}</p>}
      </div>

      {/* Province */}
      <div className="input-container">
        <small className="input-label">Province *</small>
        <input
          name="province"
          placeholder="Metro Manila"
          value={form.province}
          onChange={handleChange}
          className={`form-input ${errors.province ? 'error' : ''}`}
          autoComplete="off"
        />
        {errors.province && <p className="error-text">{errors.province}</p>}
      </div>
    </div>
  </div>
));

const Step3Contact = memo(({ 
  form, 
  errors, 
  handleChange, 
  isCheckingDuplicate,
  duplicateCheckResult,
  showDuplicateErrors 
}) => (
  <div>
    <h3 className="step-title">
      <FaPhone className="step-icon" />
      Contact Information
    </h3>
    <p className="step-description">
      Please provide your contact details. All fields are required.
    </p>
    
    <div className="single-column-grid">
      {/* Mobile Number */}
      <div className="input-container">
        <div className="input-header">
          <small className="input-label">Mobile Number *</small>
          {isCheckingDuplicate && (
            <small className="checking-text">
              <FaSync className="spinning-icon" />
              Checking...
            </small>
          )}
        </div>
        <div className="icon-input-container">
          <FaPhone className="input-icon" />
          <input
            name="mobile_number"
            placeholder="09123456789"
            value={form.mobile_number}
            onChange={handleChange}
            maxLength="11"
            className={`form-input with-icon ${errors.mobile_number ? 'error' : ''}`}
            autoComplete="tel"
          />
          {form.mobile_number.length === 11 && duplicateCheckResult.mobile?.available && (
            <FaCheck className="check-icon-input" />
          )}
        </div>
        {errors.mobile_number && <p className="error-text">{errors.mobile_number}</p>}
        {duplicateCheckResult.mobile?.available && form.mobile_number.length === 11 && (
          <p className="success-text">✓ Mobile number is available</p>
        )}
      </div>

      {/* Email Address */}
      <div className="input-container">
        <div className="input-header">
          <small className="input-label">Email Address *</small>
          {isCheckingDuplicate && (
            <small className="checking-text">
              <FaSync className="spinning-icon" />
              Checking...
            </small>
          )}
        </div>
        <div className="icon-input-container">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            name="email_address"
            placeholder="juan.delacruz@example.com"
            value={form.email_address}
            onChange={handleChange}
            className={`form-input with-icon ${errors.email_address ? 'error' : ''}`}
            autoComplete="email"
            required
          />
          {form.email_address && /^\S+@\S+\.\S+$/.test(form.email_address) && duplicateCheckResult.email?.available && (
            <FaCheck className="check-icon-input" />
          )}
        </div>
        {errors.email_address && <p className="error-text">{errors.email_address}</p>}
        {duplicateCheckResult.email?.available && form.email_address && /^\S+@\S+\.\S+$/.test(form.email_address) && (
          <p className="success-text">✓ Email address is available</p>
        )}
      </div>
    </div>
    
    {/* Duplicate Contact Warning - Conditional Display */}
    {(showDuplicateErrors.email && duplicateCheckResult.email?.duplicate) || 
     (showDuplicateErrors.mobile && duplicateCheckResult.mobile?.duplicate) ? (
      <div className="duplicate-warning warning-yellow centered-warning">
        <div className="warning-content">
          <FaExclamationTriangle className="warning-icon" />
          <div>
            <p className="warning-title">Duplicate Contact Found</p>
            {showDuplicateErrors.email && duplicateCheckResult.email?.duplicate && (
              <p className="warning-message">
                Email <strong>{form.email_address}</strong> is already registered.
              </p>
            )}
            {showDuplicateErrors.mobile && duplicateCheckResult.mobile?.duplicate && (
              <p className="warning-message">
                Mobile number <strong>{form.mobile_number}</strong> is already registered.
              </p>
            )}
            <p className="warning-note">
              Please use a different email or mobile number.
            </p>
          </div>
        </div>
      </div>
    ) : null}
  </div>
));

const Step4Identity = memo(({ form, errors, handleChange, handleFileChange, idFile }) => (
  <div>
    <h3 className="step-title">
      <FaIdCard className="step-icon" />
      Identity Verification
    </h3>
    <p className="step-description">
      Please provide your valid ID information for verification.
    </p>
    
    <div className="single-column-grid">
      {/* Valid ID Type */}
      <div className="input-container">
        <small className="input-label">Valid ID Type *</small>
        <select 
          name="valid_id_type" 
          value={form.valid_id_type} 
          onChange={handleChange} 
          className={`form-select ${errors.valid_id_type ? 'error' : ''}`}
          autoComplete="off"
        >
          <option value="">Select ID Type</option>
          <option value="PhilID">PhilID (National ID)</option>
          <option value="Voter's ID">Voter's ID</option>
          <option value="Driver's License">Driver's License</option>
          <option value="Passport">Passport</option>
          <option value="School ID">School ID (for 17 below)</option>
          <option value="Postal ID">Postal ID</option>
          <option value="PRC ID">PRC ID</option>
          <option value="UMID">UMID</option>
          <option value="Others">Others (Please specify)</option>
        </select>
        {errors.valid_id_type && <p className="error-text">{errors.valid_id_type}</p>}
        
        {/* Other ID Type Input */}
        {form.valid_id_type === "Others" && (
          <div className="other-id-container">
            <small className="input-label">Specify other ID type *</small>
            <input
              name="other_id_type"
              placeholder="Please specify the ID type (e.g., Barangay ID, Company ID, etc.)"
              value={form.other_id_type || ""}
              onChange={handleChange}
              className={`form-input ${errors.other_id_type ? 'error' : ''}`}
              autoComplete="off"
            />
            {errors.other_id_type && <p className="error-text">{errors.other_id_type}</p>}
          </div>
        )}
      </div>

      {/* Valid ID Number */}
      <div className="input-container">
        <small className="input-label">Valid ID Number *</small>
        <input
          name="valid_id_number"
          placeholder="ID Number"
          value={form.valid_id_number}
          onChange={handleChange}
          className={`form-input ${errors.valid_id_number ? 'error' : ''}`}
          autoComplete="off"
        />
        {errors.valid_id_number && <p className="error-text">{errors.valid_id_number}</p>}
      </div>

      {/* Upload Valid ID */}
      <div>
        <label className="upload-label">
          Upload Valid ID (image/PDF) * (Max 5MB)
        </label>
        <div 
          className={`file-upload-area ${errors.idFile ? 'error' : ''}`}
          onClick={() => document.getElementById('idFile').click()}
        >
          <input
            id="idFile"
            type="file"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          {idFile ? (
            <div className="file-selected">
              <FaCheckCircle className="upload-icon success" />
              <p className="file-name"><strong>File Selected:</strong> {idFile.name}</p>
              <p className="file-size">{(idFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <p className="file-hint">Click to change file</p>
            </div>
          ) : (
            <div className="file-empty">
              <FaFileUpload className="upload-icon" />
              <p className="upload-text"><strong>Click to upload</strong> or drag & drop</p>
              <p className="upload-hint">Supported: JPG, PNG, PDF • Max 5MB</p>
            </div>
          )}
        </div>
        {errors.idFile && <p className="error-text center">{errors.idFile}</p>}
      </div>
    </div>
  </div>
));

const Step5Account = memo(({ 
  form, 
  errors, 
  handleChange, 
  passwordStrength,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  isCheckingDuplicate,
  duplicateCheckResult,
  showDuplicateErrors 
}) => (
  <div>
    <h3 className="step-title">
      <FaShieldAlt className="step-icon" />
      Account Credentials
    </h3>
    <p className="step-description">
      Create your account login credentials. Make sure to use a strong password.
    </p>
    
    <div className="single-column-grid">
      {/* Username */}
      <div className="input-container">
        <div className="input-header">
          <small className="input-label">Username *</small>
          {isCheckingDuplicate && (
            <small className="checking-text">
              <FaSync className="spinning-icon" />
              Checking...
            </small>
          )}
        </div>
        <div className="icon-input-container">
          <FaUser className="input-icon" />
          <input
            name="username"
            placeholder="juandelacruz_2024"
            value={form.username}
            onChange={handleChange}
            className={`form-input with-icon ${errors.username ? 'error' : ''}`}
            autoComplete="username"
          />
          {form.username.length >= 3 && duplicateCheckResult.username?.available && (
            <FaCheck className="check-icon-input" />
          )}
        </div>
        {errors.username && <p className="error-text">{errors.username}</p>}
        {duplicateCheckResult.username?.available && form.username.length >= 3 && (
          <p className="success-text">✓ Username is available</p>
        )}
        
        {/* Duplicate Username Warning - Conditional */}
        {showDuplicateErrors.username && duplicateCheckResult.username?.duplicate && (
          <div className="duplicate-warning warning-yellow">
            <div className="warning-content">
              <FaExclamationTriangle className="warning-icon" />
              <div>
                <p className="warning-title">Username Already Taken</p>
                <p className="warning-message">
                  Username <strong>{form.username}</strong> is already registered. Please choose a different username.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password */}
      <div className="input-container">
        <small className="input-label">Password *</small>
        <div className="icon-input-container">
          <FaShieldAlt className="input-icon password-icon" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Create a strong password"
            value={form.password}
            onChange={handleChange}
            className={`form-input with-icon ${errors.password ? 'error' : ''}`}
            autoComplete="new-password"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {errors.password && <p className="error-text">{errors.password}</p>}
      </div>

      {/* Password Strength Indicator */}
      {form.password && (
        <div className="password-strength">
          <p className="strength-title">
            <FaShieldAlt className="strength-icon" />
            Password Requirements:
          </p>
          <PasswordRequirement met={passwordStrength.length} text="At least 8 characters" />
          <PasswordRequirement met={passwordStrength.uppercase} text="At least one uppercase letter" />
          <PasswordRequirement met={passwordStrength.lowercase} text="At least one lowercase letter" />
          <PasswordRequirement met={passwordStrength.number} text="At least one number" />
          <PasswordRequirement met={passwordStrength.special} text="At least one special character" />
        </div>
      )}

      {/* Confirm Password */}
      <div className="input-container">
        <div className="icon-input-container">
          <FaShieldAlt className="input-icon password-icon" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirm_password"
            placeholder="Confirm your password"
            value={form.confirm_password}
            onChange={handleChange}
            className={`form-input with-icon ${errors.confirm_password ? 'error' : ''}`}
            autoComplete="new-password"
          />
          <span
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="password-toggle"
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {errors.confirm_password && <p className="error-text">{errors.confirm_password}</p>}
        <small className="input-label">Confirm Password *</small>
      </div>
    </div>
  </div>
));

const Step6Household = memo(({ form, errors, handleChange }) => (
  <div>
    <h3 className="step-title">
      <FaUsers className="step-icon" />
      Household Information
    </h3>
    <div className="info-note warning-orange">
      <div className="note-content">
        <FaExclamationTriangle className="note-icon" />
        <p className="note-text">
          <strong>Optional but Recommended:</strong> This information helps with barangay services and emergency response
        </p>
      </div>
    </div>
    
    <div className="grid-2">
      {/* Household ID */}
      <div className="input-container">
        <small className="input-label">Household ID / Family No.</small>
        <input
          name="household_id"
          placeholder="HH-2024-001"
          value={form.household_id}
          onChange={handleChange}
          className="form-input"
          autoComplete="off"
        />
      </div>

      {/* Role in Family */}
      <div className="input-container">
        <small className="input-label">Role in Family</small>
        <select 
          name="family_role" 
          value={form.family_role} 
          onChange={handleChange} 
          className="form-select"
          autoComplete="off"
        >
          <option value="">Select Role</option>
          <option value="Head">Head</option>
          <option value="Member">Member</option>
          <option value="Spouse">Spouse</option>
          <option value="Child">Child</option>
          <option value="Parent">Parent</option>
        </select>
      </div>

      {/* Number of Household Members */}
      <div className="input-container">
        <small className="input-label">Number of Household Members</small>
        <input
          name="household_members"
          placeholder="5"
          value={form.household_members}
          onChange={handleChange}
          className="form-input"
          autoComplete="off"
        />
      </div>

      {/* Emergency Contact Name */}
      <div className="input-container">
        <small className="input-label">Emergency Contact Name</small>
        <input
          name="emergency_contact_name"
          placeholder="Maria Dela Cruz"
          value={form.emergency_contact_name}
          onChange={handleChange}
          className="form-input"
          autoComplete="off"
        />
      </div>

      {/* Emergency Contact Number */}
      <div className="input-container full-width">
        <small className="input-label">Emergency Contact Number</small>
        <div className="icon-input-container">
          <FaPhone className="input-icon" />
          <input
            name="emergency_contact_number"
            placeholder="09123456789"
            value={form.emergency_contact_number}
            onChange={handleChange}
            maxLength="11"
            className={`form-input with-icon ${errors.emergency_contact_number ? 'error' : ''}`}
            autoComplete="tel"
          />
        </div>
        {errors.emergency_contact_number && <p className="error-text">{errors.emergency_contact_number}</p>}
      </div>
    </div>
  </div>
));

const Step7Verification = memo(({ 
  form, 
  errors, 
  handleRecaptchaChange, 
  recaptchaSiteKey,
  duplicateCheckResult 
}) => {
  const hasDuplicates = 
    duplicateCheckResult.email?.duplicate || 
    duplicateCheckResult.mobile?.duplicate || 
    duplicateCheckResult.username?.duplicate || 
    duplicateCheckResult.names?.duplicate;
  
  return (
    <div>
      <h3 className="step-title">
        <FaRobot className="step-icon" />
        Security Verification
      </h3>
      <p className="step-description">
        Please complete the security check to verify you're human.
      </p>
      
      {/* Final Duplicate Warning */}
      {hasDuplicates && (
        <div className="duplicate-warning warning-red">
          <div className="warning-content">
            <FaExclamationTriangle className="warning-icon" />
            <div>
              <p className="warning-title">⚠️ Cannot Proceed with Registration</p>
              <p className="warning-message">
                Please fix the duplicate issues in previous steps before submitting.
              </p>
              <ul className="duplicate-list">
                {duplicateCheckResult.email?.duplicate && <li>Email is already registered</li>}
                {duplicateCheckResult.mobile?.duplicate && <li>Mobile number is already registered</li>}
                {duplicateCheckResult.username?.duplicate && <li>Username is already taken</li>}
                {duplicateCheckResult.names?.duplicate && <li>Similar name already exists</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <div className="recaptcha-container">
        <ReCAPTCHA
          sitekey={recaptchaSiteKey}
          onChange={handleRecaptchaChange}
          onErrored={() => console.error("reCAPTCHA failed to load")}
        />
      </div>
      {errors.recaptcha && (
        <p className="error-text center">{errors.recaptcha}</p>
      )}
      <p className="recaptcha-note">
        This helps us prevent automated registrations
      </p>

      {/* Review Summary */}
      <div className="review-summary">
        <h4 className="summary-title">Registration Summary</h4>
        <div className="summary-content">
          <p><strong>Name:</strong> {form.first_name} {form.middle_name} {form.last_name} {form.suffix}</p>
          <p><strong>Birthday:</strong> {form.birthday}</p>
          <p><strong>Contact:</strong> {form.mobile_number}</p>
          <p><strong>Email:</strong> {form.email_address}</p>
          <p><strong>Address:</strong> {form.house_no_street}, {form.city_municipality}</p>
          <p><strong>Username:</strong> {form.username}</p>
          
          <div className={`duplicate-status ${hasDuplicates ? 'has-duplicates' : 'no-duplicates'}`}>
            <p>
              <strong>Duplicate Check Status:</strong> {
                hasDuplicates 
                  ? "❌ Issues found - Please fix before submitting" 
                  : "✓ No duplicate issues found"
              }
            </p>
          </div>
          
          <p className="review-note">
            Please review your information before submitting
          </p>
        </div>
      </div>
    </div>
  );
});

// ============ MAIN CONTENT COMPONENT ============
const StepContent = memo(({ 
  currentStep, 
  form, 
  errors, 
  handleChange, 
  handleFileChange,
  idFile,
  passwordStrength,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  handleRecaptchaChange,
  recaptchaSiteKey,
  isCheckingDuplicate,
  duplicateCheckResult,
  showDuplicateErrors 
}) => {
  const content = useMemo(() => {
    switch(currentStep) {
      case 1:
        return <Step1Personal 
                form={form} 
                errors={errors} 
                handleChange={handleChange} 
                isCheckingDuplicate={isCheckingDuplicate}
                duplicateCheckResult={duplicateCheckResult}
                showDuplicateErrors={showDuplicateErrors}
              />;
      case 2:
        return <Step2Address 
                form={form} 
                errors={errors} 
                handleChange={handleChange} 
              />;
      case 3:
        return <Step3Contact 
                form={form} 
                errors={errors} 
                handleChange={handleChange} 
                isCheckingDuplicate={isCheckingDuplicate}
                duplicateCheckResult={duplicateCheckResult}
                showDuplicateErrors={showDuplicateErrors}
              />;
      case 4:
        return <Step4Identity 
                form={form} 
                errors={errors} 
                handleChange={handleChange} 
                handleFileChange={handleFileChange}
                idFile={idFile}
              />;
      case 5:
        return <Step5Account 
                form={form} 
                errors={errors} 
                handleChange={handleChange} 
                passwordStrength={passwordStrength}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                isCheckingDuplicate={isCheckingDuplicate}
                duplicateCheckResult={duplicateCheckResult}
                showDuplicateErrors={showDuplicateErrors}
              />;
      case 6:
        return <Step6Household 
                form={form} 
                errors={errors} 
                handleChange={handleChange} 
              />;
      case 7:
        return <Step7Verification 
                form={form} 
                errors={errors} 
                handleRecaptchaChange={handleRecaptchaChange}
                recaptchaSiteKey={recaptchaSiteKey}
                duplicateCheckResult={duplicateCheckResult}
              />;
      default:
        return null;
    }
  }, [
    currentStep, form, errors, handleChange, handleFileChange, idFile,
    passwordStrength, showPassword, setShowPassword, showConfirmPassword,
    setShowConfirmPassword, handleRecaptchaChange, recaptchaSiteKey,
    isCheckingDuplicate, duplicateCheckResult, showDuplicateErrors
  ]);

  return <div className="step-content-wrapper">{content}</div>;
});

// ============ MAIN FORM COMPONENT ============
function RegisterForm() {
  const { role } = useParams();
  const navigate = useNavigate();
  
  // Form state
  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    sex: "",
    birthday: "",
    civil_status: "",
    citizenship: "Filipino",
    house_no_street: "",
    purok_sitio: "",
    barangay: "Barangay 123",
    city_municipality: "",
    province: "",
    mobile_number: "",
    email_address: "",
    valid_id_type: "",
    other_id_type: "",
    valid_id_number: "",
    id_picture: null,
    username: "",
    password: "",
    confirm_password: "",
    household_id: "",
    family_role: "",
    household_members: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
  });

  const [idFile, setIdFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  
  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  
  // reCAPTCHA state
  const [recaptchaValue, setRecaptchaValue] = useState(null);

  // Duplicate checking state
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateCheckResult, setDuplicateCheckResult] = useState({
    email: { duplicate: false, available: false },
    mobile: { duplicate: false, available: false },
    username: { duplicate: false, available: false },
    names: { duplicate: false, similarName: "" }
  });

  // New state for controlling duplicate error display
  const [showDuplicateErrors, setShowDuplicateErrors] = useState({
    email: false,
    mobile: false,
    username: false,
    names: false
  });

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LfIECwsAAAAAD2MzdbGC_PpEsZu0CpV_r_N925o";

  // ============ DUPLICATE CHECKING FUNCTIONS ============
  const checkDuplicate = useCallback(async (field, value) => {
    if (!value || value.trim() === "") return;
    
    try {
      setIsCheckingDuplicate(true);
      
      let checkType = "";
      let checkValue = "";
      
      switch(field) {
        case "email":
          checkType = "email";
          checkValue = value;
          break;
        case "mobile":
          checkType = "mobile";
          checkValue = value;
          break;
        case "username":
          checkType = "username";
          checkValue = value;
          break;
        case "names":
          if (form.first_name && form.last_name) {
            checkType = "names";
            checkValue = `${form.first_name} ${form.last_name}`;
          }
          break;
      }
      
      if (!checkType) return;
      
      const response = await axios.post(`${baseUrl}/api/auth/check-duplicate`, {
        type: checkType,
        value: checkValue,
        firstName: form.first_name,
        lastName: form.last_name
      });
      
      setDuplicateCheckResult(prev => ({
        ...prev,
        [field]: response.data
      }));
      
    } catch (error) {
      console.error(`Error checking duplicate for ${field}:`, error);
    } finally {
      setIsCheckingDuplicate(false);
    }
  }, [baseUrl, form.first_name, form.last_name]);

  // Debounced duplicate checking
  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.email_address && /^\S+@\S+\.\S+$/.test(form.email_address)) {
        checkDuplicate("email", form.email_address);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [form.email_address, checkDuplicate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.mobile_number && form.mobile_number.length === 11) {
        checkDuplicate("mobile", form.mobile_number);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [form.mobile_number, checkDuplicate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.username && form.username.length >= 3) {
        checkDuplicate("username", form.username);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [form.username, checkDuplicate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.first_name && form.last_name && 
          form.first_name.length >= 2 && form.last_name.length >= 2) {
        checkDuplicate("names", "");
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [form.first_name, form.last_name, checkDuplicate]);

  // ============ HANDLERS ============
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setForm(prev => {
      const newForm = { ...prev };
      
      if (name === "mobile_number" || name === "emergency_contact_number") {
        newForm[name] = value.replace(/\D/g, '').slice(0, 11);
      } else if (name === "household_members") {
        newForm[name] = value.replace(/\D/g, '').slice(0, 2);
      } else {
        newForm[name] = value;
      }
      
      // Clear other_id_type kapag hindi "Others" ang napili
      if (name === "valid_id_type" && value !== "Others") {
        newForm.other_id_type = "";
      }
      
      return newForm;
    });
    
    // Password strength check
    if (name === "password") {
      setPasswordStrength({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      });
    }
    
    // Clear errors and reset duplicate error flags when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    // Reset duplicate error flag when user starts typing in that field
    if (name === "email_address") {
      setShowDuplicateErrors(prev => ({ ...prev, email: false }));
    } else if (name === "mobile_number") {
      setShowDuplicateErrors(prev => ({ ...prev, mobile: false }));
    } else if (name === "username") {
      setShowDuplicateErrors(prev => ({ ...prev, username: false }));
    } else if (name === "first_name" || name === "last_name") {
      setShowDuplicateErrors(prev => ({ ...prev, names: false }));
    }
    
  }, [errors]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setIdFile(file);
      setForm(prev => ({ ...prev, id_picture: file.name }));
    }
  }, []);

  const handleRecaptchaChange = useCallback((value) => {
    setRecaptchaValue(value);
    if (errors.recaptcha) {
      setErrors(prev => ({ ...prev, recaptcha: "" }));
    }
  }, [errors.recaptcha]);

  // ============ VALIDATION FUNCTIONS ============
  const validateStep = useCallback((step) => {
    const newErrors = {};

    switch(step) {
      case 1: // Personal Information
        if (!form.first_name.trim()) newErrors.first_name = "First Name is required";
        if (!form.last_name.trim()) newErrors.last_name = "Last Name is required";
        if (!form.sex) newErrors.sex = "Sex is required";
        if (!form.birthday) newErrors.birthday = "Date of Birth is required";
        if (!form.civil_status) newErrors.civil_status = "Civil Status is required";
        if (!form.citizenship.trim()) newErrors.citizenship = "Citizenship is required";
        
        // Age validation (13-30)
        if (form.birthday) {
          const birthDate = new Date(form.birthday);
          const today = new Date();
          let calculatedAge = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
          }
          
          if (calculatedAge < 13 || calculatedAge > 30) {
            newErrors.birthday = "Only residents aged 13 to 30 can register";
          }
        }
        
        // Check for duplicate names
        if (duplicateCheckResult.names?.duplicate) {
          newErrors.names = "A resident with similar name already exists";
        }
        break;

      case 2: // Address Information
        if (!form.house_no_street.trim()) newErrors.house_no_street = "House No./Street is required";
        if (!form.city_municipality.trim()) newErrors.city_municipality = "City/Municipality is required";
        if (!form.province.trim()) newErrors.province = "Province is required";
        break;

      case 3: // Contact Information
        if (!form.mobile_number.trim()) {
          newErrors.mobile_number = "Mobile Number is required";
        } else if (!/^\d{11}$/.test(form.mobile_number)) {
          newErrors.mobile_number = "Mobile number must be 11 digits";
        } else if (duplicateCheckResult.mobile?.duplicate) {
          newErrors.mobile_number = "Mobile number is already registered";
        }
        
        if (!form.email_address.trim()) {
          newErrors.email_address = "Email Address is required";
        } else if (!/\S+@\S+\.\S+/.test(form.email_address)) {
          newErrors.email_address = "Email is invalid";
        } else if (duplicateCheckResult.email?.duplicate) {
          newErrors.email_address = "Email is already registered";
        }
        break;

      case 4: // Identity Verification
        if (!form.valid_id_type) newErrors.valid_id_type = "Valid ID Type is required";
        
        if (form.valid_id_type === "Others" && !form.other_id_type?.trim()) {
          newErrors.other_id_type = "Please specify the ID type";
        }
        
        if (!form.valid_id_number.trim()) newErrors.valid_id_number = "Valid ID Number is required";
        if (!idFile) newErrors.idFile = "ID upload is required";
        break;

      case 5: // Account Credentials
        if (!form.username.trim()) {
          newErrors.username = "Username is required";
        } else if (form.username.length < 3) {
          newErrors.username = "Username must be at least 3 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
          newErrors.username = "Username can only contain letters, numbers, and underscores";
        } else if (duplicateCheckResult.username?.duplicate) {
          newErrors.username = "Username is already taken";
        }

        if (!form.password) {
          newErrors.password = "Password is required";
        } else if (form.password.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else if (!passwordStrength.uppercase || !passwordStrength.lowercase || 
                   !passwordStrength.number || !passwordStrength.special) {
          newErrors.password = "Password must contain uppercase, lowercase, number, and special character";
        }

        if (form.password !== form.confirm_password) {
          newErrors.confirm_password = "Passwords do not match";
        }
        break;

      case 6: // Household Information
        if (form.emergency_contact_number && !/^\d{11}$/.test(form.emergency_contact_number)) {
          newErrors.emergency_contact_number = "Emergency contact must be 11 digits";
        }
        break;

      case 7: // reCAPTCHA
        if (!recaptchaValue) {
          newErrors.recaptcha = "Please complete the reCAPTCHA verification";
        }
        break;
    }

    // File validation for step 4
    if (step === 4 && idFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(idFile.type)) {
        newErrors.idFile = "Only JPEG, PNG, JPG, and PDF files are allowed";
      } else if (idFile.size > 5 * 1024 * 1024) {
        newErrors.idFile = "File size must be less than 5MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, idFile, passwordStrength, recaptchaValue, duplicateCheckResult]);

  const nextStep = useCallback(() => {
    // First, show duplicate errors if any
    const hasDuplicateIssues = 
      duplicateCheckResult.email?.duplicate || 
      duplicateCheckResult.mobile?.duplicate || 
      duplicateCheckResult.username?.duplicate || 
      duplicateCheckResult.names?.duplicate;
    
    if (hasDuplicateIssues) {
      // Set flags to show duplicate warnings
      setShowDuplicateErrors({
        email: duplicateCheckResult.email?.duplicate || false,
        mobile: duplicateCheckResult.mobile?.duplicate || false,
        username: duplicateCheckResult.username?.duplicate || false,
        names: duplicateCheckResult.names?.duplicate || false
      });
    }
    
    // Then validate the step
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  }, [currentStep, validateStep, duplicateCheckResult]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  // Check if there are duplicate issues before allowing submission
  const hasDuplicateIssues = useMemo(() => {
    return (
      duplicateCheckResult.email?.duplicate ||
      duplicateCheckResult.mobile?.duplicate ||
      duplicateCheckResult.username?.duplicate
    );
  }, [duplicateCheckResult]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Prevent submission if there are duplicate issues
    if (hasDuplicateIssues) {
      setErrors(prev => ({ 
        ...prev, 
        submit: "Cannot submit registration with duplicate email, mobile number, or username. Please fix these issues first." 
      }));
      return;
    }
    
    // Validate all steps
    let allValid = true;
    for (let i = 1; i <= totalSteps; i++) {
      if (!validateStep(i)) {
        allValid = false;
        break;
      }
    }
    
    if (!allValid) {
      setErrors(prev => ({ ...prev, submit: "Please fix all errors before submitting" }));
      return;
    }

    setIsLoading(true);
    setErrors({});

    const currentRecaptchaValue = recaptchaValue;

    try {
      const registerUrl = `${baseUrl}/api/auth/resident/register`;

      // Create FormData
      const formData = new FormData();
      
      // Personal Information
      formData.append("first_name", form.first_name);
      formData.append("middle_name", form.middle_name || "");
      formData.append("last_name", form.last_name);
      formData.append("suffix", form.suffix || "");
      formData.append("sex", form.sex);
      formData.append("birthday", form.birthday);
      formData.append("civil_status", form.civil_status);
      formData.append("citizenship", form.citizenship);
      
      // Address Information
      formData.append("house_no_street", form.house_no_street);
      formData.append("purok_sitio", form.purok_sitio || "");
      formData.append("barangay", form.barangay);
      formData.append("city_municipality", form.city_municipality);
      formData.append("province", form.province);
      
      // Contact Information
      formData.append("mobile_number", form.mobile_number);
      formData.append("email_address", form.email_address);
      formData.append("email", form.email_address);
      
      // Identity Verification
      formData.append("valid_id_type", form.valid_id_type === "Others" ? form.other_id_type : form.valid_id_type);
      formData.append("valid_id_number", form.valid_id_number);
      
      // Account Credentials
      formData.append("username", form.username);
      formData.append("password", form.password);
      
      // Household Information
      formData.append("household_id", form.household_id || "");
      formData.append("family_role", form.family_role || "");
      formData.append("household_members", form.household_members || "");
      formData.append("emergency_contact_name", form.emergency_contact_name || "");
      formData.append("emergency_contact_number", form.emergency_contact_number || "");

      // Add ID file
      if (idFile) formData.append("id_picture", idFile);
      
      // Reset recaptcha after getting the value
      setRecaptchaValue(null);
      
      // Add reCAPTCHA token
      formData.append("recaptchaToken", currentRecaptchaValue);

      // Submit registration
      const response = await axios.post(registerUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Registration successful:", response.data);
      setShowModal(true);

      // Reset form
      setForm({
        first_name: "",
        middle_name: "",
        last_name: "",
        suffix: "",
        sex: "",
        birthday: "",
        civil_status: "",
        citizenship: "Filipino",
        house_no_street: "",
        purok_sitio: "",
        barangay: "Barangay 123",
        city_municipality: "",
        province: "",
        mobile_number: "",
        email_address: "",
        valid_id_type: "",
        valid_id_number: "",
        id_picture: null,
        username: "",
        password: "",
        confirm_password: "",
        household_id: "",
        family_role: "",
        household_members: "",
        emergency_contact_name: "",
        emergency_contact_number: "",
      });
      setIdFile(null);
      setCurrentStep(1);
      setPasswordStrength({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      });
      
      // Reset duplicate check results
      setDuplicateCheckResult({
        email: { duplicate: false, available: false },
        mobile: { duplicate: false, available: false },
        username: { duplicate: false, available: false },
        names: { duplicate: false, similarName: "" }
      });

      // Reset duplicate error flags
      setShowDuplicateErrors({
        email: false,
        mobile: false,
        username: false,
        names: false
      });

    } catch (err) {
      console.error("Registration error:", err);
      
      if (err.response) {
        if (err.response.status === 409) {
          setErrors({ submit: "Username or email already exists. Please check the duplicate warnings above." });
        } else if (err.response.status === 400 && err.response.data.error?.includes("reCAPTCHA")) {
          setErrors({ recaptcha: "reCAPTCHA verification failed. Please refresh and try again." });
        } else {
          const errorMsg = err.response.data.error || err.response.data.details || "Registration failed";
          setErrors({ submit: errorMsg });
        }
      } else if (err.request) {
        setErrors({ submit: "No response from server. Please check if backend is running." });
      } else {
        setErrors({ submit: err.message });
      }
    } finally {
      setIsLoading(false);
    }
  }, [form, idFile, recaptchaValue, validateStep, hasDuplicateIssues, baseUrl]);

  return (
    <div className="register-page">
      <div className="background-overlay"></div>

      <div className="form-container">
        {/* Header with Logo */}
        <div className="form-header">
          <div className="header-content">
            <div className="logo-circle">
              <FaUserCircle className="logo-icon" />
            </div>
            <div className="header-text">
              <h2 className="form-title">Resident Registration</h2>
              <p className="form-subtitle">
                Step {currentStep} of {totalSteps} • Barangay Management System
              </p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <form onSubmit={handleSubmit}>
          {/* Current Step Content */}
          <div className="step-content-container">
            <StepContent 
              currentStep={currentStep}
              form={form}
              errors={errors}
              handleChange={handleChange}
              handleFileChange={handleFileChange}
              idFile={idFile}
              passwordStrength={passwordStrength}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              handleRecaptchaChange={handleRecaptchaChange}
              recaptchaSiteKey={recaptchaSiteKey}
              isCheckingDuplicate={isCheckingDuplicate}
              duplicateCheckResult={duplicateCheckResult}
              showDuplicateErrors={showDuplicateErrors}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="navigation-buttons">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="prev-button"
              >
                <FaArrowLeft className="button-icon" />
                Previous
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={hasDuplicateIssues}
                className={`next-button ${hasDuplicateIssues ? 'disabled' : ''}`}
              >
                Next
                <FaArrowRight className="button-icon" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || hasDuplicateIssues}
                className={`submit-button ${isLoading || hasDuplicateIssues ? 'disabled' : ''}`}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Submitting...
                  </>
                ) : hasDuplicateIssues ? (
                  <>
                    <FaExclamationTriangle className="button-icon" />
                    Fix Duplicates First
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="button-icon" />
                    Submit Registration
                  </>
                )}
              </button>
            )}
          </div>

          {/* Progress Info */}
          <div className="progress-info">
            <p>
              Step {currentStep} of {totalSteps} • {Math.round((currentStep / totalSteps) * 100)}% Complete
            </p>
            {hasDuplicateIssues && (
              <p className="duplicate-warning-text">
                ⚠️ Please resolve duplicate issues before proceeding
              </p>
            )}
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="submit-error">
              <strong>Error:</strong> {errors.submit}
            </div>
          )}

          {/* Already have an account? Login Link */}
          <div className="login-section">
            <div className="login-content">
              <p className="login-text">
                Already have an account?
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="login-button"
              >
                <FaSignInAlt className="button-icon" />
                Click here to login
                <span className="button-shimmer"></span>
              </button>
              <p className="login-note">
                Redirects to secure login page
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">
              ✓
            </div>
            <h2 className="modal-title">Registration Submitted!</h2>
            <p className="modal-message">
              Your registration is now pending approval. Our barangay staff will review your application within 24-48 hours. 
              You will receive an email at <strong>{form.email_address}</strong> once your account is approved.
            </p>
            <button 
              onClick={() => navigate("/login")} 
              className="modal-button"
            >
              Return to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Component
function Register() {
  return <RegisterForm />;
}

export default Register;
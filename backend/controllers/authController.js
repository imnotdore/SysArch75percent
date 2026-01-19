// controllers/authController.js - UPDATED FOR NEW TABLE STRUCTURE
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const emailService = require('../services/emailService');
const axios = require('axios');

// ================= JWT TOKEN GENERATOR =================
const generateToken = (user, role) => {
  return jwt.sign(
    { id: user.id, username: user.username, role },
    process.env.JWT_SECRET || "supersecretkey",
    { expiresIn: "1d" }
  );
};

// ================= GENERIC FUNCTIONS =================
const loginUser = async (table, role, username, password, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM ${table} WHERE username = ?`, [username]);
    if (!rows.length) return res.status(400).json({ error: "User not found" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken(user, role);
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error(`Login error (${table}):`, err.sqlMessage || err);
    res.status(500).json({ error: "Login failed" });
  }
};

// ================= RESIDENT LOGIN (UPDATED FOR NEW TABLE) =================
exports.loginResident = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    // Check if resident exists and is approved
    const [rows] = await db.query(
      `SELECT * FROM residents WHERE (username = ? OR email = ? OR email_address = ?) 
       AND status = 'approved'`, 
      [username, username, username]
    );
    
    if (!rows.length) {
      return res.status(400).json({ 
        error: "Resident not found or account not yet approved. Please wait for admin approval." 
      });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user, "resident");
    const { password: _, ...safeUser } = user;
    
    res.json({ 
      token, 
      user: safeUser,
      message: "Login successful"
    });
  } catch (err) {
    console.error("Resident login error:", err.sqlMessage || err);
    res.status(500).json({ error: "Resident login failed" });
  }
};

// ================= RESIDENT REGISTRATION (UPDATED FOR NEW TABLE) =================
exports.registerResident = async (req, res) => {
  try {
    // Extract ALL new fields from request body
    const {
      // Personal Information (from frontend multi-step form)
      first_name, middle_name, last_name, suffix, sex, birthday, age,
      civil_status, citizenship = 'Filipino',
      
      // Address Information
      house_no_street, purok_sitio, barangay = 'Barangay 123', 
      city_municipality, province,
      
      // Contact Information
      mobile_number, email_address, email,
      
      // Identity Verification
      valid_id_type, other_id_type, valid_id_number, // ✅ DAGDAGAN NG: other_id_type
      
      // Account Credentials
      username, password,
      
      // Household Information
      household_id, family_role, household_members,
      emergency_contact_name, emergency_contact_number,
      
      // For backward compatibility (can be sent from frontend)
      full_name, address, gender, contact,
      
      // reCAPTCHA
      recaptchaToken
    } = req.body;

    const id_picture = req.file ? req.file.filename : null;
    
    // ================= reCAPTCHA v2 VERIFICATION =================
    if (!recaptchaToken) {
      return res.status(400).json({ error: "reCAPTCHA verification required" });
    }

    try {
      const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
      const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
      
      const recaptchaResponse = await axios.post(verificationUrl, null, {
        params: {
          secret: recaptchaSecretKey,
          response: recaptchaToken
        }
      });
      
      const recaptchaData = recaptchaResponse.data;
      
      console.log("reCAPTCHA v2 Verification Result:", recaptchaData);
      
      if (!recaptchaData.success) {
        console.error("reCAPTCHA verification failed:", recaptchaData['error-codes']);
        return res.status(400).json({ 
          error: "reCAPTCHA verification failed. Please try again.",
          errorCodes: recaptchaData['error-codes']
        });
      }
    } catch (recaptchaError) {
      console.error("reCAPTCHA verification error:", recaptchaError.message);
      return res.status(500).json({ 
        error: "reCAPTCHA verification service unavailable. Please try again later." 
      });
    }
    // ================= END reCAPTCHA VERIFICATION =================

    // ================= VALIDATION FOR ID TYPE =================
    // Determine final ID type
    const finalIdType = valid_id_type === "Others" ? other_id_type : valid_id_type;
    
    if (!finalIdType || !finalIdType.trim()) {
      return res.status(400).json({ 
        error: "Valid ID Type is required. If selecting 'Others', please specify the ID type." 
      });
    }
    // ================= END ID TYPE VALIDATION =================

    // Enhanced validation for NEW fields
    const requiredFields = {
      first_name, last_name, sex, birthday,
      civil_status, citizenship,
      house_no_street, city_municipality, province,
      mobile_number, valid_id_number, // ✅ TANGGALIN ANG valid_id_type dito
      username, password
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return res.status(400).json({ error: `${field.replace('_', ' ')} is required` });
      }
    }

    if (!id_picture) {
      return res.status(400).json({ error: "ID picture is required" });
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ 
        error: "Username must be 3-20 characters and can only contain letters, numbers, and underscores" 
      });
    }

    // Use email_address if provided, otherwise use email
    const emailToUse = email_address || email;
    if (emailToUse && !/^\S+@\S+\.\S+$/.test(emailToUse)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      return res.status(400).json({ 
        error: "Password must contain uppercase, lowercase, number, and special character" 
      });
    }

    // Validate mobile number
    if (!/^\d{11}$/.test(mobile_number)) {
      return res.status(400).json({ error: "Mobile number must be 11 digits" });
    }

    // Validate emergency contact number if provided
    if (emergency_contact_number && !/^\d{11}$/.test(emergency_contact_number)) {
      return res.status(400).json({ error: "Emergency contact number must be 11 digits" });
    }

    // Validate age
    const birthDate = new Date(birthday);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    
    if (calculatedAge < 13 || calculatedAge > 30) {
      return res.status(400).json({ error: "Only residents aged 13 to 30 can register" });
    }

    // Check if username or email already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM residents WHERE username = ? OR email = ? OR email_address = ?',
      [username, emailToUse, emailToUse]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12);

        // Lalagay nya to sa NEW residents table 
    const fields = [
      // Personal Information
      "first_name", "middle_name", "last_name", "suffix", "sex", "birthday", "age", 
      "civil_status", "citizenship",
      
      // Address Information
      "house_no_street", "purok_sitio", "barangay", "city_municipality", "province",
      
      // Contact Information
      "mobile_number", "email_address", "email",
      
      // Identity Verification
      "valid_id_type", "valid_id_number", "id_picture", // ✅ valid_id_type dito
      
      // Account Credentials
      "username", "password",
      
      // Household Information
      "household_id", "family_role", "household_members",
      "emergency_contact_name", "emergency_contact_number",
      
      // Status and other fields
      "status"
    ];

    const values = [
      // Personal Information
      first_name, middle_name || "", last_name, suffix || "", sex, birthday, 
      calculatedAge || age || 0, civil_status, citizenship,
      
      // Address Information
      house_no_street, purok_sitio || "", barangay, city_municipality, province,
      
      // Contact Information
      mobile_number, emailToUse || "", emailToUse || "",
      
      // Identity Verification
      finalIdType, valid_id_number, id_picture, // ✅ GAMITIN ANG finalIdType
      
      // Account Credentials
      username, hashed,
      
      // Household Information
      household_id || "", family_role || "", household_members || 0,
      emergency_contact_name || "", emergency_contact_number || "",
      
      // Status
      "pending"
    ];

    const placeholders = fields.map(() => "?").join(", ");
    
    try {
      await db.query(
        `INSERT INTO residents (${fields.join(", ")}) VALUES (${placeholders})`, 
        values
      );
    } catch (dbError) {
      console.error("Database insert error:", dbError);
      // If generated columns error, try inserting basic fields first
      if (dbError.code === 'ER_GENERATED_COLUMN_FUNCTION_IS_NOT_ALLOWED') {
        // Try without generated columns
        const basicFields = [
          "first_name", "last_name", "sex", "birthday", "age", 
          "civil_status", "citizenship", "house_no_street", "city_municipality", 
          "province", "mobile_number", "valid_id_type", "valid_id_number", 
          "id_picture", "username", "password", "status", "barangay"
        ];
        
        const basicValues = [
          first_name, last_name, sex, birthday, calculatedAge || age || 0,
          civil_status, citizenship, house_no_street, city_municipality,
          province, mobile_number, valid_id_type, valid_id_number, id_picture,
          username, hashed, "pending", barangay
        ];
        
        await db.query(
          `INSERT INTO residents (${basicFields.join(", ")}) VALUES (${basicFields.map(() => "?").join(", ")})`, 
          basicValues
        );
      } else {
        throw dbError;
      }
    }

    res.status(201).json({ 
      message: "Resident registered successfully. Account pending approval.",
      success: true
    });
  } catch (err) {
    console.error("Resident register error:", err.sqlMessage || err);
    res.status(500).json({ 
      error: "Resident registration failed",
      details: err.message 
    });
  }
};

// ================= GET PENDING RESIDENTS (UPDATED) =================
exports.getPendingResidents = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        id, first_name, middle_name, last_name, suffix, sex, birthday, age,
        civil_status, citizenship, mobile_number, email_address,
        valid_id_type, valid_id_number, username, id_picture, 
        status, created_at,
        CONCAT(first_name, ' ', COALESCE(middle_name, ''), ' ', last_name, 
               CASE WHEN suffix IS NOT NULL AND suffix != '' THEN CONCAT(' ', suffix) ELSE '' END) as full_name,
        CONCAT(house_no_street, ', ', barangay, ', ', city_municipality, ', ', province) as address
       FROM residents WHERE status = 'pending'`
    );
    res.json(rows);
  } catch (err) {
    console.error("Get pending residents error:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to fetch pending residents" });
  }
};

// ================= APPROVE RESIDENT (UPDATED) =================
exports.approveResident = async (req, res) => {
  console.log("\n=== APPROVE RESIDENT REQUEST ===");
  console.log("Resident ID:", req.params.id);
  
  try {
    const { id } = req.params;
    
    // 1. Approve the resident
    const [result] = await db.query(
      'UPDATE residents SET status = ? WHERE id = ? AND status = ?',
      ['approved', id, 'pending']
    );
    
    if (result.affectedRows === 0) {
      console.log("❌ Resident not found or already processed");
      return res.status(404).json({ 
        success: false, 
        message: 'Resident not found or already processed' 
      });
    }
    
    console.log("✅ Resident approved in database");
    
    // 2. Get resident details for email
    const [residents] = await db.query(
      `SELECT first_name, last_name, email_address, email, username 
       FROM residents WHERE id = ?`,
      [id]
    );
    
    let emailSent = false;
    if (residents.length > 0) {
      const resident = residents[0];
      console.log("Resident details:", resident);
      
      // 3. Send approval email
      try {
        console.log("Attempting to send approval email...");
        const emailToSend = resident.email_address || resident.email;
        const fullName = `${resident.first_name} ${resident.last_name}`;
        
        const emailResult = await emailService.sendApprovalEmail(
          emailToSend,
          fullName,
          resident.username
        );
        emailSent = emailResult;
        console.log("Email send result:", emailResult);
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError.message);
        // Continue even if email fails
      }
    } else {
      console.log("❌ No resident found with ID:", id);
    }
    
    res.json({
      success: true,
      message: 'Resident approved successfully',
      emailSent: emailSent
    });
    
  } catch (error) {
    console.error('❌ Error approving resident:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve resident',
      error: error.message
    });
  }
};

// ================= GET APPROVED RESIDENTS (UPDATED) =================
exports.getApprovedResidents = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        id, first_name, middle_name, last_name, suffix, sex, birthday, age,
        civil_status, citizenship, 
        CONCAT(house_no_street, ', ', barangay, ', ', city_municipality, ', ', province) as address,
        mobile_number, email_address,
        valid_id_type, valid_id_number, id_picture,
        username, household_id, family_role, household_members,
        emergency_contact_name, emergency_contact_number,
        status, created_at
       FROM residents WHERE status = 'approved'`
    );
    res.json(rows);
  } catch (err) {
    console.error("Get approved residents error:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to fetch approved residents" });
  }
};

// ================= GET ALL RESIDENTS (UPDATED) =================
exports.getAllResidents = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        id, first_name, middle_name, last_name, suffix, sex, birthday, age,
        civil_status, citizenship, 
        CONCAT(house_no_street, ', ', barangay, ', ', city_municipality, ', ', province) as full_address,
        mobile_number, email_address,
        valid_id_type, valid_id_number, id_picture,
        username, household_id, family_role, household_members,
        emergency_contact_name, emergency_contact_number,
        status, created_at
       FROM residents 
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Get all residents error:", err);
    res.status(500).json({ error: "Failed to fetch residents" });
  }
};

// ================= GET RESIDENT BY ID (UPDATED) =================
exports.getResidentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await db.query(
      `SELECT 
        id, first_name, middle_name, last_name, suffix, sex, birthday, age,
        civil_status, citizenship,
        house_no_street, purok_sitio, barangay, city_municipality, province,
        mobile_number, email_address,
        valid_id_type, valid_id_number, id_picture,
        username, household_id, family_role, household_members,
        emergency_contact_name, emergency_contact_number,
        status, created_at
       FROM residents WHERE id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "Resident not found" });
    }
    
    // Don't send password
    const { password, ...resident } = rows[0];
    res.json(resident);
  } catch (err) {
    console.error("Get resident by ID error:", err);
    res.status(500).json({ error: "Failed to fetch resident" });
  }
};

// ================= UPDATE RESIDENT (UPDATED) =================
exports.updateResident = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const new_id_picture = req.file ? req.file.filename : null;

    const updateFields = {};
    const allowedFields = [
      // Personal Information
      'first_name', 'middle_name', 'last_name', 'suffix', 'sex', 
      'birthday', 'age', 'civil_status', 'citizenship',
      
      // Address Information
      'house_no_street', 'purok_sitio', 'barangay', 
      'city_municipality', 'province',
      
      // Contact Information
      'mobile_number', 'email_address', 'email',
      
      // Identity Verification
      'valid_id_type', 'valid_id_number',
      
      // Household Information
      'household_id', 'family_role', 'household_members',
      'emergency_contact_name', 'emergency_contact_number',
      
      // Account
      'username',
      
      // Status
      'status'
    ];

    allowedFields.forEach(key => {
      if (body[key] !== undefined && body[key] !== null && body[key] !== '') {
        updateFields[key] = body[key];
      }
    });

    if (new_id_picture) {
      updateFields.id_picture = new_id_picture;
      
      // Delete old ID picture if exists
      const [rows] = await db.query("SELECT id_picture FROM residents WHERE id = ?", [id]);
      const old_id_picture = rows.length > 0 ? rows[0].id_picture : null;
      
      if (old_id_picture) {
        const filePath = path.join(__dirname, "..", "uploads", "ids", old_id_picture);
        fs.unlink(filePath, (err) => {
          if (err && err.code !== 'ENOENT') console.error("Error deleting old ID file:", err);
        });
      }
    }

    const fieldsToUpdateSQL = Object.keys(updateFields).map(key => `${key} = ?`).join(", ");
    const values = Object.values(updateFields);

    if (fieldsToUpdateSQL.length === 0) {
      return res.status(400).json({ error: "No fields provided for update." });
    }
    
    await db.query(
      `UPDATE residents SET ${fieldsToUpdateSQL} WHERE id = ?`,
      [...values, id]
    );

    res.json({ 
      success: true,
      message: "Resident updated successfully" 
    });
  } catch (err) {
    console.error("Resident update error:", err.sqlMessage || err);
    res.status(500).json({ 
      success: false,
      error: "Failed to update resident" 
    });
  }
};

// ================= DELETE RESIDENT (UPDATED) =================
exports.deleteResident = async (req, res) => {
  try {
    const { id } = req.params;

    // Get resident info before deleting
    const [rows] = await db.query("SELECT id_picture FROM residents WHERE id = ?", [id]);
    const id_picture_to_delete = rows.length > 0 ? rows[0].id_picture : null;

    await db.query("DELETE FROM residents WHERE id = ?", [id]);
    
    // Delete ID picture file
    if (id_picture_to_delete) {
      const filePath = path.join(__dirname, "..", "uploads", "ids", id_picture_to_delete);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error("Error deleting resident ID file:", err);
      });
    }

    res.json({ 
      success: true,
      message: "Resident deleted successfully" 
    });
  } catch (err) {
    console.error("Resident deletion error:", err.sqlMessage || err);
    res.status(500).json({ 
      success: false,
      error: "Failed to delete resident" 
    });
  }
};

// ================= REJECT RESIDENT (UPDATED) =================
exports.rejectResident = async (req, res) => {
  try {
    const { id } = req.params;

    // First, get resident details BEFORE deleting
    const [residentDetails] = await db.query(
      `SELECT first_name, last_name, email_address, email, id_picture 
       FROM residents WHERE id = ? AND status = 'pending'`, 
      [id]
    );

    if (residentDetails.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Resident not found or already processed' 
      });
    }

    const resident = residentDetails[0];
    const id_picture_to_delete = resident.id_picture;

    // Delete the resident from database
    await db.query("DELETE FROM residents WHERE id = ?", [id]);

    // Send rejection email
    try {
      const emailToSend = resident.email_address || resident.email;
      const fullName = `${resident.first_name} ${resident.last_name}`;
      await emailService.sendRejectionEmail(emailToSend, fullName);
    } catch (emailError) {
      console.error('❌ Failed to send rejection email:', emailError);
      // Continue even if email fails
    }

    // Delete ID picture file
    if (id_picture_to_delete) {
      const filePath = path.join(__dirname, "..", "uploads", "ids", id_picture_to_delete);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error("Error deleting resident ID file:", err);
      });
    }

    res.json({ 
      success: true,
      message: "Resident rejected successfully", 
      emailSent: true 
    });
  } catch (err) {
    console.error("Resident rejection error:", err.sqlMessage || err);
    res.status(500).json({ 
      success: false,
      error: "Resident rejection failed" 
    });
  }
};

// ================= STAFF FUNCTIONS (REMAIN THE SAME) =================
exports.registerStaff = async (req, res) => {
  try {
    const { username, password, name, contact } = req.body;
    if (!username || !password || !name)
      return res.status(400).json({ error: "Missing required fields" });

    const hashed = await bcrypt.hash(password, 10);
    
    // Generate staff_id for self-registration
    const staff_id = `STAFF${Date.now().toString().slice(-6)}`;
    
    const fields = ["username", "password", "name", "contact", "staff_id", "status"];
    const values = [username, hashed, name, contact || "", staff_id, "pending"];
    const placeholders = fields.map(() => "?").join(",");

    await db.query(`INSERT INTO staff (${fields.join(",")}) VALUES (${placeholders})`, values);
    res.json({ message: "Staff registered successfully. Waiting for admin approval." });
  } catch (err) {
    console.error("Staff register error:", err.sqlMessage || err);
    res.status(500).json({ error: "Staff registration failed" });
  }
};
// ================= MIDDLEWARE =================
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
};
exports.loginStaff = async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username/Staff ID and password required" });
  }

  try {
    // Query to check both username and staff_id
    const [rows] = await db.query(
      "SELECT * FROM staff WHERE (username = ? OR staff_id = ?) AND status = 'approved'", 
      [username, username]
    );
    
    if (!rows.length) {
      return res.status(400).json({ error: "User not found or account not approved" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user, "staff");
    const { password: _, ...safeUser } = user;
    
    res.json({ 
      token, 
      user: safeUser,
      message: "Login successful"
    });
  } catch (err) {
    console.error("Staff login error:", err.sqlMessage || err);
    res.status(500).json({ error: "Staff login failed" });
  }
};

exports.getPendingStaff = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM staff WHERE status = 'pending'");
    res.json(rows);
  } catch (err) {
    console.error("Get pending staff error:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to fetch pending staff" });
  }
};

exports.getApprovedStaff = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM staff WHERE status = 'approved'");
    res.json(rows);
  } catch (err) {
    console.error("Get approved staff error:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to fetch approved staff" });
  }
};

exports.approveStaff = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("UPDATE staff SET status = 'approved' WHERE id = ?", [id]);
    res.json({ message: "Staff approved successfully" });
  } catch (err) {
    console.error("Staff approval error:", err.sqlMessage || err);
    res.status(500).json({ error: "Staff approval failed" });
  }
};

exports.rejectStaff = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM staff WHERE id = ?", [id]);
    res.json({ message: "Staff rejected and deleted successfully" });
  } catch (err) {
    console.error("Staff rejection error:", err.sqlMessage || err);
    res.status(500).json({ error: "Staff rejection failed" });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM staff WHERE id = ?", [id]);
    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    console.error("Staff deletion error:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to delete staff" });
  }
};

exports.createStaffByAdmin = async (req, res) => {
  try {
    const { username, password, name, contact, staff_id } = req.body;
    
    if (!username || !password || !name || !staff_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if username or staff_id already exists
    const [existingUser] = await db.query(
      "SELECT id FROM staff WHERE username = ? OR staff_id = ?", 
      [username, staff_id]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Username or Staff ID already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert staff with 'approved' status and staff_id
    await db.query(
      "INSERT INTO staff (username, password, name, contact, staff_id, status) VALUES (?, ?, ?, ?, ?, 'approved')",
      [username, hashedPassword, name, contact || "", staff_id]
    );

    res.status(201).json({ 
      message: "Staff account created successfully",
      staff: { username, name, contact, staff_id, status: 'approved' }
    });
  } catch (err) {
    console.error("Admin create staff error:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to create staff account" });
  }
};

// ================= ADMIN FUNCTIONS (REMAIN THE SAME) =================
exports.registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Missing username or password" });

    const hashed = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO admins (username, password, created_at) VALUES (?, ?, NOW())", [username, hashed]);

    res.json({ message: "Admin account created successfully" });
  } catch (err) {
    console.error("Admin register error:", err.sqlMessage || err);
    res.status(500).json({ error: "Admin registration failed" });
  }
};

exports.loginAdmin = (req, res) => {
  const { username, password } = req.body;
  loginUser("admins", "admin", username, password, res);
};

exports.checkAdminExists = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) as count FROM admins");
    res.json({ exists: rows[0].count > 0 });
  } catch (err) {
    console.error("Check admin exists error:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to check admin" });
  }
};

exports.getAllStaffRequests = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM staff");
    res.json(rows);
  } catch (err) {
    console.error("Get all staff error:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to fetch staff requests" });
  }
};

exports.updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        
        const fieldsToUpdate = [];
        const values = [];

        const allowedFields = ['username', 'name', 'contact', 'staff_id'];

        allowedFields.forEach(key => {
            if (body[key] !== undefined && body[key] !== null && body[key] !== '') {
                fieldsToUpdate.push(`${key} = ?`);
                values.push(body[key]);
            }
        });

        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ error: "No fields provided for staff update." });
        }

        values.push(id);
        const sql = `UPDATE staff SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;

        await db.query(sql, values);

        res.json({ message: "Staff updated successfully" });
    } catch (err) {
        console.error("Staff update error:", err.sqlMessage || err);
        res.status(500).json({ error: "Failed to update staff" });
    }
};



// ================= CHECK DUPLICATE REGISTRATION =================
exports.checkDuplicate = async (req, res) => {
  try {
    const { type, value, firstName, lastName } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: "Type parameter is required" });
    }

    switch(type) {
      case 'email':
        if (!value || !/\S+@\S+\.\S+/.test(value)) {
          return res.status(400).json({ 
            duplicate: false, 
            available: false,
            error: "Invalid email format" 
          });
        }
        
        const [emailRows] = await db.query(
          'SELECT id FROM residents WHERE email = ? OR email_address = ?',
          [value, value]
        );
        
        return res.json({
          duplicate: emailRows.length > 0,
          available: emailRows.length === 0,
          message: emailRows.length > 0 ? "Email already registered" : "Email available"
        });

      case 'mobile':
        if (!value || !/^\d{11}$/.test(value)) {
          return res.status(400).json({ 
            duplicate: false, 
            available: false,
            error: "Invalid mobile number" 
          });
        }
        
        const [mobileRows] = await db.query(
          'SELECT id FROM residents WHERE mobile_number = ?',
          [value]
        );
        
        return res.json({
          duplicate: mobileRows.length > 0,
          available: mobileRows.length === 0,
          message: mobileRows.length > 0 ? "Mobile number already registered" : "Mobile number available"
        });

      case 'username':
        if (!value || value.length < 3) {
          return res.status(400).json({ 
            duplicate: false, 
            available: false,
            error: "Username must be at least 3 characters" 
          });
        }
        
        const [userRows] = await db.query(
          'SELECT id FROM residents WHERE username = ?',
          [value]
        );
        
        return res.json({
          duplicate: userRows.length > 0,
          available: userRows.length === 0,
          message: userRows.length > 0 ? "Username already taken" : "Username available"
        });

      case 'names':
        if (!firstName || !lastName) {
          return res.status(400).json({ 
            duplicate: false,
            similarName: "",
            error: "First name and last name required" 
          });
        }
        
        // Check for similar names (first name and last name combination)
        const [nameRows] = await db.query(
          `SELECT id, CONCAT(first_name, ' ', last_name) as full_name 
           FROM residents 
           WHERE (first_name LIKE ? AND last_name LIKE ?) 
              OR (first_name LIKE ? AND last_name LIKE ?)`,
          [`%${firstName}%`, `%${lastName}%`, `%${lastName}%`, `%${firstName}%`]
        );
        
        if (nameRows.length > 0) {
          return res.json({
            duplicate: true,
            similarName: nameRows[0].full_name,
            count: nameRows.length,
            message: `Found ${nameRows.length} resident(s) with similar name`
          });
        }
        
        return res.json({
          duplicate: false,
          similarName: "",
          message: "No similar names found"
        });

      default:
        return res.status(400).json({ 
          duplicate: false, 
          available: false,
          error: "Invalid type parameter" 
        });
    }
  } catch (err) {
    console.error("Check duplicate error:", err);
    res.status(500).json({ 
      duplicate: false, 
      available: false,
      error: "Failed to check duplicate" 
    });
  }
};




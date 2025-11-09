// controllers/authController.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

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

// ================= RESIDENT =================
exports.getPendingResidents = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM residents WHERE status = 'pending'");
    res.json(rows);
  } catch (err) {
    console.error("Get pending residents error:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to fetch pending residents" });
  }
};

exports.registerResident = async (req, res) => {
  try {
    const {
      username, password, full_name, address, age, gender,
      contact, civil_status, youth_classification, education,
      registered_sk, registered_national,
    } = req.body;

    const id_picture = req.file ? req.file.filename : null;
    if (!username || !password || !full_name || !id_picture)
      return res.status(400).json({ error: "Missing required fields or ID picture" });

    const hashed = await bcrypt.hash(password, 10);

    const fields = [
      "username", "password", "full_name", "age", "address",
      "gender", "contact", "civil_status", "youth_classification",
      "education", "registered_sk", "registered_national",
      "status", "id_picture"
    ];

    const values = [
      username, hashed, full_name, age || 0, address || "",
      gender || "Male", contact || "", civil_status || "Single",
      youth_classification || "In School Youth", education || "",
      registered_sk || "No", registered_national || "No",
      "pending", id_picture
    ];

    const placeholders = fields.map(() => "?").join(", ");
    await db.query(`INSERT INTO residents (${fields.join(", ")}) VALUES (${placeholders})`, values);

    res.json({ message: "Resident registered, awaiting approval" });
  } catch (err) {
    console.error("Resident register error:", err.sqlMessage || err);
    res.status(500).json({ error: "Resident registration failed" });
  }
};

exports.loginResident = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM residents WHERE username = ?", [username]);
    if (!rows.length) return res.status(400).json({ error: "User not found" });

    const user = rows[0];
    if (user.status !== "approved") {
      return res.status(403).json({ error: "Account pending approval" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken(user, "resident");
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("Resident login error:", err.sqlMessage || err);
    res.status(500).json({ error: "Resident login failed" });
  }
};

exports.approveResident = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("UPDATE residents SET status = 'approved' WHERE id = ?", [id]);
    res.json({ message: "Resident approved successfully" });
  } catch (err) {
    console.error("Approval error:", err.sqlMessage || err);
    res.status(500).json({ error: "Approval failed" });
  }
};

// ================= STAFF =================
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

// UPDATED STAFF LOGIN - ALLOWS USERNAME OR STAFF_ID
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

// ================= ADMIN STAFF CREATION =================
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

// ================= ADMIN =================
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

// ================= STAFF UPDATE =================
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

// ================= RESIDENT MANAGEMENT =================
exports.getApprovedResidents = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM residents WHERE status = 'approved'");
    res.json(rows);
  } catch (err) {
    console.error("Get approved residents error:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to fetch approved residents" });
  }
};

exports.updateResident = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;

        const new_id_picture = req.file ? req.file.filename : null;
        
        const updateFields = {};
        const allowedFields = [
            'username', 'full_name', 'contact', 'address', 'age', 'gender', 
            'civil_status', 'youth_classification', 'education', 
            'registered_sk', 'registered_national', 'birthday'
        ];

        allowedFields.forEach(key => {
            if (body[key] !== undefined && body[key] !== null && body[key] !== '') {
                updateFields[key] = body[key];
            }
        });

        if (new_id_picture) {
            updateFields.id_picture = new_id_picture;

            const [rows] = await db.query("SELECT id_picture FROM residents WHERE id = ?", [id]);
            const old_id_picture = rows.length > 0 ? rows[0].id_picture : null;

            if (old_id_picture) {
                const filePath = path.join(__dirname, "..", "uploads", "ids", old_id_picture);
                fs.unlink(filePath, (err) => {
                    if (err && err.code !== 'ENOENT') console.error("Error deleting old resident ID file:", err);
                });
            }
        }

        const fieldsToUpdateSQL = Object.keys(updateFields).map(key => `${key} = ?`).join(", ");
        const values = Object.values(updateFields);

        if (fieldsToUpdateSQL.length === 0) {
            return res.status(400).json({ error: "No fields provided for resident update." });
        }
        
        await db.query(
            `UPDATE residents SET ${fieldsToUpdateSQL} WHERE id = ?`,
            [...values, id]
        );

        res.json({ message: "Resident updated successfully" });
    } catch (err) {
        console.error("Resident update error:", err.sqlMessage || err);
        res.status(500).json({ error: "Failed to update resident" });
    }
};

exports.deleteResident = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query("SELECT id_picture FROM residents WHERE id = ?", [id]);
    const id_picture_to_delete = rows.length > 0 ? rows[0].id_picture : null;

    await db.query("DELETE FROM residents WHERE id = ?", [id]);
    
    if (id_picture_to_delete) {
      const filePath = path.join(__dirname, "..", "uploads", "ids", id_picture_to_delete);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error("Error deleting resident ID file:", err);
      });
    }

    res.json({ message: "Resident deleted successfully" });
  } catch (err) {
    console.error("Resident deletion error:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to delete resident" });
  }
};

exports.rejectResident = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query("SELECT id_picture FROM residents WHERE id = ?", [id]);
    const id_picture_to_delete = rows.length > 0 ? rows[0].id_picture : null;

    await db.query("DELETE FROM residents WHERE id = ?", [id]);
    
    if (id_picture_to_delete) {
      const filePath = path.join(__dirname, "..", "uploads", "ids", id_picture_to_delete);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error("Error deleting resident ID file:", err);
      });
    }

    res.json({ message: "Resident rejected and deleted successfully" });
  } catch (err) {
    console.error("Resident rejection error:", err.sqlMessage || err);
    res.status(500).json({ error: "Resident rejection failed" });
  }
};
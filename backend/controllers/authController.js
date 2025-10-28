// controllers/authController.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs"); // Para sa File System operations (pagbura ng file)
const path = require("path"); // Para sa path resolution

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
    const fields = ["username", "password", "name", "contact"];
    const values = [username, hashed, name, contact || ""];
    const placeholders = fields.map(() => "?").join(",");

    await db.query(`INSERT INTO staff (${fields.join(",")}) VALUES (${placeholders})`, values);
    res.json({ message: "Staff registered successfully" });
  } catch (err) {
    console.error("Staff register error:", err.sqlMessage || err);
    res.status(500).json({ error: "Staff registration failed" });
  }
};

exports.loginStaff = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM staff WHERE username = ?", [username]);
    if (!rows.length) return res.status(400).json({ error: "User not found" });

    const user = rows[0];
    if (user.status !== "approved") return res.status(403).json({ error: "Account pending approval" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken(user, "staff");
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
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

/**
 * UPDATED: Handle Staff Update
 * Added logic to check for missing body fields now that req.body is parsed.
 */
exports.updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        
        // Maghanda ng array para sa mga field na ia-update
        const fieldsToUpdate = [];
        const values = [];

        // Mga field na inaasahan natin mula sa Staff
        const allowedFields = ['username', 'name', 'contact'];

        // Iterate sa allowedFields at idagdag lang ang may laman sa body
        allowedFields.forEach(key => {
            if (body[key] !== undefined && body[key] !== null && body[key] !== '') {
                fieldsToUpdate.push(`${key} = ?`);
                values.push(body[key]);
            }
        });

        // Kung walang fields na na-update, magbalik ng error o success message
        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ error: "No fields provided for staff update." });
        }

        // Idagdag ang ID sa dulo para sa WHERE clause
        values.push(id); 

        const sql = `UPDATE staff SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;

        await db.query(sql, values);

        res.json({ message: "Staff updated successfully" });
    } catch (err) {
        console.error("Staff update error:", err.sqlMessage || err);
        res.status(500).json({ error: "Failed to update staff" });
    }
};


//-------------si admin pwede din mag approved kay resident --------------


exports.getApprovedResidents = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM residents WHERE status = 'approved'");
    res.json(rows);
  } catch (err) {
    console.error("Get approved residents error:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to fetch approved residents" });
  }
};

/**
 * UPDATED: Handle Resident Update with Optional ID Picture Upload/Replacement
 * Includes logic to delete the old file if a new one is uploaded.
 */
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

        // Kolektahin ang fields na ia-update
        allowedFields.forEach(key => {
            if (body[key] !== undefined && body[key] !== null && body[key] !== '') {
                updateFields[key] = body[key];
            }
        });

        // Hanldle ID Picture replacement
        if (new_id_picture) {
            updateFields.id_picture = new_id_picture;

            // 1. Kunin ang luma na file name mula sa database
            const [rows] = await db.query("SELECT id_picture FROM residents WHERE id = ?", [id]);
            const old_id_picture = rows.length > 0 ? rows[0].id_picture : null;

            // 2. Burahin ang luma na file
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
            [...values, id] // Idagdag ang ID sa dulo
        );

        res.json({ message: "Resident updated successfully" });
    } catch (err) {
        console.error("Resident update error:", err.sqlMessage || err);
        res.status(500).json({ error: "Failed to update resident" });
    }
};

/**
 * UPDATED: Handle Resident Deletion
 * Includes logic to delete the ID picture file from the server.
 */
exports.deleteResident = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Kunin ang file name bago burahin ang record
    const [rows] = await db.query("SELECT id_picture FROM residents WHERE id = ?", [id]);
    const id_picture_to_delete = rows.length > 0 ? rows[0].id_picture : null;

    // 2. Burahin ang record sa database
    await db.query("DELETE FROM residents WHERE id = ?", [id]);
    
    // 3. Burahin ang file
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
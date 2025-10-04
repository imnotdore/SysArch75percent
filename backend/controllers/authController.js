// controllers/authController.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= JWT TOKEN GENERATOR =================
const generateToken = (user, role) => {
  return jwt.sign(
    { id: user.id, username: user.username, role },
    process.env.JWT_SECRET || "supersecretkey",
    { expiresIn: "1d" }
  );
};

// ================= GENERIC FUNCTIONS =================
const registerUser = async (table, username, password, res, extraFields = {}) => {
  try {
    const hashed = await bcrypt.hash(password, 10);
    const fields = ["username", "password", ...Object.keys(extraFields)];
    const values = [username, hashed, ...Object.values(extraFields)];
    const placeholders = fields.map(() => "?").join(", ");

    await db.query(
      `INSERT INTO ${table} (${fields.join(", ")}) VALUES (${placeholders})`,
      values
    );

    res.json({ message: `${table} registered successfully` });
  } catch (err) {
    console.error(`Register error (${table}):`, err.sqlMessage || err);
    res.status(500).json({ error: "Registration failed" });
  }
};

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
exports.registerResident = async (req, res) => {
  try {
    const {
      username,
      password,
      full_name,
      address,
      age,
      gender,
      contact,
      civil_status,
      youth_classification,
      education,
      registered_sk,
      registered_national,
    } = req.body;

    if (!username || !password || !full_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const fields = [
      "username",
      "password",
      "full_name",
      "age",
      "address",
      "gender",
      "contact",
      "civil_status",
      "youth_classification",
      "education",
      "registered_sk",
      "registered_national",
      "status",
    ];

    const values = [
      username,
      hashed,
      full_name,
      age || 0,
      address || "",
      gender || "male",
      contact || "",
      civil_status || "Single",
      youth_classification || "In School Youth",
      education || "",
      registered_sk || "No",
      registered_national || "No",
      "pending",
    ];

    const placeholders = fields.map(() => "?").join(", ");

    await db.query(`INSERT INTO residents (${fields.join(", ")}) VALUES (${placeholders})`, values);

    res.json({ message: "Resident registered successfully" });
  } catch (err) {
    console.error("Resident register error:", err.sqlMessage || err);
    res.status(500).json({ error: "Resident registration failed" });
  }
};

exports.loginResident = (req, res) => {
  const { username, password } = req.body;
  loginUser("residents", "resident", username, password, res);
};

// ================= STAFF =================
// ================= STAFF =================
exports.registerStaff = async (req, res) => {
  try {
    const { username, password, name, contact } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const fields = ["username", "password", "name", "contact"];
    const values = [username, hashed, name, contact || ""];
    const placeholders = fields.map(() => "?").join(",");

    await db.query(
      `INSERT INTO staff (${fields.join(",")}) VALUES (${placeholders})`,
      values
    );

    res.json({ message: "Staff registered successfully" });
  } catch (err) {
    console.error("Staff register error:", err.sqlMessage || err);
    res.status(500).json({ error: "Staff registration failed" });
  }
};


exports.loginStaff = (req, res) => {
  const { username, password } = req.body;
  loginUser("staff", "staff", username, password, res);
};

// ================= ADMIN =================
exports.registerAdmin = (req, res) => {
  const { username, password } = req.body;
  registerUser("admins", username, password, res);
};

exports.loginAdmin = (req, res) => {
  const { username, password } = req.body;
  loginUser("admins", "admin", username, password, res);
};

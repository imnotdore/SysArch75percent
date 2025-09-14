const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (user, role) => {
  return jwt.sign(
    { id: user.id, username: user.username, role },
    process.env.JWT_SECRET || "supersecretkey", // fallback para di mag-crash pag wala sa .env
    { expiresIn: "1d" }
  );
};

// Helper function para DRY code (avoid repetition)
const registerUser = async (table, username, password, res) => {
  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.query(`INSERT INTO ${table} (username, password) VALUES (?, ?)`, [
      username,
      hashed,
    ]);
    res.json({ message: `${table} registered successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
};

const loginUser = async (table, role, username, password, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM ${table} WHERE username = ?`,
      [username]
    );
    if (!rows.length) return res.status(400).json({ error: "User not found" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken(user, role);

    // Para hindi ibalik yung password sa frontend
    const { password: _, ...safeUser } = user;

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};

// ========== RESIDENT ==========
exports.registerResident = (req, res) => {
  const { username, password } = req.body;
  registerUser("residents", username, password, res);
};

exports.loginResident = (req, res) => {
  const { username, password } = req.body;
  loginUser("residents", "resident", username, password, res);
};

// ========== STAFF ==========
exports.registerStaff = (req, res) => {
  const { username, password } = req.body;
  registerUser("staff", username, password, res);
};

exports.loginStaff = (req, res) => {
  const { username, password } = req.body;
  loginUser("staff", "staff", username, password, res);
};

// ========== ADMIN ==========
exports.registerAdmin = (req, res) => {
  const { username, password } = req.body;
  registerUser("admins", username, password, res);
};

exports.loginAdmin = (req, res) => {
  const { username, password } = req.body;
  loginUser("admins", "admin", username, password, res);
};

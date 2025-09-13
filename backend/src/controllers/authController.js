// controllers/authController.js
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // your promise pool
const bcrypt = require('bcryptjs');

// Helper: Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/* -------------------
   ADMIN
------------------- */
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const [results] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);

    if (results.length === 0) return res.status(400).json({ error: 'Invalid username or password' });

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: 'Invalid username or password' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: 'admin' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: 'Database error' });
  }
};

const registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const [existing] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (existing.length > 0) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await hashPassword(password);
    await db.query('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hashedPassword]);
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (err) {
    console.error("Admin registration error:", err);
    res.status(500).json({ error: 'Database error' });
  }
};

/* -------------------
   STAFF
------------------- */
const loginStaff = async (req, res) => {
  try {
    const { username, password } = req.body;
    const [results] = await db.query('SELECT * FROM staff WHERE username = ? AND active = 1', [username]);

    if (results.length === 0) return res.status(400).json({ error: 'Invalid username or password' });

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: 'Invalid username or password' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: 'staff' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error("Staff login error:", err);
    res.status(500).json({ error: 'Database error' });
  }
};

const registerStaff = async (req, res) => {
  try {
    const { staff_id, name, username, password, contact } = req.body;
    const [existing] = await db.query('SELECT * FROM staff WHERE username = ? OR staff_id = ?', [username, staff_id]);
    if (existing.length > 0) return res.status(400).json({ error: 'Username or Staff ID already exists' });

    const hashedPassword = await hashPassword(password);
    await db.query(
      'INSERT INTO staff (staff_id, name, username, password, contact, active) VALUES (?, ?, ?, ?, ?, 1)',
      [staff_id, name, username, hashedPassword, contact]
    );

    res.status(201).json({ message: 'Staff registered successfully' });
  } catch (err) {
    console.error("Staff registration error:", err);
    res.status(500).json({ error: 'Database error' });
  }
};

/* -------------------
   RESIDENT
------------------- */
const loginResident = async (req, res) => {
  try {
    const { username, password } = req.body;
    const [results] = await db.query('SELECT * FROM residents WHERE username = ? AND active = 1', [username]);

    if (results.length === 0) return res.status(400).json({ error: 'Invalid username or password' });

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: 'Invalid username or password' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: 'resident' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error("Resident login error:", err);
    res.status(500).json({ error: 'Database error' });
  }
};

const registerResident = async (req, res) => {
  try {
    const { full_name, address, age, gender, contact, username, password } = req.body;
    const [existing] = await db.query('SELECT * FROM residents WHERE username = ?', [username]);
    if (existing.length > 0) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await hashPassword(password);
    await db.query(
      'INSERT INTO residents (full_name, address, age, gender, contact, username, password, active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [full_name, address, age, gender, contact, username, hashedPassword]
    );

    res.status(201).json({ message: 'Resident registered successfully' });
  } catch (err) {
    console.error("Resident registration error:", err);
    res.status(500).json({ error: 'Database error' });
  }
};

/* -------------------
   AUTH MIDDLEWARE
------------------- */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, decoded) => {
    if (err) {
      console.error("JWT verification failed:", err);
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log("Decoded JWT:", decoded); // debug
    req.user = decoded;
    next();
  });
};

/* -------------------
   GET RESIDENT PROFILE
------------------- */
const getResidentProfile = async (req, res) => {
  try {
    const residentId = req.user.id;
    const [results] = await db.query(
      'SELECT id, full_name, address, age, gender, contact, username FROM residents WHERE id = ?',
      [residentId]
    );

    if (results.length === 0) return res.status(404).json({ error: 'Resident not found' });
    res.json(results[0]);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  loginAdmin,
  registerAdmin,
  loginStaff,
  registerStaff,
  loginResident,
  registerResident,
  authMiddleware,
  getResidentProfile,
};

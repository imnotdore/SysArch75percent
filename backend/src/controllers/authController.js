const jwt = require('jsonwebtoken');
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Helper: Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/* Admin */
const loginAdmin = (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM admins WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(400).json({ error: 'Invalid username or password' });

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: 'Invalid username or password' });

    const token = jwt.sign({ id: user.id, username: user.username, role: 'admin' },
      process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });

    res.json({ token });
  });
};

const registerAdmin = async (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM admins WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length > 0) return res.status(400).json({ error: 'Username already exists' });

    try {
      const hashedPassword = await hashPassword(password);
      db.query('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to create admin' });
        }
        res.status(201).json({ message: 'Admin created successfully' });
      });
    } catch {
      res.status(500).json({ error: 'Password hashing failed' });
    }
  });
};

/* Staff */
const registerStaff = async (req, res) => {
  const { staff_id, name, username, password, contact } = req.body;
  db.query('SELECT * FROM staff WHERE username = ? OR staff_id = ?', [username, staff_id], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length > 0) return res.status(400).json({ error: 'Username or Staff ID already exists' });

    try {
      const hashedPassword = await hashPassword(password);
      db.query(
        'INSERT INTO staff (staff_id, name, username, password, contact, active) VALUES (?, ?, ?, ?, ?, 1)',
        [staff_id, name, username, hashedPassword, contact],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to create staff' });
          }
          res.status(201).json({ message: 'Staff registered successfully' });
        }
      );
    } catch {
      res.status(500).json({ error: 'Password hashing failed' });
    }
  });
};

const loginStaff = (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM staff WHERE username = ? AND active = 1', [username], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(400).json({ error: 'Invalid username or password' });

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: 'Invalid username or password' });

    const token = jwt.sign({ id: user.id, username: user.username, role: 'staff' },
      process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });

    res.json({ token });
  });
};

/* Resident */
const registerResident = async (req, res) => {
  const { full_name, address, age, gender, contact, username, password } = req.body;
  db.query('SELECT * FROM residents WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length > 0) return res.status(400).json({ error: 'Username already exists' });

    try {
      const hashedPassword = await hashPassword(password);
      db.query(
        'INSERT INTO residents (full_name, address, age, gender, contact, username, password, active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
        [full_name, address, age, gender, contact, username, hashedPassword],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to create resident' });
          }
          res.status(201).json({ message: 'Resident registered successfully' });
        }
      );
    } catch {
      res.status(500).json({ error: 'Password hashing failed' });
    }
  });
};

const loginResident = (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM residents WHERE username = ? AND active = 1', [username], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(400).json({ error: 'Invalid username or password' });

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: 'Invalid username or password' });

    const token = jwt.sign({ id: user.id, username: user.username, role: 'resident' },
      process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });

    res.json({ token });
  });
};

module.exports = {
  loginAdmin,
  registerAdmin,
  loginStaff,
  registerStaff,
  loginResident,
  registerResident
};

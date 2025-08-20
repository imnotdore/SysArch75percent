require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

async function migrate() {
  const tableQueries = [
    `CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      password VARCHAR(255) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS staff (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(50) NOT NULL,
      name VARCHAR(100) NOT NULL,
      username VARCHAR(50) NOT NULL,
      password VARCHAR(255) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS residents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      address VARCHAR(255),
      age INT,
      gender VARCHAR(10),
      contact VARCHAR(20)
    )`
  ];

  for (let sql of tableQueries) {
    await new Promise((resolve, reject) => {
      db.query(sql, (err) => {
        if (err) return reject(err);
        console.log(`✅ Table ready: ${sql.split(' ')[5]}`);
        resolve();
      });
    });
  }

  // Insert default Admin if it doesn't exist
  const defaultUsername = 'admin';
  const defaultPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  db.query(`SELECT * FROM admins WHERE username = ?`, [defaultUsername], (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      db.query(
        `INSERT INTO admins (username, password) VALUES (?, ?)`,
        [defaultUsername, hashedPassword],
        (err) => {
          if (err) throw err;
          console.log(`✅ Default Admin created → username: ${defaultUsername}, password: ${defaultPassword}`);
          process.exit();
        }
      );
    } else {
      console.log('ℹ️ Admin already exists, skipping creation...');
      process.exit();
    }
  });
}

migrate();

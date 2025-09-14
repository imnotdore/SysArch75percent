// backend/config/db.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",       // palitan kung iba yung user mo
  password: "",       // lagyan kung may password ang MySQL mo
  database: "barangay_db", // palitan kung ibang DB name gamit mo
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;

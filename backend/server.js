// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const itemRoutes = require('./routes/itemRoutes');
const borrowingRoutes = require('./routes/borrowingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const itemAdminRoutes = require("./routes/itemAdminRoutes");
const adminRoutes = require("./routes/adminRoutes"); // ✅ DAGDAG MO ITO!
const computerBorrowRoutes = require("./routes/computerBorrowRoutes");
const app = express();

const scheduleRoutes = require('./routes/scheduleRoutes');

// ---------------- Middleware ---------------- //
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/items/admin", itemAdminRoutes);

// ---------------- Routes ---------------- //
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/files", require("./routes/fileRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/schedules", require("./routes/scheduleRoutes"));
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/disclosures", require("./routes/disclosureRoutes"));
app.use("/api/computer-borrow", require("./routes/computerBorrowRoutes"));
app.use('/api/items', itemRoutes);
app.use('/api/borrowing', borrowingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/admin", adminRoutes); // ✅ DAGDAG MO ITO!
app.use("/api/computer-requests", computerBorrowRoutes);
// ---------------- Health Check ---------------- //
app.get("/", (req, res) => res.send("Barangay Management System Backend is running"));

// ---------------- Start Server ---------------- //
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
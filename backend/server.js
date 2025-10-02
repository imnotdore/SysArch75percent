require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ---------------- Middleware ---------------- //
app.use(cors({ origin: "http://localhost:5173", credentials: true }));



// basta pang testing to sa mobile view
/*const allowedOrigins = [
  "http://localhost:5173",       // desktop
  "http://192.168.100.12:5173"  // phone
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser tools like Postman
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));*/

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------- Routes ---------------- //
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/files", require("./routes/fileRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/schedules", require("./routes/scheduleRoutes"));
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/disclosures", require("./routes/disclosureRoutes"));

// ---------------- Health Check ---------------- //
app.get("/", (req, res) => res.send("Barangay Management System Backend is running"));

// ---------------- Start Server ---------------- //
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

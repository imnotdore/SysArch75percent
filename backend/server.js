require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/files", require("./routes/fileRoutes"));
app.use("/api/schedules", require("./routes/scheduleRoutes"));
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/disclosures", require("./routes/disclosureRoutes"));

app.get("/", (req, res) => res.send("Barangay Management System Backend is running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

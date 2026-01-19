// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { checkAdminExists } = require("../controllers/authController");
const multer = require("multer");
const adminController = require("../controllers/adminController"); // ✅ Mayroon na ito

// ---------------- Multer setup for ID uploads ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/ids"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage }); 

// ================= RESIDENT ROUTES =================
router.post(
  "/resident/register",
  upload.single("id_picture"),
  authController.registerResident
);
router.post("/resident/login", authController.loginResident);
router.put("/resident/approve/:id", authController.approveResident);
router.delete("/resident/reject/:id", authController.rejectResident);

// ================= STAFF ROUTES =================
router.post("/staff/register", authController.registerStaff);
router.post("/staff/login", authController.loginStaff);
router.get("/staff/residents/accounts", authController.getPendingResidents);

// ================= ADMIN ROUTES =================
router.post("/admin/register", authController.registerAdmin);
router.post("/admin/login", authController.loginAdmin);
router.get("/admin/check-exists", authController.checkAdminExists);

// --- Staff management for Admin ---
router.get("/admin/staff/pending", authController.getPendingStaff);
router.get("/admin/staff/approved", authController.getApprovedStaff);
router.post("/admin/staff-requests/:id/accept", authController.approveStaff);
router.post("/admin/staff-requests/:id/reject", authController.rejectStaff);
router.get("/admin/staff-requests", authController.getAllStaffRequests);
router.post('/admin/create-staff', authController.createStaffByAdmin);
router.put("/admin/staff/:id", upload.single("id_picture"), authController.updateStaff); 
router.delete("/admin/staff/:id", authController.deleteStaff);

// --- Resident management for Admin ---
router.get("/admin/residents/pending", authController.getPendingResidents);
router.get("/admin/residents/approved", authController.getApprovedResidents);
router.put("/admin/residents/:id", upload.single("id_picture"), authController.updateResident); 
router.delete("/admin/residents/:id", authController.deleteResident);
router.delete("/admin/residents/:id/reject", authController.rejectResident);

// --- Page Limits for Admin --- 🆕 DAGDAG MO ITO! 🆕
router.get("/admin/page-limits", 
  authController.verifyToken, 
  authController.isAdmin, 
  adminController.getPageLimits
);

router.put("/admin/page-limits", 
  authController.verifyToken, 
  authController.isAdmin, 
  adminController.updatePageLimit
);
// routes/authRoutes.js - Add this route
router.get("/today-usage/:userId", 
  authController.verifyToken,
  adminController.getTodayUsage
);

// Keep the existing routes
router.get("/admin/page-limits", 
  authController.verifyToken, 
  authController.isAdmin, 
  adminController.getPageLimits
);

router.put("/admin/page-limits", 
  authController.verifyToken, 
  authController.isAdmin, 
  adminController.updatePageLimit
);
// Add this route
router.post('/check-duplicate', authController.checkDuplicate);

module.exports = router;
const express = require('express');
const router = express.Router();
const { getSchedules, createSchedule } = require('../controllers/scheduleController');
const { authMiddleware } = require('../controllers/authController');

// 🔹 GET all schedules for logged-in resident
router.get('/schedules', authMiddleware, getSchedules);

// 🔹 POST new schedule
router.post('/schedules', authMiddleware, createSchedule);

module.exports = router;

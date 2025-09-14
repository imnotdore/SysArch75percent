const express = require("express");
const router = express.Router();
const { createSchedule, getUserSchedules, getAllSchedules, updateScheduleStatus } = require("../controllers/scheduleController");

router.post("/", createSchedule);
router.get("/", getAllSchedules);          // <--- move this first
router.get("/:user_id", getUserSchedules);
router.put("/:id/status", updateScheduleStatus);


module.exports = router;

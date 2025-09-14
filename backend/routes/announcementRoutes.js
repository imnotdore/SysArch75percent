const express = require("express");
const router = express.Router();
const { addAnnouncement, getAnnouncements } = require("../controllers/announcementController");

router.post("/", addAnnouncement);
router.get("/", getAnnouncements);

module.exports = router;

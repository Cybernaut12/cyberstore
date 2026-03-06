const express = require("express");
const router = express.Router();

const { protect, admin } = require("../middleware/authMiddleware");
const { getAdminStats } = require("../controllers/adminController");

router.get("/stats", protect, admin, getAdminStats);

module.exports = router;
const express = require("express");
const router = express.Router();

const { protect, admin } = require("../middleware/authMiddleware");
const { getAdminStats, getAdmins, addAdmin } = require("../controllers/adminController");

router.get("/stats", protect, admin, getAdminStats);
router.get("/admins", protect, admin, getAdmins);
router.post("/admins", protect, admin, addAdmin);

module.exports = router;

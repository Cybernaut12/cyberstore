const express = require("express");
const { uploadImage } = require("../controllers/uploadController");
const upload = require("../middleware/uploadMiddleware");

const { protect } = require("../middleware/authMiddleware");
const { isSellerOrAdmin } = require("../middleware/roleMiddleware");

const router = express.Router();

// Seller/Admin uploads product image
router.post("/", protect, isSellerOrAdmin, upload.single("image"), uploadImage);

module.exports = router;

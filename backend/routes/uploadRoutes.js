const express = require("express");
const { uploadImage } = require("../controllers/uploadController");
const upload = require("../middleware/uploadMiddleware");

const { protect } = require("../middleware/authMiddleware");
const { isSeller } = require("../middleware/roleMiddleware");

const router = express.Router();

// Seller uploads product image
router.post("/", protect, isSeller, upload.single("image"), uploadImage);

module.exports = router;

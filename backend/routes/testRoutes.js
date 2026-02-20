const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { isSeller } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/private", protect, (req, res) => {
  res.json({
    message: "Welcome! You are logged in.",
    user: req.user,
  });
});

router.get("/seller", protect, isSeller, (req, res) => {
  res.json({
    message: "Welcome Seller! You can upload products.",
    user: req.user,
  });
});

module.exports = router;

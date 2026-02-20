const express = require("express");
const {
  registerUser,
  loginUser,
} = require("../controllers/authController");
const { registerValidator, loginValidator } = require("../validators/authValidators");
const { validate } = require("../middleware/validateMiddleware");

const router = express.Router();
const { authLimiter } = require("../middleware/rateLimitMiddleware");


router.post("/register", authLimiter, registerValidator, validate, registerUser);
router.post("/login", authLimiter, loginValidator, validate, loginUser);

module.exports = router;

const express = require("express");
const {
  registerUser,
  loginUser,
  verifyRegisterOtp,
  resendRegisterOtp,
  forgotPassword,
  resetPassword,
  googleAuth,
} = require("../controllers/authController");
const {
  registerValidator,
  loginValidator,
  verifyRegisterOtpValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  googleAuthValidator,
} = require("../validators/authValidators");
const { validate } = require("../middleware/validateMiddleware");

const router = express.Router();
const { authLimiter } = require("../middleware/rateLimitMiddleware");


router.post("/register", authLimiter, registerValidator, validate, registerUser);
router.post("/register/verify", authLimiter, verifyRegisterOtpValidator, validate, verifyRegisterOtp);
router.post("/register/resend", authLimiter, forgotPasswordValidator, validate, resendRegisterOtp);
router.post("/login", authLimiter, loginValidator, validate, loginUser);
router.post("/forgot-password", authLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post("/reset-password", authLimiter, resetPasswordValidator, validate, resetPassword);
router.post("/google", authLimiter, googleAuthValidator, validate, googleAuth);

module.exports = router;

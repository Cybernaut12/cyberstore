const { body } = require("express-validator");

exports.registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["buyer", "seller"])
    .withMessage("Role must be buyer or seller"),
];

exports.loginValidator = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

exports.verifyRegisterOtpValidator = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("code")
    .isLength({ min: 4, max: 8 })
    .withMessage("Verification code is required"),
];

// Backward-compatible alias
exports.verifyLoginOtpValidator = exports.verifyRegisterOtpValidator;

exports.forgotPasswordValidator = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
];

exports.resetPasswordValidator = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("code")
    .isLength({ min: 4, max: 8 })
    .withMessage("Reset code is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

exports.googleAuthValidator = [
  body("credential").notEmpty().withMessage("Google credential is required"),
  body("role")
    .optional()
    .isIn(["buyer", "seller"])
    .withMessage("Role must be buyer or seller"),
];

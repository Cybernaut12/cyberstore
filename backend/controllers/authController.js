const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../models/User");
const { sendEmail, isEmailConfigured } = require("../utils/email");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const hashCode = (code) =>
  crypto.createHash("sha256").update(String(code)).digest("hex");

const generateOtpCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const sendSignupOtp = async (user) => {
  const code = generateOtpCode();
  user.loginOtpHash = hashCode(code);
  user.loginOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  const subject = "CyberStore Signup Verification Code";
  const text = `Your signup verification code is ${code}. It expires in 10 minutes.`;
  const delivery = await sendEmail({ to: user.email, subject, text });
  return { code, delivery };
};

const verifyGoogleToken = async (credential) => {
  const { data } = await axios.get("https://oauth2.googleapis.com/tokeninfo", {
    params: { id_token: credential },
    timeout: 10000,
  });

  const audience = data?.aud || data?.azp || "";
  if (audience !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Invalid Google token audience");
  }

  const emailVerified = String(data?.email_verified || "").toLowerCase() === "true";
  if (!emailVerified) {
    throw new Error("Google account email is not verified");
  }

  return {
    email: String(data?.email || "").toLowerCase(),
    name: String(data?.name || "").trim(),
  };
};

exports.registerUser = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const role = req.body.role === "seller" ? "seller" : "buyer";
    const hasMailer = isEmailConfigured();

    if (!hasMailer && process.env.NODE_ENV === "production") {
      return res.status(503).json({
        message: "Signup verification is temporarily unavailable. Please try again later.",
      });
    }

    let user = await User.findOne({ email });

    if (user && user.isEmailVerified !== false) {
      return res.status(400).json({ message: "User already exists", success: false });
    }

    if (!user) {
      user = await User.create({
        name,
        email,
        password,
        role,
        isEmailVerified: false,
      });
    } else {
      user.name = name;
      user.password = password;
      user.role = role;
      user.isEmailVerified = false;
      await user.save();
    }

    const { code, delivery } = await sendSignupOtp(user);
    if (!delivery?.delivered) {
      if (process.env.NODE_ENV !== "production") {
        return res.status(201).json({
          message: `Email delivery failed. Use this signup code: ${code}`,
          requiresOtp: true,
          email: user.email,
          devCode: code,
        });
      }

      return res.status(503).json({
        message: "Unable to send signup verification email right now. Please try again shortly.",
      });
    }

    return res.status(201).json({
      message: "Verification code sent to your email",
      requiresOtp: true,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Login with email/password (signup OTP is handled during registration)
exports.loginUser = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password", success: false });
    }

    if (user.isEmailVerified === false) {
      return res.status(403).json({
        message: "Please verify your email from the signup code before login.",
        requiresVerification: true,
        email: user.email,
      });
    }

    return res.json({
      ...sanitizeUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Verify signup OTP and issue token
exports.verifyRegisterOtp = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const code = String(req.body.code || "").trim();

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isEmailVerified === true) {
      return res.json({
        ...sanitizeUser(user),
        token: generateToken(user._id),
      });
    }

    const isValid =
      user.loginOtpHash &&
      user.loginOtpExpires &&
      user.loginOtpExpires > new Date() &&
      user.loginOtpHash === hashCode(code);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    user.loginOtpHash = "";
    user.loginOtpExpires = null;
    user.isEmailVerified = true;
    await user.save();

    return res.json({
      ...sanitizeUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.resendRegisterOtp = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const hasMailer = isEmailConfigured();

    if (!hasMailer && process.env.NODE_ENV === "production") {
      return res.status(503).json({
        message: "Email verification is temporarily unavailable. Please try again later.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isEmailVerified === true) {
      return res.status(400).json({ message: "Email is already verified. Please login." });
    }

    const { code, delivery } = await sendSignupOtp(user);
    if (!delivery?.delivered) {
      if (process.env.NODE_ENV !== "production") {
        return res.json({ message: `Email delivery failed. Signup code: ${code}`, devCode: code });
      }

      return res.status(503).json({
        message: "Unable to resend signup verification email right now. Please try again shortly.",
      });
    }

    return res.json({ message: "Signup verification code re-sent" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const hasMailer = isEmailConfigured();

    if (!hasMailer && process.env.NODE_ENV === "production") {
      return res.status(503).json({
        message: "Password reset email is temporarily unavailable. Please try again later.",
      });
    }

    const user = await User.findOne({ email });

    // Avoid leaking which emails exist.
    if (!user) {
      return res.json({
        message: "If that email exists, a reset code has been sent.",
      });
    }

    const code = generateOtpCode();
    user.resetCodeHash = hashCode(code);
    user.resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const subject = "CyberStore Password Reset Code";
    const text = `Your reset code is ${code}. It expires in 15 minutes.`;
    const delivery = await sendEmail({ to: user.email, subject, text });

    if (!delivery?.delivered) {
      if (process.env.NODE_ENV !== "production") {
        return res.json({
          message: `Email delivery failed. Use this dev reset code: ${code}`,
          devCode: code,
        });
      }

      return res.status(503).json({
        message: "Unable to send reset email right now. Please try again shortly.",
      });
    }

    return res.json({ message: "Reset code sent to your email" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const code = String(req.body.code || "").trim();
    const password = String(req.body.password || "");

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isValid =
      user.resetCodeHash &&
      user.resetCodeExpires &&
      user.resetCodeExpires > new Date() &&
      user.resetCodeHash === hashCode(code);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    user.password = password;
    user.resetCodeHash = "";
    user.resetCodeExpires = null;
    await user.save();

    return res.json({ message: "Password reset successful. You can now login." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({
        message: "Google login is not configured on server",
      });
    }

    const credential = String(req.body.credential || "");
    const requestedRole = req.body.role === "seller" ? "seller" : "buyer";
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    const payload = await verifyGoogleToken(credential);
    const email = payload.email;
    if (!email) return res.status(400).json({ message: "Google account email not found" });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: payload.name || "Google User",
        email,
        password: crypto.randomBytes(16).toString("hex"),
        role: requestedRole,
        isEmailVerified: true,
      });
    } else if (user.isEmailVerified === false) {
      user.isEmailVerified = true;
      await user.save();
    }

    return res.json({
      ...sanitizeUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

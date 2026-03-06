const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect route (require login)
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};

// Admin only
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({ message: "Not authorized as admin" });
};

// Seller only
exports.seller = (req, res, next) => {
  if (req.user && req.user.role === "seller") {
    return next();
  }

  return res.status(403).json({ message: "Not authorized as seller" });
};
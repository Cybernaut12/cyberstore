const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// GET /api/admin/stats  (Admin only)
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const pendingProducts = await Product.countDocuments({ status: "pending" });
    const totalOrders = await Order.countDocuments();

    // Revenue = sum of paid orders totalPrice
    const paidOrders = await Order.find({ isPaid: true }).select("totalPrice");
    const totalRevenue = paidOrders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);

    res.json({
      totalUsers,
      totalProducts,
      pendingProducts,
      totalOrders,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/admins  (Admin only)
exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("_id name email role createdAt")
      .sort({ createdAt: -1 });

    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/admin/admins  (Admin only)
// Create new admin OR promote existing user to admin
exports.addAdmin = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      if (existing.role === "admin") {
        return res.status(400).json({ message: "User is already an admin" });
      }

      existing.role = "admin";
      if (name) existing.name = name;
      if (password) existing.password = password;
      await existing.save();

      return res.json({
        message: "User promoted to admin",
        admin: {
          _id: existing._id,
          name: existing.name,
          email: existing.email,
          role: existing.role,
          createdAt: existing.createdAt,
        },
      });
    }

    if (!name) {
      return res.status(400).json({ message: "Name is required to create a new admin" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    return res.status(201).json({
      message: "Admin created successfully",
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
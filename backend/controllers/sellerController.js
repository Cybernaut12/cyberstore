const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc   Get orders that include seller's products
// @route  GET /api/seller/orders
// @access Private (Seller)
exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Get all seller products IDs
    const sellerProducts = await Product.find({ seller: sellerId }).select("_id");
    const sellerProductIds = sellerProducts.map((p) => p._id.toString());

    // Find orders containing any of seller products
    const orders = await Order.find({
      "orderItems.product": { $in: sellerProductIds },
    }).populate("user", "name email");

    // Filter orderItems to return only items belonging to this seller
    const filteredOrders = orders.map((order) => {
      const items = order.orderItems.filter((item) =>
        sellerProductIds.includes(item.product.toString())
      );

      return {
        _id: order._id,
        buyer: order.user,
        orderItems: items,
        totalPrice: order.totalPrice,
        isPaid: order.isPaid,
        status: order.status,
        paidAt: order.paidAt,
        createdAt: order.createdAt,
      };
    });

    res.json(filteredOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get seller revenue summary
// @route  GET /api/seller/summary
// @access Private (Seller)
exports.getSellerSummary = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const Product = require("../models/Product");
    const Order = require("../models/Order");

    // Get seller products
    const sellerProducts = await Product.find({ seller: sellerId }).select("_id");
    const sellerProductIds = sellerProducts.map((p) => p._id.toString());

    // Get paid orders containing seller products
    const orders = await Order.find({
      isPaid: true,
      "orderItems.product": { $in: sellerProductIds },
    });

    let totalRevenue = 0;
    let totalItemsSold = 0;
    let totalOrders = orders.length;
    let deliveredOrders = 0;

    orders.forEach((order) => {
      let sellerOrderRevenue = 0;

      order.orderItems.forEach((item) => {
        if (sellerProductIds.includes(item.product.toString())) {
          sellerOrderRevenue += item.price * item.qty;
          totalItemsSold += item.qty;
        }
      });

      totalRevenue += sellerOrderRevenue;

      if (order.status === "Delivered") {
        deliveredOrders += 1;
      }
    });

    res.json({
      totalRevenue,
      totalItemsSold,
      totalOrders,
      deliveredOrders,
      totalProducts: sellerProducts.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

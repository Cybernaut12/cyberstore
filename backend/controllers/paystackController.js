const axios = require("axios");
const Order = require("../models/Order");

const PAYSTACK_BASE_URL = "https://api.paystack.co";

exports.initializePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate("user", "email name");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // only owner can init payment
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: "Order already paid" });
    }

    const amountKobo = Math.round(Number(order.totalPrice) * 100);

    const payload = {
      email: order.user.email,
      amount: amountKobo,
      currency: "NGN",
      callback_url: process.env.PAYSTACK_CALLBACK_URL,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    };

    const { data } = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Paystack returns status + data (authorization_url, access_code, reference)
    if (!data.status) {
      return res.status(400).json({ message: data.message || "Paystack init failed" });
    }

    order.paymentReference = data.data.reference;
    await order.save();

    res.json({
      message: "Payment initialized",
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    });
  } catch (error) {
    res.status(500).json({ message: error.response?.data?.message || error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const order = await Order.findOne({ paymentReference: reference }).populate(
      "user",
      "name email"
    );

    if (!order) return res.status(404).json({ message: "Order not found for this reference" });

    // only owner can verify (admin/webhook can verify later too)
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { data } = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (!data.status) {
      return res.status(400).json({ message: data.message || "Verification failed" });
    }

    // Paystack verification data is in data.data
    const tx = data.data;

    if (tx.status === "success") {
      if (!order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date(tx.paid_at || Date.now());
        order.status = "Paid";

        order.paymentResult = {
          status: tx.status,
          reference: tx.reference,
          paidAt: tx.paid_at,
          channel: tx.channel,
          currency: tx.currency,
        };

        await order.save();
      }

      return res.json({ message: "Payment verified and order marked paid", order });
    }

    res.status(400).json({ message: `Payment not successful: ${tx.status}`, txStatus: tx.status });
  } catch (error) {
    res.status(500).json({ message: error.response?.data?.message || error.message });
  }
};

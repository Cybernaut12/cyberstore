const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  payOrder,
  getAllOrders,
  deliverOrder,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const { createOrderValidator } = require("../validators/orderValidators");
const { validate } = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/", protect, isAdmin, getAllOrders);
router.post("/", protect, createOrderValidator, validate, createOrder);
router.get("/myorders", protect, getMyOrders);
router.put("/:id/pay", protect, payOrder);
router.put("/:id/deliver", protect, isAdmin, deliverOrder);
router.get("/:id", protect, getOrderById);

module.exports = router;

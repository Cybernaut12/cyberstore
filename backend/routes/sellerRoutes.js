const express = require("express");
const { getSellerOrders, getSellerSummary } = require("../controllers/sellerController");
const { protect } = require("../middleware/authMiddleware");
const { isSeller } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/orders", protect, isSeller, getSellerOrders);
router.get("/summary", protect, isSeller, getSellerSummary);

module.exports = router;

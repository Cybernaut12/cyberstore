const { body } = require("express-validator");

exports.createOrderValidator = [
  body("orderItems").isArray({ min: 1 }).withMessage("Order items are required"),
  body("orderItems.*.product").notEmpty().withMessage("Product is required"),
  body("orderItems.*.qty").isInt({ min: 1 }).withMessage("Qty must be at least 1"),
  body("orderItems.*.price").isFloat({ min: 0 }).withMessage("Price must be valid"),

  body("shippingAddress.address").notEmpty().withMessage("Address is required"),
  body("shippingAddress.city").notEmpty().withMessage("City is required"),
  body("shippingAddress.postalCode").notEmpty().withMessage("Postal code is required"),
  body("shippingAddress.country").notEmpty().withMessage("Country is required"),

  body("totalPrice").isFloat({ min: 0 }).withMessage("Total price must be valid"),
];

const express = require("express");
const {
  createProduct,
  createProductAsAdmin,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
  createProductReview,
  updateProductReview,
  deleteProductReview,
  getTopProducts,
  getProductCategories,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  getAllProductsAdmin,
  deleteProductAsAdmin,
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");
const { isSeller, isAdmin } = require("../middleware/roleMiddleware");
const { createProductValidator } = require("../validators/productValidators");
const { validate } = require("../middleware/validateMiddleware");

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/categories", getProductCategories);
router.get("/mine", protect, isSeller, getMyProducts);
router.get("/top", getTopProducts);
router.get("/admin/pending", protect, isAdmin, getPendingProducts);
router.get("/admin/all", protect, isAdmin, getAllProductsAdmin);
router.post("/admin", protect, isAdmin, createProductValidator, validate, createProductAsAdmin);
router.put("/admin/:id/approve", protect, isAdmin, approveProduct);
router.put("/admin/:id/reject", protect, isAdmin, rejectProduct);
router.delete("/admin/:id", protect, isAdmin, deleteProductAsAdmin);
router.post("/:id/reviews", protect, createProductReview);
router.put("/:id/reviews", protect, updateProductReview);
router.delete("/:id/reviews", protect, deleteProductReview);
router.get("/:id", getProductById);

// Private seller routes
router.post("/", protect, isSeller, createProductValidator, validate, createProduct);
router.put("/:id", protect, isSeller, updateProduct);
router.delete("/:id", protect, isSeller, deleteProduct);

module.exports = router;

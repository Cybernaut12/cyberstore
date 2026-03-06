const Product = require("../models/Product");
const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// @desc   Create product (Seller only)
// @route  POST /api/products
// @access Private (Seller)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, size, color, stock, image } =
      req.body;

    const product = await Product.create({
      seller: req.user._id,
      name,
      description,
      price,
      category,
      brand,
      size,
      color,
      stock,
      image,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Create product (Admin)
// @route  POST /api/products/admin
// @access Private (Admin)
exports.createProductAsAdmin = async (req, res) => {
  try {
    const { name, description, price, category, brand, size, color, stock, image } =
      req.body;

    const product = await Product.create({
      seller: req.user._id,
      name,
      description,
      price,
      category,
      brand,
      size,
      color,
      stock,
      image,
      status: "approved",
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get all products (with search, filter, pagination)
// @route  GET /api/products
// @access Public
exports.getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    // Public should only see approved products
    query.status = "approved";

    // Search by keyword
    if (req.query.keyword) {
      const keyword = String(req.query.keyword).trim();
      const normalized = keyword.toLowerCase();

      if (normalized === "men") {
        const menPattern = "\\bmens?\\b";
        query.$or = [
          { category: { $regex: menPattern, $options: "i" } },
          { name: { $regex: menPattern, $options: "i" } },
          { description: { $regex: menPattern, $options: "i" } },
        ];
      } else if (normalized === "women" || normalized === "woman") {
        const womenPattern = "\\bwomens?\\b|\\bwomen\\b";
        query.$or = [
          { category: { $regex: womenPattern, $options: "i" } },
          { name: { $regex: womenPattern, $options: "i" } },
          { description: { $regex: womenPattern, $options: "i" } },
        ];
      } else {
        const safeKeyword = escapeRegex(keyword);
        query.$or = [
          { name: { $regex: safeKeyword, $options: "i" } },
          { category: { $regex: safeKeyword, $options: "i" } },
          { brand: { $regex: safeKeyword, $options: "i" } },
        ];
      }
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by price range
    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
      query.price = {};
      if (Number.isFinite(minPrice)) query.price.$gte = minPrice;
      if (Number.isFinite(maxPrice)) query.price.$lte = maxPrice;
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      "price-low": { price: 1, createdAt: -1 },
      "price-high": { price: -1, createdAt: -1 },
      rating: { rating: -1, numReviews: -1 },
    };
    const sortOption = String(req.query.sort || "newest");
    const sort = sortMap[sortOption] || sortMap.newest;

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("seller", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json({
      page,
      pages: Math.ceil(total / limit),
      total,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get approved product categories
// @route  GET /api/products/categories
// @access Public
exports.getProductCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", { status: "approved" });
    const cleaned = categories
      .filter(Boolean)
      .map((c) => String(c).trim())
      .filter((c) => c.length > 0)
      .sort((a, b) => a.localeCompare(b));

    res.json(cleaned);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get single product
// @route  GET /api/products/:id
// @access Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name email"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update product (Seller only)
// @route  PUT /api/products/:id
// @access Private (Seller)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Only owner seller can update
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;
    product.brand = req.body.brand || product.brand;
    product.size = req.body.size || product.size;
    product.color = req.body.color || product.color;
    product.stock = req.body.stock || product.stock;
    product.image = req.body.image || product.image;

    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete product (Seller only)
// @route  DELETE /api/products/:id
// @access Private (Seller)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Only owner seller can delete
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await product.deleteOne();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get logged-in seller products
// @route  GET /api/products/mine
// @access Private (Seller)
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Create product review
// @route  POST /api/products/:id/reviews
// @access Private
exports.createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Prevent seller from reviewing their own product
    if (product.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot review your own product" });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({ message: "Review added successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update product review (same user)
// @route  PUT /api/products/:id/reviews
// @access Private
exports.updateProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // find the review by this user
    const review = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found for this user" });
    }

    // update fields
    if (rating !== undefined) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment;

    // recalc numReviews + average rating
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.json({ message: "Review updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete product review (same user)
// @route  DELETE /api/products/:id/reviews
// @access Private
exports.deleteProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // check if user has a review
    const hasReview = product.reviews.some(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (!hasReview) {
      return res.status(404).json({ message: "Review not found for this user" });
    }

    // remove the user's review
    product.reviews = product.reviews.filter(
      (r) => r.user.toString() !== req.user._id.toString()
    );

    // recalc numReviews and rating
    product.numReviews = product.reviews.length;

    if (product.reviews.length === 0) {
      product.rating = 0;
    } else {
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;
    }

    await product.save();

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get top rated products
// @route  GET /api/products/top
// @access Public
exports.getTopProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "approved" })
      .sort({ rating: -1 })
      .limit(6);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Admin: Get all pending products
// @route  GET /api/products/admin/pending
// @access Private (Admin)
exports.getPendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "pending" })
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Admin: Approve product
// @route  PUT /api/products/admin/:id/approve
// @access Private (Admin)
exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    product.status = "approved";
    product.rejectionReason = "";

    const updated = await product.save();

    res.json({ message: "Product approved", product: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Admin: Reject product
// @route  PUT /api/products/admin/:id/reject
// @access Private (Admin)
exports.rejectProduct = async (req, res) => {
  try {
    const { reason } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    product.status = "rejected";
    product.rejectionReason = reason || "Rejected by admin";

    const updated = await product.save();

    res.json({ message: "Product rejected", product: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Admin: Get all products
// @route  GET /api/products/admin/all
// @access Private (Admin)
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Admin: Delete any product
// @route  DELETE /api/products/admin/:id
// @access Private (Admin)
exports.deleteProductAsAdmin = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

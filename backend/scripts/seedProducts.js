const dotenv = require("dotenv");
const mongoose = require("mongoose");
const axios = require("axios");
const connectDB = require("../config/db");
const User = require("../models/User");
const Product = require("../models/Product");

dotenv.config();

const FASHION_SEED_SELLER_EMAIL = "catalog.seed@cyberstore.dev";
const FASHION_CATEGORIES = [
  "mens-shirts",
  "mens-shoes",
  "mens-watches",
  "womens-bags",
  "womens-dresses",
  "womens-jewellery",
  "womens-shoes",
  "womens-watches",
  "sunglasses",
  "tops",
];
const COLORS = ["Black", "White", "Brown", "Blue", "Grey", "Cream", "Green", "Wine"];
const STYLE_LABELS = ["Classic", "Oversized", "Slim Fit", "Regular Fit", "Street", "Premium"];
const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const ACCESSORY_SIZES = ["One Size", "Standard", "Adjustable"];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const labelFromSlug = (slug) =>
  slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const sizeForCategory = (category) =>
  category.includes("watches") || category.includes("bags") || category.includes("jewellery") || category === "sunglasses"
    ? pick(ACCESSORY_SIZES)
    : pick(APPAREL_SIZES);

const toNaira = (usdPrice) => {
  const base = Number(usdPrice || 0);
  return Math.max(4500, Math.round(base * 1450));
};

const normalizeFromApi = (item, categorySlug) => {
  const mainImage = item.thumbnail || item.images?.[0] || "";
  return {
    sourceId: item.id,
    sourceName: item.title,
    description: item.description,
    brand: item.brand || "CyberWear",
    category: labelFromSlug(categorySlug),
    image: mainImage,
    price: toNaira(item.price),
    rating: Number(item.rating || 0),
    stock: Math.max(3, Number(item.stock || randInt(6, 45))),
  };
};

const ensureSeller = async () => {
  let seller = await User.findOne({ email: FASHION_SEED_SELLER_EMAIL });
  if (seller) return seller;

  seller = await User.create({
    name: "Catalog Seller",
    email: FASHION_SEED_SELLER_EMAIL,
    password: "password123",
    role: "seller",
  });

  return seller;
};

const fetchFashionSource = async () => {
  const all = [];

  for (const category of FASHION_CATEGORIES) {
    const url = `https://dummyjson.com/products/category/${encodeURIComponent(category)}?limit=100`;
    const { data } = await axios.get(url, { timeout: 20000 });
    const products = Array.isArray(data?.products) ? data.products : [];

    for (const item of products) {
      const normalized = normalizeFromApi(item, category);
      if (normalized.image) all.push(normalized);
    }
  }

  return all;
};

const buildFashionCatalog = (sourceProducts, sellerId, count) => {
  const docs = [];
  const uniqueBase = shuffle(
    sourceProducts.filter(
      (item, index, arr) => arr.findIndex((x) => x.sourceId === item.sourceId) === index
    )
  );

  // Scale variants to requested count while preserving variation labels.
  const maxVariantRounds = Math.max(1, Math.ceil(count / Math.max(uniqueBase.length, 1)));
  for (let round = 1; round <= maxVariantRounds && docs.length < count; round += 1) {
    for (let i = 0; i < uniqueBase.length && docs.length < count; i += 1) {
      const base = uniqueBase[i];
      const color = COLORS[(i + round) % COLORS.length];
      const style = STYLE_LABELS[(i + round) % STYLE_LABELS.length];
      const variantName = round === 1
        ? `${base.sourceName} - ${color}`
        : `${base.sourceName} ${style} - ${color} (${round})`;

      const priceShift = 1 + (((i + round) % 6) - 2) * 0.04;
      const price = Math.max(4500, Math.round(base.price * priceShift));

      docs.push({
        seller: sellerId,
        name: variantName,
        description: `${base.description}. Fit: ${style}. Material: premium quality. Color: ${color}.`,
        price,
        category: base.category,
        brand: base.brand,
        size: sizeForCategory(base.category.toLowerCase()),
        color,
        stock: Math.max(2, base.stock + randInt(-4, 16)),
        image: base.image,
        status: "approved",
        rating: Number((base.rating || (Math.random() * 1.5 + 3.2)).toFixed(1)),
        numReviews: randInt(5, 180),
      });
    }
  }

  return docs;
};

const run = async () => {
  const countArg = Number(process.argv[2]);
  const count = Number.isFinite(countArg) && countArg > 0 ? Math.min(countArg, 5000) : 220;

  await connectDB();

  try {
    const seller = await ensureSeller();

    const removedOldSeed = await Product.deleteMany({
      $or: [
        { image: { $regex: "picsum\\.photos/seed/cyberstore-", $options: "i" } },
        {
          description: {
            $regex: "Comfortable, stylish, and ready for daily wear",
            $options: "i",
          },
        },
      ],
    });

    const removedPreviousFashionSeed = await Product.deleteMany({ seller: seller._id });

    const sourceProducts = await fetchFashionSource();
    if (!sourceProducts.length) {
      throw new Error("No fashion products fetched from source API");
    }

    const docs = buildFashionCatalog(sourceProducts, seller._id, count);
    const inserted = await Product.insertMany(docs, { ordered: false });

    console.log(`Removed old random seed products: ${removedOldSeed.deletedCount}`);
    console.log(`Removed previous fashion seed products: ${removedPreviousFashionSeed.deletedCount}`);
    console.log(`Fashion products seeded: ${inserted.length}`);
    console.log(`Seller used: ${seller.email} (${seller.role})`);
  } catch (error) {
    console.error("Failed to seed products:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();

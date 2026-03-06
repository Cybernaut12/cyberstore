const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
// Connect to database
connectDB();

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedExact = new Set([
        "http://localhost:5173",
        "http://localhost:3000",
        process.env.FRONTEND_URL,
      ].filter(Boolean));

      if (allowedExact.has(origin)) return callback(null, true);
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);

      return callback(new Error("CORS blocked for this origin"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const testRoutes = require("./routes/testRoutes");
app.use("/api/test", testRoutes);
app.use("/api/auth", require("./routes/authRoutes"));

const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

app.use("/api/auth", require("./routes/authRoutes"));

app.get("/", (req, res) => {
  res.send("CyberStore API is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
console.log("MONGO URI:", process.env.MONGO_URI);

const orderRoutes = require("./routes/orderRoutes");

app.use("/api/orders", orderRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

const sellerRoutes = require("./routes/sellerRoutes");
app.use("/api/seller", sellerRoutes);

const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/upload", uploadRoutes);

const paystackRoutes = require("./routes/paystackRoutes");
app.use("/api/paystack", paystackRoutes);

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

app.use(notFound);
app.use(errorHandler);


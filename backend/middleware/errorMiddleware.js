// middleware/errorMiddleware.js

// 404 handler
exports.notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// central error handler
exports.errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || "Server Error",
    // hide stack in production
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

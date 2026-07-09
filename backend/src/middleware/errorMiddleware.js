const logger = require("../utils/logger");

const errorMiddleware = (
  err,
  req,
  res,
  next
) => {
  logger.error(err.message || "Internal Server Error", {
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(
    err.statusCode || 500
  ).json({
    success: false,
    message:
      err.message ||
      "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports =
  errorMiddleware;
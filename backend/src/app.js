const express =
  require("express");

const cors =
  require("cors");

const helmet =
  require("helmet");

const morgan =
  require("morgan");

const cookieParser =
  require("cookie-parser");

const authRoutes =
  require("./modules/auth/auth.routes");

const app = express();

app.use(helmet());

app.use(cors());

app.use(morgan("dev"));

app.use(express.json());

app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    name: "CodeMatch API",
  });
});

app.get(
  "/health",
  (req, res) => {
    res.status(200).json({
      success: true,
      status: "healthy",
    });
  }
);

app.use(
  "/api/auth",
  authRoutes
);

module.exports = app;
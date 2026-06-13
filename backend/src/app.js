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

const userRoutes =
  require(
    "./modules/users/users.routes"
  );

const skillRoutes =
  require(
    "./modules/skills/skills.routes"
  );

const interestRoutes =
  require(
    "./modules/interests/interests.routes"
  );

const matchRoutes =
  require(
    "./modules/matches/matches.routes"
  );

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

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/skills",
  skillRoutes
);

app.use(
  "/api/interests",
  interestRoutes
);

app.use(
  "/api/matches",
  matchRoutes
);

module.exports = app;
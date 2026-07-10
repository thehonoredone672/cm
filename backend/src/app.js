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

const teamRequestRoutes =
  require(
    "./modules/teamRequests/teamRequests.routes"
  );

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

const applicationRoutes =
  require(
    "./modules/applications/applications.routes"
  );

const errorMiddleware =
  require(
    "./middleware/errorMiddleware"
  );

const chatRoutes =
  require(
    "./modules/chat/chat.routes"
  );


const teamInviteRoutes = require(
  "./modules/teamInvites/teamInvites.routes"
);

const teamRoutes = require("./modules/teams/teams.routes");
const problemRoutes = require("./modules/problems/problems.routes");
const submissionRoutes = require("./modules/submissions/submissions.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const notificationRoutes = require("./modules/notifications/notifications.routes");
const projectRoutes = require("./modules/projects/projects.routes");
const recommendationRoutes = require("./modules/recommendations/recommendations.routes");
const adminRoutes = require("./modules/admin/admin.routes");

const rateLimit = require("express-rate-limit");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" })); // supporting attachment uploads
app.use(cookieParser());

// Rate Limiting (Sprint 5.1)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

app.use("/api/", apiLimiter);
app.use("/api/auth", authLimiter);

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

app.use(
  "/api/team-requests",
  teamRequestRoutes
);

app.use(
  "/api/applications",
  applicationRoutes
);

app.use(
  "/api/chat",
  chatRoutes
);

app.use(
  "/api/team-invites",
  teamInviteRoutes
);

app.use(
  "/api/teams",
  teamRoutes
);

app.use(
  "/api/problems",
  problemRoutes
);

app.use(
  "/api/submissions",
  submissionRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

const reportRoutes = require("./modules/reports/reports.routes");
const hackathonRoutes = require("./modules/hackathons/hackathons.routes");
const communityRoutes = require("./modules/community/community.routes");
const resourceRoutes = require("./modules/resources/resources.routes");
const careerRoutes = require("./modules/careers/careers.routes");
const aiRoutes = require("./modules/ai/ai.routes");
const challengeRoutes = require("./modules/challenges/challenges.routes");

app.use(
  "/api/projects",
  projectRoutes
);

app.use(
  "/api/recommendations",
  recommendationRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);

app.use(
  "/api/hackathons",
  hackathonRoutes
);

app.use(
  "/api/posts",
  communityRoutes
);

app.use(
  "/api/resources",
  resourceRoutes
);

app.use(
  "/api/careers",
  careerRoutes
);

app.use(
  "/api/ai",
  aiRoutes
);

app.use(
  "/api/challenges",
  challengeRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

// Fallback 404 JSON response handler (Sprint 5.2)
app.use((req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

app.use(errorMiddleware);

module.exports = app;
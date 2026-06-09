import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";

const app = express();

app.use(helmet());

app.use(cors());

app.use(morgan("dev"));

app.use(express.json());

app.use(cookieParser());

app.get("/", (_, res) => {
  res.status(200).json({
    success: true,
    name: "CodeMatch API",
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);

app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
  });
});

export default app;
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./src/modules/user/auth.routes.js";
import jobRoutes from "./src/modules/jobPost/jobPost.routes.js";
import applicationRoutes from "./src/modules/jobApplication/jobApplication.routes.js";

import dotenv from "dotenv";

dotenv.config();

// ✅ check env loaded
console.log("ENV CHECK 👉", process.env.FRONTEND_URL);

const app = express();

const frontendURL =
  process.env.FRONTEND_URL || process.env.FRONTREND_URL || "http://localhost:5174";

const corsOptions = {
  origin: frontendURL,
  credentials: true,
  // allow Authorization header from browser preflight
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization"],
};

app.use(cors(corsOptions));

// Allow preflight requests for cross-site cookies
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/job-post", jobRoutes);
// Job application endpoints (match frontend baseURL)
app.use("/api/v1/job-applications", applicationRoutes);
// Provide backward-compatible path used by frontend: /api/v1/jobs
app.use("/api/v1/jobs", jobRoutes);


export default app;
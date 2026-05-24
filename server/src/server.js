import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";

const app = express();
const port = Number(process.env.PORT || 5000);
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://127.0.0.1:5173"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition", "Content-Type"]
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "MergeMate API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/pdf", pdfRoutes);

app.use((err, _req, res, _next) => {
  console.error("Global Error Handler caught an error:", err);
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ message: "File too large. Max file size is 20MB." });
  }
  return res.status(500).json({ message: err?.message || "Internal server error." });
});

process.on("uncaughtException", (error) => {
  console.error("CRITICAL: Uncaught Exception caught globally:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("CRITICAL: Unhandled Rejection at:", promise, "reason:", reason);
});

connectDB()
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
    // Set global timeout to 5 minutes
    server.timeout = 300000;
  })
  .catch((error) => {
    console.error("Mongo connection failed:", error.message);
    process.exit(1);
  });


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";

dotenv.config();

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
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ message: "File too large. Max file size is 20MB." });
  }
  return res.status(500).json({ message: "Internal server error." });
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Mongo connection failed:", error.message);
    process.exit(1);
  });

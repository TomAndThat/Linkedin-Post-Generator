// server.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import generatePost from "./src/routes/generate.js";
import startCleanupJob from "./src/utils/cleanup.js";

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "uploads");

// Ensure uploads folder exists
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Middlewares
app.use(helmet());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many uploads from this IP, please try again later.",
});
app.use("/generate", limiter);

// Multer Setup
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(
        new Error("Only JPG, PNG, WEBP, HEIC, and HEIF files are allowed.")
      );
    }
    cb(null, true);
  },
});

// Routes
app.post("/generate", upload.single("image"), generatePost);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Start scheduled cleanup job
startCleanupJob();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_SIZE_MB || "500");
const PUBLIC_MEDIA_URL = (process.env.PUBLIC_MEDIA_URL || `http://vps.amcmep.in:${PORT}`).replace(/\/$/, "");
const UPLOAD_SECRET = process.env.UPLOAD_SECRET || "";

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Enable CORS for frontend web app
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow browsers, mobile apps, curl, and specific domains
      if (!origin || origin.includes("theworkofhuman.com") || origin.includes("localhost") || origin.includes("amcmep.in")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "HEAD", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Range", "Authorization", "x-upload-secret"],
    exposedHeaders: ["Content-Range", "Accept-Ranges", "Content-Length", "Content-Type"],
  })
);

// Configure Multer Disk Storage (Streams directly to VPS SSD disk)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".bin";
    const randomHex = crypto.randomBytes(12).toString("hex");
    cb(null, `${Date.now()}-${randomHex}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_UPLOAD_MB * 1024 * 1024,
  },
});

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase().replace(/^\./, "");
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "avif":
      return "image/avif";
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "mov":
      return "video/quicktime";
    case "m4v":
      return "video/mp4";
    case "mkv":
      return "video/x-matroska";
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "ogg":
      return "audio/ogg";
    case "m4a":
      return "audio/mp4";
    case "flac":
      return "audio/flac";
    case "aac":
      return "audio/aac";
    case "pdf":
      return "application/pdf";
    case "glb":
      return "model/gltf-binary";
    case "gltf":
      return "model/gltf+json";
    default:
      return "application/octet-stream";
  }
}

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "online",
    service: "workofhuman-vps-media-service",
    uploadDirectory: UPLOAD_DIR,
    maxUploadMB: MAX_UPLOAD_MB,
    publicBaseUrl: PUBLIC_MEDIA_URL,
    uptime: process.uptime(),
  });
});

// Upload endpoint
app.post("/upload", (req, res) => {
  // Optional security token check if configured
  if (UPLOAD_SECRET) {
    const token = req.headers["x-upload-secret"] || req.query.secret;
    if (token !== UPLOAD_SECRET) {
      return res.status(403).json({ error: "Unauthorized upload request." });
    }
  }

  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("[Upload Error]:", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: `File exceeds maximum server limit of ${MAX_UPLOAD_MB}MB.`,
        });
      }
      return res.status(500).json({ error: err.message || "Failed to process upload on VPS." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No media file provided in request." });
    }

    const filename = req.file.filename;
    const mediaUrl = `${PUBLIC_MEDIA_URL}/media/${filename}`;

    console.log(`[Upload Success]: ${filename} (${(req.file.size / (1024 * 1024)).toFixed(2)} MB)`);

    return res.json({
      success: true,
      url: mediaUrl,
      filename,
      size: req.file.size,
      mimeType: req.file.mimetype || getMimeType(filename),
      storageType: "vps_ssd_disk",
    });
  });
});

// Stream Media (GET) with HTTP 206 Range seeking support
app.get("/media/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(UPLOAD_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Media asset not found on VPS disk.");
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const contentType = getMimeType(filename);
  const range = req.headers.range;

  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

  if (range && range.startsWith("bytes=")) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (isNaN(start) || start >= fileSize || (parts[1] && isNaN(end)) || end >= fileSize || start > end) {
      res.setHeader("Content-Range", `bytes */${fileSize}`);
      return res.status(416).end();
    }

    const chunkLength = end - start + 1;
    res.status(206);
    res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
    res.setHeader("Content-Length", chunkLength);
    res.setHeader("Content-Type", contentType);

    const stream = fs.createReadStream(filePath, { start, end });
    return stream.pipe(res);
  }

  res.setHeader("Content-Length", fileSize);
  res.setHeader("Content-Type", contentType);

  const stream = fs.createReadStream(filePath);
  return stream.pipe(res);
});

// HEAD metadata check
app.head("/media/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(UPLOAD_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).end();
  }

  const stat = fs.statSync(filePath);
  const contentType = getMimeType(filename);

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", stat.size);
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  return res.status(200).end();
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`====================================================`);
  console.log(`🚀 WorkOfHuman VPS Media Service listening on port ${PORT}`);
  console.log(`📁 Upload Directory: ${UPLOAD_DIR}`);
  console.log(`🌐 Public Base URL: ${PUBLIC_MEDIA_URL}`);
  console.log(`⚡ Max Upload Limit: ${MAX_UPLOAD_MB} MB`);
  console.log(`====================================================`);
});

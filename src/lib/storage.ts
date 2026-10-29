import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { query } from "./db/index";

/**
 * The Work of Human - Media Storage System
 *
 * Supports three self-hosted storage tiers:
 *
 * TIER 1: Dedicated PostgreSQL Binary Storage on VPS (Universal - works in Cloudflare Workers, VPS, Docker, Dev)
 *   - Directly persists binary buffers into `workofhuman.media_files` on VPS PostgreSQL.
 *   - Completely immune to serverless read-only filesystems ([unenv] fs.mkdirSync errors).
 *   - Serves high-speed media via `/api/media/[filename]` with full HTTP 206 partial range streaming.
 *
 * TIER 2: Self-Hosted MinIO / S3 Object Storage (Optional)
 *   - If MINIO_ENDPOINT / S3_ENDPOINT is configured in environment variables.
 *
 * TIER 3: Local Windows Server PC Disk Mirror (Node.js runtimes)
 *   - When running on a native Node.js / Windows PC host where filesystem is writable.
 */

// --- Direct Local Disk Settings ---
export function getUploadDirectory(): string {
  try {
    if (process.env.UPLOAD_DIR && process.env.UPLOAD_DIR.trim()) {
      return path.resolve(process.env.UPLOAD_DIR.trim());
    }
    return path.join(process.cwd(), "public", "uploads");
  } catch {
    return "/tmp/uploads";
  }
}

export function getMediaBaseUrl(): string {
  if (process.env.MEDIA_BASE_URL && process.env.MEDIA_BASE_URL.trim()) {
    return process.env.MEDIA_BASE_URL.trim().replace(/\/$/, "");
  }
  return "/api/media";
}

// --- Self-Hosted MinIO / S3 Settings ---
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || process.env.S3_ENDPOINT || "";
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || process.env.S3_ACCESS_KEY || "";
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || process.env.S3_SECRET_KEY || "";
const MINIO_BUCKET = process.env.MINIO_BUCKET || process.env.S3_BUCKET_NAME || "workofhuman";
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || "";

export const isMinIOConfigured = Boolean(
  MINIO_ENDPOINT && MINIO_ACCESS_KEY && MINIO_SECRET_KEY
);

let minioClient: S3Client | null = null;
if (isMinIOConfigured) {
  minioClient = new S3Client({
    endpoint: MINIO_ENDPOINT,
    region: "us-east-1",
    credentials: {
      accessKeyId: MINIO_ACCESS_KEY,
      secretAccessKey: MINIO_SECRET_KEY,
    },
    forcePathStyle: true,
  });
}

export interface UploadResult {
  url: string;
  storageType: "vps_database" | "minio_self_hosted" | "windows_server_disk" | "local_filesystem";
  filename: string;
  contentType: string;
  size: number;
  localPath?: string;
}

/**
 * Uploads media file buffer:
 * 1. Checks MinIO/S3 if configured.
 * 2. Persists to PostgreSQL `workofhuman.media_files` table (reliable across Cloudflare Workers & VPS).
 * 3. Tries mirror to local disk if running on writable Node.js/Windows Server environment.
 */
export async function uploadMedia(
  buffer: Buffer,
  originalFilename: string,
  contentType: string
): Promise<UploadResult> {
  const ext = path.extname(originalFilename).toLowerCase() || getExtensionFromMime(contentType);
  const randomSuffix = crypto.randomBytes(12).toString("hex");
  const filename = `${Date.now()}-${randomSuffix}${ext}`;

  // OPTION A: Self-Hosted MinIO on VPS / Windows Server
  if (isMinIOConfigured && minioClient) {
    try {
      const key = `uploads/${filename}`;
      await minioClient.send(
        new PutObjectCommand({
          Bucket: MINIO_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        })
      );

      const publicBase = MINIO_PUBLIC_URL
        ? MINIO_PUBLIC_URL.replace(/\/$/, "")
        : `${MINIO_ENDPOINT.replace(/\/$/, "")}/${MINIO_BUCKET}`;
      const url = `${publicBase}/${key}`;

      return {
        url,
        storageType: "minio_self_hosted",
        filename,
        contentType,
        size: buffer.length,
      };
    } catch (minioErr) {
      console.error("[MinIO Upload Error, falling back to PostgreSQL/Disk]:", minioErr);
    }
  }

  // OPTION B: Dedicated PostgreSQL Media Table (Primary for Cloudflare & VPS)
  let savedToDb = false;
  try {
    await query(
      `INSERT INTO workofhuman.media_files (filename, content_type, size, data)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (filename) DO UPDATE SET
         content_type = EXCLUDED.content_type,
         size = EXCLUDED.size,
         data = EXCLUDED.data`,
      [filename, contentType, buffer.length, buffer]
    );
    savedToDb = true;
  } catch (dbErr) {
    console.error("[PostgreSQL Media Storage Error]:", dbErr);
  }

  // OPTION C: Local Disk Mirror (If writable Node.js filesystem is available)
  let localPath: string | undefined = undefined;
  try {
    if (typeof fs.mkdirSync === "function" && typeof fs.writeFileSync === "function") {
      const uploadsDir = getUploadDirectory();
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);
      localPath = filePath;
    }
  } catch {
    // Expected on Cloudflare Workers / read-only serverless - safely ignored
  }

  if (!savedToDb && !localPath) {
    throw new Error("Failed to persist media file to storage engine.");
  }

  const baseUrl = getMediaBaseUrl();
  const url = `${baseUrl}/${filename}`;

  return {
    url,
    storageType: savedToDb ? "vps_database" : (process.platform === "win32" ? "windows_server_disk" : "local_filesystem"),
    filename,
    contentType,
    size: buffer.length,
    localPath,
  };
}

export function getMimeTypeFromExt(ext: string): string {
  const cleanExt = ext.toLowerCase().replace(/^\./, "");
  switch (cleanExt) {
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
    case "ico":
      return "image/x-icon";
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
    case "json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
}

export function getExtensionFromMime(mime: string): string {
  switch (mime.toLowerCase()) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/svg+xml":
      return ".svg";
    case "image/avif":
      return ".avif";
    case "video/mp4":
      return ".mp4";
    case "video/webm":
      return ".webm";
    case "video/quicktime":
      return ".mov";
    case "audio/mpeg":
      return ".mp3";
    case "audio/wav":
      return ".wav";
    case "audio/ogg":
      return ".ogg";
    case "audio/flac":
      return ".flac";
    case "audio/mp4":
      return ".m4a";
    case "application/pdf":
      return ".pdf";
    case "model/gltf-binary":
      return ".glb";
    case "model/gltf+json":
      return ".gltf";
    default:
      return ".bin";
  }
}

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * The Work of Human - Media Storage System
 *
 * Supports two self-hosted architectures:
 *
 * MODE 1: Direct Windows Server Disk (Default - Zero extra software needed)
 *   - Only Node.js required.
 *   - Saves files directly to Windows local disk (e.g. D:\workofhuman\uploads or public/uploads).
 *   - Serves files via /api/media/[filename] with HTTP 206 Range seeking support.
 *
 * MODE 2: Self-Hosted MinIO (S3-Compatible Object Storage on VPS or Windows Server)
 *   - Set MINIO_ENDPOINT (e.g. http://vps.amcmep.in:9000 or http://localhost:9000).
 *   - Self-hosted on your own hardware, NOT Cloudflare.
 */

// --- Direct Local Disk Settings ---
export function getUploadDirectory(): string {
  if (process.env.UPLOAD_DIR && process.env.UPLOAD_DIR.trim()) {
    return path.resolve(process.env.UPLOAD_DIR.trim());
  }
  return path.join(process.cwd(), "public", "uploads");
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
    forcePathStyle: true, // Essential for MinIO (http://endpoint/bucket/file)
  });
}

export interface UploadResult {
  url: string;
  storageType: "windows_server_disk" | "local_filesystem" | "minio_self_hosted";
  filename: string;
  contentType: string;
  size: number;
  localPath?: string;
}

/**
 * Uploads media file buffer:
 * - If MinIO is configured in .env, uploads to self-hosted MinIO bucket.
 * - Otherwise, writes directly to Windows Server PC local disk.
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
      console.error("[MinIO Upload Error, falling back to local disk]:", minioErr);
    }
  }

  // OPTION B: Direct Windows Server PC Local Disk Storage
  const uploadsDir = getUploadDirectory();
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, buffer);

  // Sync to public/uploads if different
  const publicUploads = path.join(process.cwd(), "public", "uploads");
  if (uploadsDir !== publicUploads) {
    try {
      if (!fs.existsSync(publicUploads)) {
        fs.mkdirSync(publicUploads, { recursive: true });
      }
      fs.writeFileSync(path.join(publicUploads, filename), buffer);
    } catch {
      // Non-fatal
    }
  }

  const baseUrl = getMediaBaseUrl();
  const url = `${baseUrl}/${filename}`;

  return {
    url,
    storageType: process.platform === "win32" ? "windows_server_disk" : "local_filesystem",
    filename,
    contentType,
    size: buffer.length,
    localPath: filePath,
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

import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getUploadDirectory, getMimeTypeFromExt } from "@/lib/storage";

// In Node.js / Windows Server runtime
export const dynamic = "force-dynamic";

function resolveFile(filename: string): { filePath: string; exists: boolean } {
  // Prevent directory traversal attacks
  const safeFilename = path.basename(filename);
  const uploadDir = getUploadDirectory();
  const filePath = path.join(uploadDir, safeFilename);

  if (fs.existsSync(filePath)) {
    return { filePath, exists: true };
  }

  // Fallback to public/uploads if different
  const publicDir = path.join(process.cwd(), "public", "uploads");
  const fallbackPath = path.join(publicDir, safeFilename);
  if (fs.existsSync(fallbackPath)) {
    return { filePath: fallbackPath, exists: true };
  }

  return { filePath, exists: false };
}

export async function HEAD(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const { filePath, exists } = resolveFile(filename);

  if (!exists) {
    return new NextResponse(null, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const ext = path.extname(filename);
  const contentType = getMimeTypeFromExt(ext);

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": stat.size.toString(),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const { filePath, exists } = resolveFile(filename);

  if (!exists) {
    return new NextResponse("File not found on server storage.", { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const ext = path.extname(filename);
  const contentType = getMimeTypeFromExt(ext);

  const range = request.headers.get("range");

  // Handle HTTP Range request (HTTP 206 Partial Content for smooth video/audio seeking)
  if (range && range.startsWith("bytes=")) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (isNaN(start) || start >= fileSize || (parts[1] && isNaN(end)) || end >= fileSize || start > end) {
      return new NextResponse(null, {
        status: 416,
        headers: {
          "Content-Range": `bytes */${fileSize}`,
        },
      });
    }

    const chunkLength = end - start + 1;
    const stream = fs.createReadStream(filePath, { start, end });

    const readable = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
      cancel() {
        stream.destroy();
      },
    });

    return new NextResponse(readable, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkLength.toString(),
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Full file streaming (HTTP 200)
  const fullStream = fs.createReadStream(filePath);
  const readable = new ReadableStream({
    start(controller) {
      fullStream.on("data", (chunk) => controller.enqueue(chunk));
      fullStream.on("end", () => controller.close());
      fullStream.on("error", (err) => controller.error(err));
    },
    cancel() {
      fullStream.destroy();
    },
  });

  return new NextResponse(readable, {
    status: 200,
    headers: {
      "Content-Length": fileSize.toString(),
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

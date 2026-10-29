import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getUploadDirectory, getMimeTypeFromExt } from "@/lib/storage";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

function resolveLocalFile(filename: string): { filePath: string; exists: boolean } {
  try {
    const safeFilename = path.basename(filename);
    const uploadDir = getUploadDirectory();
    const filePath = path.join(uploadDir, safeFilename);

    if (typeof fs.existsSync === "function" && fs.existsSync(filePath)) {
      return { filePath, exists: true };
    }

    const publicDir = path.join(process.cwd(), "public", "uploads");
    const fallbackPath = path.join(publicDir, safeFilename);
    if (typeof fs.existsSync === "function" && fs.existsSync(fallbackPath)) {
      return { filePath: fallbackPath, exists: true };
    }
  } catch {
    // Filesystem not available in serverless/Cloudflare Workers runtime
  }

  return { filePath: "", exists: false };
}

export async function HEAD(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const safeFilename = path.basename(filename);

  // 1. Primary: Windows Server Media Service
  try {
    const vpsUrl = `http://vps.amcmep.in:8080/media/${safeFilename}`;
    const vpsRes = await fetch(vpsUrl, { method: "HEAD" });
    if (vpsRes.ok) {
      const responseHeaders = new Headers();
      responseHeaders.set("Content-Type", vpsRes.headers.get("content-type") || getMimeTypeFromExt(path.extname(filename)));
      responseHeaders.set("Accept-Ranges", "bytes");
      responseHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
      if (vpsRes.headers.get("content-length")) {
        responseHeaders.set("Content-Length", vpsRes.headers.get("content-length")!);
      }
      return new NextResponse(null, { status: 200, headers: responseHeaders });
    }
  } catch {
    // Fall through
  }

  // 2. Try local filesystem if available
  const { filePath, exists } = resolveLocalFile(filename);
  if (exists) {
    try {
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
    } catch {
      // Fall through to database check
    }
  }

  // 2. Query PostgreSQL media table
  try {
    const dbRes = await query<{ content_type: string; size: string }>(
      "SELECT content_type, size FROM workofhuman.media_files WHERE filename = $1",
      [safeFilename]
    );

    if (dbRes.rows.length > 0) {
      const row = dbRes.rows[0];
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Content-Type": row.content_type || getMimeTypeFromExt(path.extname(filename)),
          "Content-Length": row.size.toString(),
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  } catch (err) {
    console.error("[Media HEAD Error]:", err);
  }

  return new NextResponse(null, { status: 404 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const safeFilename = path.basename(filename);

  // 1. Primary: Stream from Windows Server VPS Media Service
  try {
    const vpsUrl = `http://vps.amcmep.in:8080/media/${safeFilename}`;
    const headers: Record<string, string> = {};
    const range = request.headers.get("range");
    if (range) headers["Range"] = range;

    const vpsRes = await fetch(vpsUrl, {
      method: "GET",
      headers,
    });

    if (vpsRes.ok || vpsRes.status === 206) {
      const responseHeaders = new Headers();
      responseHeaders.set("Content-Type", vpsRes.headers.get("content-type") || getMimeTypeFromExt(path.extname(filename)));
      responseHeaders.set("Accept-Ranges", "bytes");
      responseHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
      if (vpsRes.headers.get("content-length")) {
        responseHeaders.set("Content-Length", vpsRes.headers.get("content-length")!);
      }
      if (vpsRes.headers.get("content-range")) {
        responseHeaders.set("Content-Range", vpsRes.headers.get("content-range")!);
      }

      return new NextResponse(vpsRes.body, {
        status: vpsRes.status,
        headers: responseHeaders,
      });
    }
  } catch {
    // Fall through
  }

  // 2. Try local filesystem if available
  const { filePath, exists } = resolveLocalFile(filename);
  if (exists) {
    try {
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const ext = path.extname(filename);
      const contentType = getMimeTypeFromExt(ext);
      const range = request.headers.get("range");

      if (range && range.startsWith("bytes=")) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (!isNaN(start) && start < fileSize && (!parts[1] || (!isNaN(end) && end < fileSize && start <= end))) {
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
      }

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
    } catch {
      // Fall through to database check
    }
  }

  // 2. Query PostgreSQL media table (Universal for Cloudflare Workers & VPS)
  try {
    const dbRes = await query<{ content_type: string; size: string; hex_data: string }>(
      "SELECT content_type, size, encode(data, 'hex') as hex_data FROM workofhuman.media_files WHERE filename = $1",
      [safeFilename]
    );

    if (dbRes.rows.length === 0) {
      return new NextResponse("File not found on server storage.", { status: 404 });
    }

    const fileRow = dbRes.rows[0];
    const fileBuffer = Buffer.from(fileRow.hex_data, "hex");
    const fileSize = fileBuffer.length;
    const contentType = fileRow.content_type || getMimeTypeFromExt(path.extname(filename));

    const range = request.headers.get("range");

    // Handle HTTP Range request (HTTP 206 Partial Content for video/audio seeking)
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

      const chunk = fileBuffer.subarray(start, end + 1);
      return new NextResponse(new Uint8Array(chunk), {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunk.length.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Full 200 response
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Length": fileSize.toString(),
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[Media GET Error]:", err);
    return new NextResponse("Failed to retrieve media file.", { status: 500 });
  }
}

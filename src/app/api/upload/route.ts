import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadMedia, isMinIOConfigured, getUploadDirectory, getMediaBaseUrl } from "@/lib/storage";

// Configurable Max upload size (defaults to 250MB for video/audio)
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_SIZE_MB || "250");
const MAX_FILE_SIZE = MAX_UPLOAD_MB * 1024 * 1024;

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const isWindows = process.platform === "win32";

  return NextResponse.json({
    status: "ready",
    authenticated: Boolean(user),
    user: user ? { userId: user.userId, username: user.username, role: user.role } : null,
    storageEngine: isMinIOConfigured
      ? "minio_self_hosted"
      : isWindows
      ? "windows_server_disk"
      : "vps_database",
    minIOConfigured: isMinIOConfigured,
    uploadDirectory: getUploadDirectory(),
    mediaBaseUrl: getMediaBaseUrl(),
    supportsVideoStreaming: true,
    supportsAudioStreaming: true,
    maxFileSizeMB: MAX_UPLOAD_MB,
    maxFileSizeBytes: MAX_FILE_SIZE,
    supportedTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/flac",
      "application/pdf",
      "model/gltf-binary",
    ],
  });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to upload media files." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No media file provided in request." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds the ${MAX_UPLOAD_MB}MB server limit. Current size: ${(
            file.size /
            (1024 * 1024)
          ).toFixed(1)}MB`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadMedia(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.filename,
      storageType: result.storageType,
      size: result.size,
      localPath: result.localPath,
    });
  } catch (err: unknown) {
    console.error("[Upload API Error]:", err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Media upload failed: ${errorMsg}` },
      { status: 500 }
    );
  }
}

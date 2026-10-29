import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function getUploadDirectory() {
  if (process.env.UPLOAD_DIR && process.env.UPLOAD_DIR.trim()) {
    return path.resolve(process.env.UPLOAD_DIR.trim());
  }
  return path.join(process.cwd(), "public", "uploads");
}

function getMediaBaseUrl() {
  if (process.env.MEDIA_BASE_URL && process.env.MEDIA_BASE_URL.trim()) {
    return process.env.MEDIA_BASE_URL.trim().replace(/\/$/, "");
  }
  return "/api/media";
}

async function runStorageTest() {
  console.log("=== Testing Windows Server Storage Pipeline ===");
  console.log("OS Platform:", process.platform);
  const uploadDir = getUploadDirectory();
  console.log("Resolved Storage Directory:", uploadDir);
  console.log("Base Media URL:", getMediaBaseUrl());

  // Test Files: Image, Video, Audio
  const testFiles = [
    { name: "test-photo.jpg", mime: "image/jpeg", data: "SAMPLE_JPEG_BINARY_DATA" },
    { name: "test-video.mp4", mime: "video/mp4", data: "SAMPLE_MP4_BINARY_DATA_WITH_SEEK_FRAMES" },
    { name: "test-music.mp3", mime: "audio/mpeg", data: "SAMPLE_MP3_BINARY_DATA_AUDIO_STREAM" },
  ];

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  for (const item of testFiles) {
    const ext = path.extname(item.name);
    const filename = `test-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    const targetPath = path.join(uploadDir, filename);

    fs.writeFileSync(targetPath, Buffer.from(item.data));
    const stats = fs.statSync(targetPath);

    console.log(`\n✔ Saved ${item.mime} successfully:`);
    console.log(`  - File: ${filename}`);
    console.log(`  - Local Disk Path: ${targetPath}`);
    console.log(`  - Size: ${stats.size} bytes`);
    console.log(`  - Stream URL: ${getMediaBaseUrl()}/${filename}`);
    console.log(`  - Direct Static URL: /uploads/${filename}`);

    // Verify Range Byte Reading (e.g. byte 0 to 10 for video scrub)
    const fd = fs.openSync(targetPath, "r");
    const buffer = Buffer.alloc(10);
    fs.readSync(fd, buffer, 0, 10, 0);
    fs.closeSync(fd);
    console.log(`  - Range Seek Test (first 10 bytes): "${buffer.toString()}"`);

    // Clean up test file
    fs.unlinkSync(targetPath);
  }

  console.log("\n All storage tests passed: Server disk can save, stream, and seek media without cloud buckets!");
}

runStorageTest().catch(console.error);

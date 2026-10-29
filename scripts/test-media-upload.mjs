import fs from "node:fs";
import path from "node:path";
import { uploadMedia } from "../src/lib/storage.ts";
import { Client } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:AnheVps2022@vps.amcmep.in:5432/workofhuman";

async function testMediaUpload() {
  console.log("=== Testing Media File Upload & Storage ===");

  try {
    // 1. Create a dummy test image buffer (PNG header)
    const testPngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );

    console.log("1. Uploading test media binary buffer...");
    const result = await uploadMedia(testPngBuffer, "test-artwork.png", "image/png");
    console.log("✓ Uploaded media successfully:", result);

    if (!result.url) throw new Error("Upload did not return a valid URL");

    // If local, check that the file physically exists on disk
    if (result.storageType === "local") {
      const expectedPath = path.join(process.cwd(), "public", "uploads", result.filename);
      if (!fs.existsSync(expectedPath)) {
        throw new Error("Local uploaded file was not found on disk: " + expectedPath);
      }
      console.log("✓ Verified file exists on disk:", expectedPath);
      // Clean up local test file
      fs.unlinkSync(expectedPath);
    }

    // 2. Test publishing a project with the uploaded media URL
    console.log("\n2. Publishing project with media URL into PostgreSQL...");
    const client = new Client({ connectionString });
    await client.connect();

    const timestamp = Date.now();
    const testSlug = `media-test-${timestamp.toString(36)}`;
    const testProjectId = `proj_media_${timestamp}`;

    await client.query(
      `INSERT INTO workofhuman.projects (
        id, title, slug, description, creator_id, creator_name,
        type, media_urls, thumbnail_url, tags, ai_generated, ai_model,
        views, likes_count, saves_count, published_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, 'Test Creator',
        'films', $6::jsonb, $7, '["cinema", "35mm"]'::jsonb,
        false, null, 0, 0, 0, NOW(), NOW(), NOW()
      )`,
      [
        testProjectId,
        "Midnight Film Study",
        testSlug,
        "Shot on 35mm with raw audio stems.",
        "creator_test",
        JSON.stringify([result.url, "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"]),
        result.url,
      ]
    );
    console.log("✓ Project with media inserted into database");

    // 3. Verify project lookup with media URLs
    console.log("\n3. Testing query to verify media persistence...");
    const res = await client.query(`SELECT * FROM workofhuman.projects WHERE slug = $1`, [testSlug]);
    if (res.rows.length === 0) throw new Error("Project not found by slug");
    const proj = res.rows[0];
    console.log("✓ Project retrieved successfully from DB:", {
      title: proj.title,
      slug: proj.slug,
      thumbnailUrl: proj.thumbnail_url,
      mediaUrls: proj.media_urls,
    });

    if (!Array.isArray(proj.media_urls) || proj.media_urls.length !== 2) {
      throw new Error("Project media_urls did not match expected count");
    }

    // Clean up DB
    await client.query(`DELETE FROM workofhuman.projects WHERE id = $1`, [testProjectId]);
    await client.end();
    console.log("✓ Cleaned up test project from database");

    console.log("\n🎉 ALL MEDIA UPLOAD AND STORAGE TESTS PASSED!");
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

testMediaUpload();

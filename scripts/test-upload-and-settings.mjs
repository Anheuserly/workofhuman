import { Client } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:AnheVps2022@vps.amcmep.in:5432/workofhuman";

async function testUploadAndSettings() {
  console.log("=== Testing Project Uploading and Profile Settings in Database ===");
  const client = new Client({ connectionString });
  await client.connect();

  const timestamp = Date.now();
  const testUserId = `usr_test_${timestamp}`;
  const testProfileId = `prof_test_${timestamp}`;
  const testUsername = `artist_${timestamp.toString(36)}`;
  const testProjectId = `proj_test_${timestamp}`;
  const testProjectSlug = `test-work-${timestamp.toString(36)}`;

  try {
    // 1. Insert Creator Profile
    console.log(`1. Inserting test creator @${testUsername}...`);
    await client.query(
      `INSERT INTO workofhuman.profiles (
        id, user_id, username, email, role, display_name, bio,
        categories, social_links, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, 'creator', 'Test Artist', 'Experimental digital sculptor.',
        '["digital_art", "3d_models"]'::jsonb,
        '{"website": "https://test.com", "twitter": "@test"}'::jsonb,
        NOW(), NOW()
      )`,
      [testProfileId, testUserId, testUsername, `${testUsername}@example.com`]
    );
    console.log("✓ Profile created");

    // 2. Test Project Upload with AI Disclosure
    console.log(`2. Publishing project "${testProjectSlug}" with AI provenance...`);
    await client.query(
      `INSERT INTO workofhuman.projects (
        id, title, slug, description, creator_id, creator_name,
        type, media_urls, thumbnail_url, tags, ai_generated, ai_model,
        views, likes_count, saves_count, published_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, 'Test Artist',
        'digital_art', '["https://example.com/asset.jpg"]'::jsonb,
        'https://example.com/thumb.jpg', '["sculpture", "cyber"]'::jsonb,
        true, 'Midjourney v6.1',
        0, 0, 0, NOW(), NOW(), NOW()
      )`,
      [testProjectId, "The Golden Monolith", testProjectSlug, "An architectural study in brass.", testUserId]
    );
    console.log("✓ Project published successfully");

    // 3. Verify Project Query by Slug
    const projQuery = await client.query(
      `SELECT * FROM workofhuman.projects WHERE slug = $1`,
      [testProjectSlug]
    );
    if (projQuery.rows.length !== 1) throw new Error("Project slug lookup failed");
    const proj = projQuery.rows[0];
    if (!proj.ai_generated || proj.ai_model !== "Midjourney v6.1") {
      throw new Error("AI disclosure fields failed to persist");
    }
    console.log("✓ Verified AI disclosure tags:", {
      title: proj.title,
      ai_generated: proj.ai_generated,
      ai_model: proj.ai_model,
    });

    // 4. Test Updating Settings & Categories
    console.log("3. Testing profile settings update...");
    await client.query(
      `UPDATE workofhuman.profiles
       SET display_name = 'Elena Rostova',
           bio = 'Updated bio for studio showcase.',
           categories = '["films", "music"]'::jsonb,
           social_links = '{"github": "https://github.com/elena"}'::jsonb,
           updated_at = NOW()
       WHERE id = $1`,
      [testProfileId]
    );

    const updatedProfile = await client.query(
      `SELECT display_name, bio, categories, social_links FROM workofhuman.profiles WHERE id = $1`,
      [testProfileId]
    );
    if (updatedProfile.rows[0].display_name !== "Elena Rostova") {
      throw new Error("Profile update failed");
    }
    console.log("✓ Profile settings updated:", updatedProfile.rows[0]);

    // 5. Cleanup
    await client.query(`DELETE FROM workofhuman.projects WHERE id = $1`, [testProjectId]);
    await client.query(`DELETE FROM workofhuman.profiles WHERE id = $1`, [testProfileId]);
    console.log("✓ Cleaned up test data");

    console.log("\n🎉 ALL UPLOAD STUDIO AND SETTINGS TESTS PASSED!");
  } catch (err) {
    console.error("Test error:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testUploadAndSettings();

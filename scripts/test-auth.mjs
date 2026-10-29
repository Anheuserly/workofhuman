import { Client } from "pg";
import bcrypt from "bcryptjs";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:AnheVps2022@vps.amcmep.in:5432/workofhuman";

async function runTest() {
  console.log("=== Testing Auth Data Layer & Schema ===");
  const client = new Client({ connectionString });
  await client.connect();

  const testEmail = `test_creator_${Date.now()}@theworkofhuman.com`;
  const testUsername = `tester_${Date.now().toString(36)}`;
  const testPassword = "SuperSecurePassword123!";
  const testUserId = `usr_test_${Date.now()}`;
  const testProfileId = `prof_test_${Date.now()}`;

  try {
    // 1. Hash password
    const hash = await bcrypt.hash(testPassword, 10);
    console.log("✓ Bcrypt password hashing functional");

    // 2. Insert into profiles
    await client.query(
      `INSERT INTO workofhuman.profiles (
        id, user_id, username, email, password_hash, role, display_name,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, 'creator', 'Test Creator', NOW(), NOW())`,
      [testProfileId, testUserId, testUsername, testEmail, hash]
    );
    console.log(`✓ Inserted test profile: @${testUsername} (${testEmail})`);

    // 3. Verify lookup by email & username
    const resEmail = await client.query(
      `SELECT * FROM workofhuman.profiles WHERE LOWER(email) = $1`,
      [testEmail.toLowerCase()]
    );
    if (resEmail.rows.length !== 1) throw new Error("Email lookup failed");
    console.log("✓ Lookup by email successful");

    const resUser = await client.query(
      `SELECT * FROM workofhuman.profiles WHERE LOWER(username) = $1`,
      [testUsername.toLowerCase()]
    );
    if (resUser.rows.length !== 1) throw new Error("Username lookup failed");
    console.log("✓ Lookup by username successful");

    // 4. Verify password
    const matches = await bcrypt.compare(testPassword, resUser.rows[0].password_hash);
    if (!matches) throw new Error("Password verification failed");
    console.log("✓ Password bcrypt comparison validated");

    // 5. Test session insertion
    const testSessionId = `test_session_${Date.now()}`;
    await client.query(
      `INSERT INTO workofhuman.sessions (id, user_id, profile_id, expires_at, created_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '30 days', NOW())`,
      [testSessionId, testUserId, testProfileId]
    );
    console.log("✓ Created test session in workofhuman.sessions");

    // 6. Test session join query
    const sessionRes = await client.query(
      `SELECT s.id, s.user_id, p.username, p.email, p.role
       FROM workofhuman.sessions s
       JOIN workofhuman.profiles p ON s.profile_id = p.id
       WHERE s.id = $1 AND s.expires_at > NOW()`,
      [testSessionId]
    );
    if (sessionRes.rows.length !== 1) throw new Error("Session resolution failed");
    console.log("✓ Session lookup with profile JOIN successful:", sessionRes.rows[0]);

    // Cleanup test data
    await client.query(`DELETE FROM workofhuman.sessions WHERE id = $1`, [testSessionId]);
    await client.query(`DELETE FROM workofhuman.profiles WHERE id = $1`, [testProfileId]);
    console.log("✓ Cleaned up test records from database");

    console.log("\nALL AUTH DATA TESTS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runTest();

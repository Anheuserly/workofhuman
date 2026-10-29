import { Client } from "pg";
import fs from "node:fs";
import path from "node:path";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:AnheVps2022@vps.amcmep.in:5432/workofhuman";

async function testAdminAndRoles() {
  console.log("=== Testing Admin Panel & Role-Based Logic ===");
  const client = new Client({ connectionString });
  await client.connect();

  try {
    // 1. Verify Brand Icon & Favicon Files
    console.log("1. Checking Brand Icon & Favicon Files on Disk...");
    const publicDir = path.join(process.cwd(), "public");
    const faviconPath = path.join(publicDir, "favicon.svg");
    const iconPath = path.join(publicDir, "icon.svg");
    const logoPath = path.join(publicDir, "logo.svg");
    const appIconPath = path.join(process.cwd(), "src/app/icon.svg");

    if (!fs.existsSync(faviconPath)) throw new Error("favicon.svg is missing from public");
    if (!fs.existsSync(iconPath)) throw new Error("icon.svg is missing from public");
    if (!fs.existsSync(logoPath)) throw new Error("logo.svg is missing from public");
    if (!fs.existsSync(appIconPath)) throw new Error("icon.svg is missing from src/app");

    console.log("✓ Brand Logo, Favicon, and App Icons verified successfully!");

    // 2. Test Role Verification in Database
    console.log("\n2. Testing Creator vs Admin Roles in Database...");
    const adminCheck = await client.query(
      `SELECT id, username, role, verified FROM workofhuman.profiles WHERE role = 'admin' LIMIT 1`
    );
    if (adminCheck.rows.length === 0) {
      throw new Error("No admin profile found in database");
    }
    console.log("✓ Found active Administrator:", adminCheck.rows[0]);

    // 3. Test Updating Verification & Roles
    console.log("\n3. Testing Role & Verification Mutations...");
    const testUserRes = await client.query(
      `SELECT id, username, role, verified FROM workofhuman.profiles WHERE role != 'admin' LIMIT 1`
    );
    if (testUserRes.rows.length > 0) {
      const targetUser = testUserRes.rows[0];
      const newVerified = !targetUser.verified;

      // Toggle verified
      await client.query(
        `UPDATE workofhuman.profiles SET verified = $1 WHERE id = $2`,
        [newVerified, targetUser.id]
      );
      const verifyCheck = await client.query(
        `SELECT verified FROM workofhuman.profiles WHERE id = $1`,
        [targetUser.id]
      );
      if (verifyCheck.rows[0].verified !== newVerified) {
        throw new Error("Failed to toggle verification");
      }
      console.log(`✓ Verification toggle for @${targetUser.username} succeeded (verified: ${newVerified})`);

      // Revert back
      await client.query(
        `UPDATE workofhuman.profiles SET verified = $1 WHERE id = $2`,
        [targetUser.verified, targetUser.id]
      );
      console.log("✓ Reverted target user status cleanly");
    }

    // 4. Test Homepage Settings Read / Write
    console.log("\n4. Testing Platform Homepage Settings Access...");
    const settings = await client.query(`SELECT * FROM workofhuman.homepage_settings WHERE id = 'default'`);
    if (settings.rows.length === 0) {
      throw new Error("Homepage settings missing");
    }
    console.log("✓ Homepage settings confirmed: Heading ->", settings.rows[0].heading);

    console.log("\n🎉 ALL ADMIN, ROLE-BASED, AND ASSET TESTS PASSED!");
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testAdminAndRoles();

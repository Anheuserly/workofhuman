import { Client } from "pg";

const BASE_URL = "http://localhost:3009";
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:AnheVps2022@vps.amcmep.in:5432/workofhuman";

async function testHttpAuth() {
  console.log("=== Testing Next.js Auth Endpoints ===");

  const timestamp = Date.now();
  const testEmail = `dev_${timestamp}@theworkofhuman.com`;
  const testUsername = `creator_${timestamp.toString(36)}`;
  const testPassword = "SecretPassword123#";
  const testDisplayName = "Studio Creator";

  let sessionCookie = "";

  try {
    // 1. Test POST /api/auth/register
    console.log(`1. Testing /api/auth/register for @${testUsername}...`);
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        username: testUsername,
        password: testPassword,
        displayName: testDisplayName,
      }),
    });

    const regData = await regRes.json();
    console.log("Register response status:", regRes.status, regData);
    if (regRes.status !== 201 || !regData.success) {
      throw new Error("Registration failed: " + JSON.stringify(regData));
    }

    const setCookie = regRes.headers.get("set-cookie");
    if (!setCookie || !setCookie.includes("woh_session")) {
      throw new Error("Expected woh_session cookie in registration response");
    }
    sessionCookie = setCookie.split(";")[0];
    console.log("✓ Received session cookie:", sessionCookie);

    // 2. Test GET /api/auth/me
    console.log("\n2. Testing /api/auth/me with session cookie...");
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    const meData = await meRes.json();
    console.log("Me response:", meData);
    if (!meData.user || meData.user.username !== testUsername) {
      throw new Error("Failed to get current user from session");
    }
    console.log("✓ Current user resolved successfully:", meData.user.username);

    // 3. Test POST /api/auth/logout
    console.log("\n3. Testing /api/auth/logout...");
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
    });
    const logoutData = await logoutRes.json();
    console.log("Logout response:", logoutData);
    if (!logoutData.success) throw new Error("Logout failed");

    // 4. Test GET /api/auth/me after logout
    console.log("\n4. Testing /api/auth/me after logout (should be null)...");
    const meAfterLogout = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    const meAfterData = await meAfterLogout.json();
    console.log("Me after logout:", meAfterData);
    if (meAfterData.user !== null) {
      throw new Error("User was still authenticated after logout");
    }
    console.log("✓ Session invalidation verified");

    // 5. Test POST /api/auth/login with email
    console.log("\n5. Testing /api/auth/login with email...");
    const loginEmailRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: testEmail,
        password: testPassword,
      }),
    });
    const loginEmailData = await loginEmailRes.json();
    console.log("Login with email response:", loginEmailData);
    if (!loginEmailData.success) throw new Error("Login with email failed");
    console.log("✓ Login with email successful");

    // 6. Test POST /api/auth/login with username handle
    console.log("\n6. Testing /api/auth/login with username handle...");
    const loginUserRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: testUsername,
        password: testPassword,
      }),
    });
    const loginUserData = await loginUserRes.json();
    console.log("Login with username response:", loginUserData);
    if (!loginUserData.success) throw new Error("Login with username failed");
    console.log("✓ Login with username handle successful");

    // Cleanup database
    const client = new Client({ connectionString });
    await client.connect();
    await client.query("DELETE FROM workofhuman.sessions WHERE user_id = $1", [regData.user.userId]);
    await client.query("DELETE FROM workofhuman.profiles WHERE id = $1", [regData.user.profileId]);
    await client.end();
    console.log("\n✓ Cleaned up test user from database");

    console.log("\n🎉 ALL HTTP AUTH ENDPOINTS WORKING PERFECTLY!");
  } catch (err) {
    console.error("HTTP Auth Test Failed:", err);
    process.exit(1);
  }
}

testHttpAuth();

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { query } from "./db";

export interface UserSession {
  userId: string;
  profileId: string;
  username: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  verified: boolean;
}

export const SESSION_COOKIE_NAME = "woh_session";
export const SESSION_DURATION_DAYS = 30;

export const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "categories",
  "communities",
  "community",
  "dashboard",
  "discover",
  "docs",
  "explore",
  "feed",
  "help",
  "home",
  "login",
  "logout",
  "marketplace",
  "messages",
  "notifications",
  "profile",
  "register",
  "search",
  "settings",
  "signin",
  "signup",
  "studio",
  "trending",
  "upload",
  "workofhuman",
  "ai",
]);

/**
 * Validates whether a username handle is permitted.
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  const normalized = username.trim().toLowerCase();
  if (normalized.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters long." };
  }
  if (normalized.length > 30) {
    return { valid: false, error: "Username cannot exceed 30 characters." };
  }
  if (!/^[a-z0-9_]+$/.test(normalized)) {
    return { valid: false, error: "Username can only contain letters, numbers, and underscores." };
  }
  if (RESERVED_USERNAMES.has(normalized)) {
    return { valid: false, error: `The username "${normalized}" is reserved for system routes.` };
  }
  return { valid: true };
}

/**
 * Hashes a plaintext password with bcrypt (salt rounds = 12).
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compares plaintext password against a stored bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Creates a persistent database session and assigns an HTTP-only cookie.
 */
export async function createSession(userId: string, profileId: string): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await query(
    `INSERT INTO workofhuman.sessions (id, user_id, profile_id, expires_at, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [sessionId, userId, profileId, expiresAt.toISOString()]
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return sessionId;
}

/**
 * Invalidates the current session in the database and clears the HTTP-only cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    try {
      await query(`DELETE FROM workofhuman.sessions WHERE id = $1`, [sessionToken]);
    } catch (err) {
      console.error("[destroySession error]:", err);
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Retrieves the currently authenticated user profile from the session cookie.
 */
export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    const result = await query<{
      user_id: string;
      profile_id: string;
      username: string;
      email: string | null;
      display_name: string | null;
      avatar_url: string | null;
      role: string | null;
      verified: boolean;
      expires_at: string;
    }>(
      `SELECT 
         s.user_id,
         s.profile_id,
         s.expires_at,
         p.username,
         p.email,
         p.display_name,
         p.avatar_url,
         COALESCE(p.role, 'creator') as role,
         COALESCE(p.verified, false) as verified
       FROM workofhuman.sessions s
       JOIN workofhuman.profiles p ON s.profile_id = p.id
       WHERE s.id = $1 AND s.expires_at > NOW()
       LIMIT 1`,
      [sessionToken]
    );

    if (result.rows.length === 0) {
      // Session expired or invalid
      return null;
    }

    const row = result.rows[0];
    return {
      userId: row.user_id,
      profileId: row.profile_id,
      username: row.username,
      email: row.email,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      role: row.role || "creator",
      verified: row.verified,
    };
  } catch (err) {
    console.error("[getCurrentUser error]:", err);
    return null;
  }
}

/**
 * Route guard requiring authenticated user. Redirects to /login if unauthenticated.
 */
export async function requireUser(nextUrl?: string): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user) {
    const redirectTarget = nextUrl ? `/login?next=${encodeURIComponent(nextUrl)}` : "/login";
    redirect(redirectTarget);
  }
  return user;
}

/**
 * Route guard requiring an admin user. Redirects to /login if unauthenticated or not an admin.
 */
export async function requireAdmin(nextUrl = "/admin"): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect(`/login?next=${encodeURIComponent(nextUrl)}`);
  }
  return user;
}

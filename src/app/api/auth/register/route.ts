import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, hashPassword, validateUsername, SESSION_COOKIE_NAME, SESSION_DURATION_DAYS } from "@/lib/auth";
import { query } from "@/lib/db";

const RegisterSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  username: z.string().trim().min(3, "Username must be at least 3 characters.").max(30),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  displayName: z.string().trim().max(160).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid registration data." },
        { status: 400 }
      );
    }

    const { email, username, password, displayName } = parsed.data;
    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();

    // Validate username rules & blacklist
    const usernameCheck = validateUsername(normalizedUsername);
    if (!usernameCheck.valid) {
      return NextResponse.json({ error: usernameCheck.error }, { status: 400 });
    }

    // Check if email is already taken
    const existingEmail = await query(
      `SELECT id FROM workofhuman.profiles WHERE LOWER(email) = $1 LIMIT 1`,
      [normalizedEmail]
    );
    if (existingEmail.rows.length > 0) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // Check if username is already taken
    const existingUsername = await query(
      `SELECT id FROM workofhuman.profiles WHERE LOWER(username) = $1 LIMIT 1`,
      [normalizedUsername]
    );
    if (existingUsername.rows.length > 0) {
      return NextResponse.json(
        { error: `The handle @${normalizedUsername} is already taken. Please choose another.` },
        { status: 409 }
      );
    }

    // Hash password securely
    const passwordHash = await hashPassword(password);
    const userId = `usr_${crypto.randomUUID().replace(/-/g, "")}`;
    const profileId = `prof_${crypto.randomUUID().replace(/-/g, "")}`;
    const shortChars = "23456789abcdefghjkmnpqrstuvwxyz";
    let shortId = "";
    for (let i = 0; i < 8; i++) {
      shortId += shortChars[Math.floor(Math.random() * shortChars.length)];
    }
    const cleanDisplayName = displayName && displayName.trim().length > 0 ? displayName.trim() : normalizedUsername;

    // Insert user into profiles
    await query(
      `INSERT INTO workofhuman.profiles (
        id, user_id, username, short_id, email, password_hash, role, display_name,
        bio, avatar_url, banner_url, verified, categories, social_links,
        followers_count, views_count, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 'creator', $7,
        '', '', '', false, '[]'::jsonb, '{}'::jsonb,
        0, 0, NOW(), NOW()
      )`,
      [profileId, userId, normalizedUsername, shortId, normalizedEmail, passwordHash, cleanDisplayName]
    );

    // Create session in database and on cookie
    const sessionId = await createSession(userId, profileId);

    const response = NextResponse.json(
      {
        success: true,
        user: {
          userId,
          profileId,
          username: normalizedUsername,
          email: normalizedEmail,
          displayName: cleanDisplayName,
          role: "creator",
          verified: false,
        },
      },
      { status: 201 }
    );

    // Explicitly set cookie header on response for maximum compatibility across all runtimes
    response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    });

    return response;
  } catch (err: unknown) {
    console.error("[Register Error]:", err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Registration failed: ${errorMsg}` },
      { status: 500 }
    );
  }
}

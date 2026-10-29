import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, hashPassword, validateUsername } from "@/lib/auth";
import { query } from "@/lib/db";

const RegisterSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  username: z.string().trim().min(3).max(30),
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
        { error: "An account with this email address already exists." },
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
        { error: "This username handle is already taken. Please choose another." },
        { status: 409 }
      );
    }

    // Hash password securely
    const passwordHash = await hashPassword(password);
    const userId = `usr_${crypto.randomUUID().replace(/-/g, "")}`;
    const profileId = `prof_${crypto.randomUUID().replace(/-/g, "")}`;
    const cleanDisplayName = displayName && displayName.trim().length > 0 ? displayName.trim() : normalizedUsername;

    // Insert user into profiles
    await query(
      `INSERT INTO workofhuman.profiles (
        id, user_id, username, email, password_hash, role, display_name,
        bio, avatar_url, banner_url, verified, categories, social_links,
        followers_count, views_count, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, 'creator', $6,
        '', '', '', false, '[]'::jsonb, '{}'::jsonb,
        0, 0, NOW(), NOW()
      )`,
      [profileId, userId, normalizedUsername, normalizedEmail, passwordHash, cleanDisplayName]
    );

    // Create persistent session and set HTTP-only cookie
    await createSession(userId, profileId);

    return NextResponse.json(
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
  } catch (err) {
    console.error("[Register Error]:", err);
    return NextResponse.json(
      { error: "Failed to create account. Please try again later." },
      { status: 500 }
    );
  }
}

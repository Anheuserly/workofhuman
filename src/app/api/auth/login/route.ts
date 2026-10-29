import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, verifyPassword } from "@/lib/auth";
import { query } from "@/lib/db";

const LoginSchema = z.object({
  identifier: z.string().trim().min(1, "Please enter your email or username."),
  password: z.string().min(1, "Please enter your password."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid login credentials." },
        { status: 400 }
      );
    }

    const { identifier, password } = parsed.data;
    const normalizedIdentifier = identifier.toLowerCase();

    // Query profile by email OR username
    const result = await query<{
      id: string;
      user_id: string;
      username: string;
      email: string | null;
      password_hash: string | null;
      role: string | null;
      display_name: string | null;
      avatar_url: string | null;
      verified: boolean;
    }>(
      `SELECT 
         id, user_id, username, email, password_hash, role,
         display_name, avatar_url, verified
       FROM workofhuman.profiles
       WHERE LOWER(email) = $1 OR LOWER(username) = $1
       LIMIT 1`,
      [normalizedIdentifier]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid email/username or password." },
        { status: 401 }
      );
    }

    const profile = result.rows[0];

    // If account was created without a password (e.g. mock seed profile), notify user
    if (!profile.password_hash) {
      return NextResponse.json(
        { error: "This profile was initialized without a password. Please sign up or reset password." },
        { status: 401 }
      );
    }

    const passwordMatches = await verifyPassword(password, profile.password_hash);
    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid email/username or password." },
        { status: 401 }
      );
    }

    // Create session and set HTTP-only cookie
    await createSession(profile.user_id, profile.id);

    return NextResponse.json({
      success: true,
      user: {
        userId: profile.user_id,
        profileId: profile.id,
        username: profile.username,
        email: profile.email,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        role: profile.role || "creator",
        verified: profile.verified,
      },
    });
  } catch (err) {
    console.error("[Login Error]:", err);
    return NextResponse.json(
      { error: "Failed to sign in. Please try again later." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

const UpdateProfileSchema = z.object({
  displayName: z.string().trim().max(160).optional(),
  bio: z.string().max(2000).optional(),
  avatarUrl: z.string().trim().url().optional().or(z.literal("")),
  bannerUrl: z.string().trim().url().optional().or(z.literal("")),
  categories: z.array(z.string()).default([]),
  socialLinks: z
    .object({
      website: z.string().optional(),
      twitter: z.string().optional(),
      github: z.string().optional(),
      instagram: z.string().optional(),
      youtube: z.string().optional(),
    })
    .default({}),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await query(
      `SELECT id, user_id, username, email, display_name, bio,
              avatar_url, banner_url, verified, role, categories, social_links
       FROM workofhuman.profiles
       WHERE id = $1
       LIMIT 1`,
      [user.profileId]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const row = res.rows[0];
    return NextResponse.json({
      profile: {
        id: row.id,
        userId: row.user_id,
        username: row.username,
        email: row.email,
        displayName: row.display_name,
        bio: row.bio,
        avatarUrl: row.avatar_url,
        bannerUrl: row.banner_url,
        verified: row.verified,
        role: row.role,
        categories: Array.isArray(row.categories) ? row.categories : [],
        socialLinks: row.social_links || {},
      },
    });
  } catch (err) {
    console.error("[Get Profile Error]:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = UpdateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid profile data." },
        { status: 400 }
      );
    }

    const { displayName, bio, avatarUrl, bannerUrl, categories, socialLinks } = parsed.data;

    await query(
      `UPDATE workofhuman.profiles
       SET display_name = $1,
           bio = $2,
           avatar_url = $3,
           banner_url = $4,
           categories = $5::jsonb,
           social_links = $6::jsonb,
           updated_at = NOW()
       WHERE id = $7`,
      [
        displayName || null,
        bio || null,
        avatarUrl || null,
        bannerUrl || null,
        JSON.stringify(categories),
        JSON.stringify(socialLinks),
        user.profileId,
      ]
    );

    return NextResponse.json({ success: true, message: "Profile updated successfully." });
  } catch (err) {
    console.error("[Update Profile Error]:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

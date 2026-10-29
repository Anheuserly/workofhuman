import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    // 1. Counts & Metrics
    const [userCountRes, verifiedCountRes, projectCountRes, interactionCountRes] = await Promise.all([
      query<{ count: string }>(`SELECT COUNT(*) as count FROM workofhuman.profiles`),
      query<{ count: string }>(`SELECT COUNT(*) as count FROM workofhuman.profiles WHERE verified = true`),
      query<{ count: string }>(`SELECT COUNT(*) as count FROM workofhuman.projects`),
      query<{ count: string }>(`SELECT COUNT(*) as count FROM workofhuman.interactions`),
    ]);

    const stats = {
      totalUsers: parseInt(userCountRes.rows[0]?.count || "0", 10),
      verifiedUsers: parseInt(verifiedCountRes.rows[0]?.count || "0", 10),
      totalProjects: parseInt(projectCountRes.rows[0]?.count || "0", 10),
      totalInteractions: parseInt(interactionCountRes.rows[0]?.count || "0", 10),
    };

    // 2. Profiles directory
    const profilesRes = await query<{
      id: string;
      user_id: string;
      username: string;
      email: string | null;
      role: string;
      display_name: string | null;
      avatar_url: string | null;
      verified: boolean;
      followers_count: number;
      views_count: number;
      created_at: string;
    }>(
      `SELECT 
         id, user_id, username, email, COALESCE(role, 'creator') as role,
         display_name, avatar_url, COALESCE(verified, false) as verified,
         COALESCE(followers_count, 0) as followers_count,
         COALESCE(views_count, 0) as views_count,
         created_at
       FROM workofhuman.profiles
       ORDER BY created_at DESC
       LIMIT 100`
    );

    // 3. Current Homepage Settings
    const settingsRes = await query<{
      id: string;
      eyebrow: string;
      heading: string;
      subheading: string;
      primary_cta_label: string;
      primary_cta_href: string;
      secondary_cta_label: string;
      secondary_cta_href: string;
      footer_text: string;
    }>(`SELECT * FROM workofhuman.homepage_settings WHERE id = 'default' LIMIT 1`);

    // 4. Recent Projects for Moderation
    const projectsRes = await query<{
      id: string;
      title: string;
      slug: string;
      type: string;
      creator_id: string;
      creator_name: string | null;
      ai_generated: boolean;
      ai_model: string | null;
      views: number;
      published_at: string;
    }>(
      `SELECT id, title, slug, type, creator_id, creator_name,
              ai_generated, ai_model, views, published_at
       FROM workofhuman.projects
       ORDER BY published_at DESC
       LIMIT 20`
    );

    return NextResponse.json({
      stats,
      profiles: profilesRes.rows.map((p) => ({
        id: p.id,
        userId: p.user_id,
        username: p.username,
        email: p.email,
        role: p.role,
        displayName: p.display_name,
        avatarUrl: p.avatar_url,
        verified: p.verified,
        followersCount: Number(p.followers_count),
        viewsCount: Number(p.views_count),
        createdAt: p.created_at,
      })),
      settings: settingsRes.rows[0]
        ? {
            eyebrow: settingsRes.rows[0].eyebrow,
            heading: settingsRes.rows[0].heading,
            subheading: settingsRes.rows[0].subheading,
            primaryCtaLabel: settingsRes.rows[0].primary_cta_label,
            primaryCtaHref: settingsRes.rows[0].primary_cta_href,
            secondaryCtaLabel: settingsRes.rows[0].secondary_cta_label,
            secondaryCtaHref: settingsRes.rows[0].secondary_cta_href,
            footerText: settingsRes.rows[0].footer_text,
          }
        : null,
      projects: projectsRes.rows.map((pr) => ({
        id: pr.id,
        title: pr.title,
        slug: pr.slug,
        type: pr.type,
        creatorId: pr.creator_id,
        creatorName: pr.creator_name,
        aiGenerated: pr.ai_generated,
        aiModel: pr.ai_model,
        views: pr.views,
        publishedAt: pr.published_at,
      })),
    });
  } catch (err) {
    console.error("[Admin Overview Error]:", err);
    return NextResponse.json({ error: "Failed to load admin metrics." }, { status: 500 });
  }
}

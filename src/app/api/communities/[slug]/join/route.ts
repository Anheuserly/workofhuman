import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();

    // Fetch community
    const commRes = await query<{ id: string; member_count: number }>(
      `SELECT id, member_count FROM workofhuman.communities WHERE slug = $1 LIMIT 1`,
      [slug]
    );

    if (commRes.rows.length === 0) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    const community = commRes.rows[0];

    if (!user) {
      return NextResponse.json({
        isMember: false,
        memberCount: community.member_count || 0,
      });
    }

    // Check membership
    const memberRes = await query(
      `SELECT id, role FROM workofhuman.community_members WHERE community_id = $1 AND user_id = $2 LIMIT 1`,
      [community.id, user.userId]
    );

    return NextResponse.json({
      isMember: memberRes.rows.length > 0,
      role: memberRes.rows[0]?.role || null,
      memberCount: community.member_count || 0,
    });
  } catch (err) {
    console.error("[Community Join GET Error]:", err);
    return NextResponse.json({ error: "Failed to fetch membership" }, { status: 500 });
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "You must be signed in to join a community guild." }, { status: 401 });
    }

    // Fetch community
    const commRes = await query<{ id: string; member_count: number }>(
      `SELECT id, member_count FROM workofhuman.communities WHERE slug = $1 LIMIT 1`,
      [slug]
    );

    if (commRes.rows.length === 0) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    const community = commRes.rows[0];

    // Check existing membership
    const memberRes = await query(
      `SELECT id FROM workofhuman.community_members WHERE community_id = $1 AND user_id = $2 LIMIT 1`,
      [community.id, user.userId]
    );

    const isCurrentlyMember = memberRes.rows.length > 0;

    if (isCurrentlyMember) {
      // Leave guild
      await query(
        `DELETE FROM workofhuman.community_members WHERE community_id = $1 AND user_id = $2`,
        [community.id, user.userId]
      );
      await query(
        `UPDATE workofhuman.communities SET member_count = GREATEST(0, member_count - 1), updated_at = NOW() WHERE id = $1`,
        [community.id]
      );

      return NextResponse.json({
        isMember: false,
        memberCount: Math.max(0, (community.member_count || 1) - 1),
        message: "You have left the guild.",
      });
    } else {
      // Join guild
      const memberId = `cm_${crypto.randomUUID().replace(/-/g, "")}`;
      await query(
        `INSERT INTO workofhuman.community_members (id, community_id, user_id, role, joined_at)
         VALUES ($1, $2, $3, 'member', NOW())`,
        [memberId, community.id, user.userId]
      );
      await query(
        `UPDATE workofhuman.communities SET member_count = COALESCE(member_count, 0) + 1, updated_at = NOW() WHERE id = $1`,
        [community.id]
      );

      return NextResponse.json({
        isMember: true,
        memberCount: (community.member_count || 0) + 1,
        message: "Welcome to the guild!",
      });
    }
  } catch (err: unknown) {
    console.error("[Community Join POST Error]:", err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

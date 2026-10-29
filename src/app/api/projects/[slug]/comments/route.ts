import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const res = await query<{
      id: string;
      content: string;
      likes_count: number;
      created_at: string;
      username: string;
      display_name: string;
      avatar_url?: string | null;
    }>(
      `SELECT c.id, c.content, 0 as likes_count, c.created_at,
              COALESCE(p.username, 'member') as username,
              COALESCE(p.display_name, 'Creative Member') as display_name,
              p.avatar_url
       FROM workofhuman.comments c
       LEFT JOIN workofhuman.profiles p ON p.user_id = c.user_id
       WHERE c.project_id = $1
       ORDER BY c.created_at DESC LIMIT 50`,
      [slug]
    );

    return NextResponse.json({ success: true, comments: res.rows });
  } catch (err: unknown) {
    console.error("[Get Comments Error]:", err);
    return NextResponse.json({ success: false, comments: [] });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to join the discussion." },
        { status: 401 }
      );
    }

    const { content } = (await request.json()) as { content?: string };
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Comment text cannot be empty." },
        { status: 400 }
      );
    }

    const { slug } = await params;
    const commentId = `cm_${
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID().replace(/-/g, "")
        : Math.random().toString(36).substring(2, 12)
    }`;

    await query(
      `INSERT INTO workofhuman.comments (id, project_id, user_id, content, likes_count, created_at)
       VALUES ($1, $2, $3, $4, 0, NOW())`,
      [commentId, slug, user.userId, content.trim()]
    );

    return NextResponse.json(
      {
        success: true,
        comment: {
          id: commentId,
          content: content.trim(),
          likes_count: 0,
          created_at: new Date().toISOString(),
          username: user.username,
          display_name: user.displayName || user.username,
          avatar_url: null,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[Create Comment Error]:", err);
    return NextResponse.json(
      { error: "Failed to post comment. Please try again." },
      { status: 500 }
    );
  }
}

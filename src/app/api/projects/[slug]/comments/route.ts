import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

function generateId(prefix: string): string {
  const ts = Date.now();
  const rnd = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${ts}_${rnd}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || "").trim();

    // Find project to get both ID and slug
    const projRes = await query<{ id: string }>(
      `SELECT id FROM workofhuman.projects WHERE slug = $1 OR slug = $2 LIMIT 1`,
      [cleanSlug, slug]
    );
    const projectId = projRes.rows[0]?.id;

    const res = await query<{
      id: string;
      content: string;
      likes_count: number;
      created_at: string;
      username: string;
      display_name: string;
      avatar_url?: string | null;
    }>(
      `SELECT c.id, c.content, COALESCE(c.likes_count, 0) as likes_count, c.created_at,
              COALESCE(p.username, 'member') as username,
              COALESCE(p.display_name, 'Creative Member') as display_name,
              p.avatar_url
       FROM workofhuman.comments c
       LEFT JOIN workofhuman.profiles p ON p.user_id = c.user_id
       WHERE c.project_id = $1 OR c.project_id = $2
       ORDER BY c.created_at DESC LIMIT 50`,
      [cleanSlug, projectId || cleanSlug]
    );

    return NextResponse.json({ success: true, comments: res.rows });
  } catch (err: unknown) {
    console.error("[Get Comments Error]:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg, comments: [] });
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
    const cleanSlug = decodeURIComponent(slug || "").trim();

    // Look up project
    const projRes = await query<{
      id: string;
      creator_id: string;
      title: string;
      slug: string;
      creator_username?: string;
    }>(
      `SELECT p.id, p.creator_id, p.title, p.slug, pr.username as creator_username
       FROM workofhuman.projects p
       LEFT JOIN workofhuman.profiles pr ON (pr.user_id = p.creator_id OR pr.id::text = p.creator_id)
       WHERE p.slug = $1 OR p.slug = $2 LIMIT 1`,
      [cleanSlug, slug]
    );

    if (projRes.rows.length === 0) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const project = projRes.rows[0];
    const commentId = generateId("cm");

    await query(
      `INSERT INTO workofhuman.comments (id, project_id, user_id, content, likes_count, created_at)
       VALUES ($1, $2, $3, $4, 0, NOW())`,
      [commentId, project.id, user.userId, content.trim()]
    );

    // Notify project creator if not commenting on own work
    if (project.creator_id !== user.userId) {
      const notifId = generateId("notif");
      const creatorHandle = project.creator_username || "creator";
      await query(
        `INSERT INTO workofhuman.notifications (id, user_id, type, title, message, link, is_read, created_at)
         VALUES ($1, $2, 'comment', $3, $4, $5, false, NOW())`,
        [
          notifId,
          project.creator_id,
          "New Feedback on Creation",
          `@${user.username} commented on your creation "${project.title}".`,
          `/@${creatorHandle}/${project.slug}`,
        ]
      ).catch((e) => console.warn("Failed to create notification:", e));
    }

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
          avatar_url: user.avatarUrl || null,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[Create Comment Error]:", err);
    const msg = err instanceof Error ? err.message : "Failed to post comment.";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}

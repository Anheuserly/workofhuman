import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query, withClient } from "@/lib/db";

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
    const user = await getCurrentUser();

    const projRes = await query<{ id: string; likes_count: number; liked: boolean }>(
      `SELECT p.id, COALESCE(p.likes_count, 0) as likes_count,
              EXISTS (
                SELECT 1 FROM workofhuman.interactions i
                WHERE i.project_id = p.id AND i.user_id = $3 AND i.type = 'like'
              ) as liked
       FROM workofhuman.projects p
       WHERE p.slug = $1 OR p.slug = $2 LIMIT 1`,
      [cleanSlug, slug, user?.userId || null]
    );

    if (projRes.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projRes.rows[0];

    return NextResponse.json({
      liked: Boolean(project.liked),
      likesCount: Number(project.likes_count || 0),
    });
  } catch (err: unknown) {
    console.error("[Get Like Status Error]:", err);
    return NextResponse.json({ liked: false, likesCount: 0 });
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to appreciate creations." },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || "").trim();

    return await withClient(async (client) => {
      const projRes = await client.query<{
        id: string;
        creator_id: string;
        title: string;
        likes_count: number;
        slug: string;
        creator_username?: string;
      }>(
        `SELECT p.id, p.creator_id, p.title, p.likes_count, p.slug, pr.username as creator_username
         FROM workofhuman.projects p
         LEFT JOIN workofhuman.profiles pr ON (pr.user_id = p.creator_id OR pr.id::text = p.creator_id)
         WHERE p.slug = $1 OR p.slug = $2 LIMIT 1`,
        [cleanSlug, slug]
      );

      if (projRes.rows.length === 0) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      const project = projRes.rows[0];

      // Check if already liked
      const existing = await client.query<{ id: string }>(
        `SELECT id FROM workofhuman.interactions WHERE user_id = $1 AND project_id = $2 AND type = 'like' LIMIT 1`,
        [user.userId, project.id]
      );

      let liked = false;
      let newCount = Number(project.likes_count || 0);

      if (existing.rows.length > 0) {
        // Unlike
        await client.query(
          `DELETE FROM workofhuman.interactions WHERE id = $1`,
          [existing.rows[0].id]
        );
        newCount = Math.max(0, newCount - 1);
        liked = false;
      } else {
        // Like
        const intId = generateId("int");
        await client.query(
          `INSERT INTO workofhuman.interactions (id, user_id, project_id, type, created_at)
           VALUES ($1, $2, $3, 'like', NOW())`,
          [intId, user.userId, project.id]
        );

        newCount += 1;
        liked = true;

        // Notify project creator if not liking own work
        if (project.creator_id !== user.userId) {
          const notifId = generateId("notif");
          const creatorHandle = project.creator_username || "creator";
          await client.query(
            `INSERT INTO workofhuman.notifications (id, user_id, type, title, message, link, is_read, created_at)
             VALUES ($1, $2, 'like', $3, $4, $5, false, NOW())`,
            [
              notifId,
              project.creator_id,
              "New Appreciation",
              `@${user.username} appreciated your creation "${project.title}".`,
              `/@${creatorHandle}/${project.slug}`,
            ]
          ).catch(() => {});
        }
      }

      // Update project likes_count
      await client.query(
        `UPDATE workofhuman.projects SET likes_count = $1, updated_at = NOW() WHERE id = $2`,
        [newCount, project.id]
      );

      return NextResponse.json({
        success: true,
        liked,
        likesCount: newCount,
      });
    });
  } catch (err: unknown) {
    console.error("[Like Project Error]:", err);
    return NextResponse.json(
      { error: "Failed to update appreciation." },
      { status: 500 }
    );
  }
}

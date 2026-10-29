import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUsername = searchParams.get("username");
    if (!targetUsername) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    const cleanUsername = targetUsername.replace(/^[@%40]+/, "").toLowerCase();
    const user = await getCurrentUser();

    const profRes = await query<{ user_id: string; followers_count: number }>(
      `SELECT user_id, followers_count FROM workofhuman.profiles WHERE LOWER(username) = $1 LIMIT 1`,
      [cleanUsername]
    );

    if (profRes.rows.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const targetUser = profRes.rows[0];
    let following = false;

    if (user && user.userId !== targetUser.user_id) {
      const followCheck = await query(
        `SELECT id FROM workofhuman.follows WHERE follower_id = $1 AND following_id = $2 LIMIT 1`,
        [user.userId, targetUser.user_id]
      );
      following = followCheck.rows.length > 0;
    }

    return NextResponse.json({
      following,
      followersCount: Number(targetUser.followers_count || 0),
    });
  } catch (err: unknown) {
    console.error("[Get Follow Status Error]:", err);
    return NextResponse.json({ following: false, followersCount: 0 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to follow creators." },
        { status: 401 }
      );
    }

    const { username } = (await request.json()) as { username?: string };
    if (!username) {
      return NextResponse.json({ error: "Target username is required." }, { status: 400 });
    }

    const cleanUsername = username.replace(/^[@%40]+/, "").toLowerCase();

    const profRes = await query<{ user_id: string; followers_count: number }>(
      `SELECT user_id, followers_count FROM workofhuman.profiles WHERE LOWER(username) = $1 LIMIT 1`,
      [cleanUsername]
    );

    if (profRes.rows.length === 0) {
      return NextResponse.json({ error: "Creator profile not found." }, { status: 404 });
    }

    const targetUser = profRes.rows[0];

    if (targetUser.user_id === user.userId) {
      return NextResponse.json({ error: "You cannot follow your own profile." }, { status: 400 });
    }

    // Check existing follow
    const existing = await query<{ id: string }>(
      `SELECT id FROM workofhuman.follows WHERE follower_id = $1 AND following_id = $2 LIMIT 1`,
      [user.userId, targetUser.user_id]
    );

    let following = false;
    let newCount = Number(targetUser.followers_count || 0);

    if (existing.rows.length > 0) {
      // Unfollow
      await query(`DELETE FROM workofhuman.follows WHERE id = $1`, [existing.rows[0].id]);
      newCount = Math.max(0, newCount - 1);
      following = false;
    } else {
      // Follow (id has gen_random_uuid() default in schema)
      await query(
        `INSERT INTO workofhuman.follows (follower_id, following_id, created_at)
         VALUES ($1, $2, NOW())`,
        [user.userId, targetUser.user_id]
      );

      newCount += 1;
      following = true;

      // Notify followed creator
      await query(
        `INSERT INTO workofhuman.notifications (user_id, actor_id, type, entity_id, content, read, created_at)
         VALUES ($1, $2, 'follow', $3, $4, false, NOW())`,
        [
          targetUser.user_id,
          user.userId,
          `/@${user.username}`,
          `@${user.username} started following your portfolio.`,
        ]
      ).catch(() => {});
    }

    // Update target profile followers count
    await query(
      `UPDATE workofhuman.profiles SET followers_count = $1, updated_at = NOW() WHERE user_id = $2`,
      [newCount, targetUser.user_id]
    );

    return NextResponse.json({
      success: true,
      following,
      followersCount: newCount,
    });
  } catch (err: unknown) {
    console.error("[Follow Toggle Error]:", err);
    return NextResponse.json(
      { error: "Failed to update follow status." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await query<{
      id: string;
      type: string;
      title: string;
      message: string;
      link: string;
      is_read: boolean;
      created_at: string;
    }>(
      `SELECT id, type, title, message, link, is_read, created_at
       FROM workofhuman.notifications
       WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 50`,
      [user.userId]
    );

    return NextResponse.json({ success: true, notifications: res.rows });
  } catch (err: unknown) {
    console.error("[Get Notifications Error]:", err);
    return NextResponse.json({ success: false, notifications: [] });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as { notificationId?: string };

    if (body.notificationId) {
      await query(
        `UPDATE workofhuman.notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
        [body.notificationId, user.userId]
      );
    } else {
      // Mark all as read
      await query(
        `UPDATE workofhuman.notifications SET is_read = true WHERE user_id = $1`,
        [user.userId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[Mark Notifications Error]:", err);
    return NextResponse.json({ error: "Failed to update notification." }, { status: 500 });
  }
}

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
      sender_id: string;
      receiver_id: string;
      content: string;
      is_read: boolean;
      created_at: string;
      sender_username: string;
      sender_name: string;
      receiver_username: string;
      receiver_name: string;
    }>(
      `SELECT m.id, m.sender_id, m.recipient_id as receiver_id, m.content, m.read as is_read, m.created_at,
              COALESCE(sp.username, 'member') as sender_username,
              COALESCE(sp.display_name, 'Creative Member') as sender_name,
              COALESCE(rp.username, 'member') as receiver_username,
              COALESCE(rp.display_name, 'Creative Member') as receiver_name
       FROM workofhuman.messages m
       LEFT JOIN workofhuman.profiles sp ON sp.user_id = m.sender_id
       LEFT JOIN workofhuman.profiles rp ON rp.user_id = m.recipient_id
       WHERE m.sender_id = $1 OR m.recipient_id = $1
       ORDER BY m.created_at DESC LIMIT 100`,
      [user.userId]
    );

    return NextResponse.json({ success: true, messages: res.rows });
  } catch (err: unknown) {
    console.error("[Get Messages Error]:", err);
    return NextResponse.json({ success: false, messages: [] });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to send messages." },
        { status: 401 }
      );
    }

    const { recipientUsername, content } = (await request.json()) as {
      recipientUsername?: string;
      content?: string;
    };

    if (!recipientUsername || !recipientUsername.trim()) {
      return NextResponse.json(
        { error: "Please specify a recipient username." },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    const cleanRecipient = recipientUsername.replace(/^[@%40]+/, "").trim().toLowerCase();

    // Look up recipient profile
    const recRes = await query<{ user_id: string }>(
      `SELECT user_id FROM workofhuman.profiles WHERE LOWER(username) = $1 LIMIT 1`,
      [cleanRecipient]
    );

    if (recRes.rows.length === 0) {
      return NextResponse.json(
        { error: `User @${cleanRecipient} not found.` },
        { status: 404 }
      );
    }

    const receiverId = recRes.rows[0].user_id;
    const conversationId = [user.userId, receiverId].sort().join(":");

    const insertRes = await query<{ id: string }>(
      `INSERT INTO workofhuman.messages (sender_id, recipient_id, conversation_id, content, read, created_at)
       VALUES ($1, $2, $3, $4, false, NOW())
       RETURNING id`,
      [user.userId, receiverId, conversationId, content.trim()]
    );

    // Notify recipient
    await query(
      `INSERT INTO workofhuman.notifications (user_id, actor_id, type, entity_id, content, read, created_at)
       VALUES ($1, $2, 'message', '/messages', $3, false, NOW())`,
      [
        receiverId,
        user.userId,
        `@${user.username} sent you a message: "${content.trim().slice(0, 50)}${content.trim().length > 50 ? "..." : ""}"`,
      ]
    ).catch(() => {});

    return NextResponse.json(
      { success: true, messageId: insertRes.rows[0]?.id },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[Send Message Error]:", err);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}

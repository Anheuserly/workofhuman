import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await query<{
      user_id: string;
      username: string;
      display_name: string | null;
      avatar_url: string | null;
      short_id: string | null;
      followers_count: number;
      verified: boolean;
    }>(`
      SELECT user_id, username, display_name, avatar_url, short_id, followers_count, verified
      FROM workofhuman.profiles
      ORDER BY followers_count DESC, created_at DESC
      LIMIT 6
    `);

    return NextResponse.json({ creators: res.rows });
  } catch (err) {
    console.error("[Creators API Error]:", err);
    return NextResponse.json({ creators: [] }, { status: 500 });
  }
}

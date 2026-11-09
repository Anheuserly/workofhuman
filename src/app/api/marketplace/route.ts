import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

const CreateListingSchema = z.object({
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(3000).optional().default(""),
  category: z.string().trim().min(2).max(100).default("digital_assets"),
  price: z.number().min(0).max(10000).default(0),
  currency: z.string().trim().length(3).default("USD"),
  fileUrl: z.string().trim().min(1),
  thumbnailUrl: z.string().trim().optional(),
  projectId: z.string().trim().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");

    let sql = `
      SELECT 
        m.id,
        m.title,
        m.description,
        m.category,
        m.price,
        m.currency,
        m.file_url as "fileUrl",
        COALESCE(m.thumbnail_url, p.thumbnail_url) as "thumbnailUrl",
        m.project_id as "projectId",
        m.status,
        m.created_at as "createdAt",
        pr.user_id as "creatorId",
        pr.username as "creatorUsername",
        pr.display_name as "creatorName",
        pr.avatar_url as "creatorAvatar",
        pr.short_id as "creatorShortId",
        pr.social_links as "creatorSocialLinks"
      FROM workofhuman.marketplace_listings m
      LEFT JOIN workofhuman.profiles pr ON m.creator_id = pr.user_id OR m.creator_id = pr.id
      LEFT JOIN workofhuman.projects p ON m.project_id = p.id
      WHERE m.status = 'active' OR m.status IS NULL
    `;

    const params: unknown[] = [];
    if (category && category !== "all") {
      params.push(category);
      sql += ` AND m.category = $${params.length}`;
    }

    if (q && q.trim()) {
      params.push(`%${q.trim()}%`);
      sql += ` AND (m.title ILIKE $${params.length} OR m.description ILIKE $${params.length} OR pr.username ILIKE $${params.length})`;
    }

    sql += ` ORDER BY m.created_at DESC LIMIT 100`;

    const res = await query(sql, params);

    return NextResponse.json({
      listings: res.rows,
    });
  } catch (err) {
    console.error("[Marketplace GET Error]:", err);
    return NextResponse.json({ error: "Failed to fetch marketplace listings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "You must be signed in to list a digital asset." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CreateListingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid listing data." },
        { status: 400 }
      );
    }

    const { title, description, category, price, currency, fileUrl, thumbnailUrl, projectId } = parsed.data;
    const id = `mkt_${crypto.randomUUID().replace(/-/g, "")}`;

    await query(
      `INSERT INTO workofhuman.marketplace_listings 
        (id, project_id, creator_id, title, description, category, price, currency, file_url, thumbnail_url, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active', NOW())`,
      [
        id,
        projectId || null,
        user.userId,
        title,
        description,
        category,
        price,
        currency.toUpperCase(),
        fileUrl,
        thumbnailUrl || null,
      ]
    );

    return NextResponse.json({
      success: true,
      listingId: id,
      message: "Digital asset listed successfully on The Work of Human Marketplace.",
    });
  } catch (err: unknown) {
    console.error("[Marketplace POST Error]:", err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

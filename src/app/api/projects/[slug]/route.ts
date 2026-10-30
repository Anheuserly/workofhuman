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
    const res = await query(
      `SELECT * FROM workofhuman.projects WHERE slug = $1 LIMIT 1`,
      [slug]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, project: res.rows[0] });
  } catch (err: unknown) {
    console.error("[Get Project Error]:", err);
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return NextResponse.json({ error: "Failed to retrieve project.", details: msg }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const projRes = await query<{ id: string; creator_id: string }>(
      `SELECT id, creator_id FROM workofhuman.projects WHERE slug = $1 LIMIT 1`,
      [slug]
    );

    if (projRes.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projRes.rows[0];
    if (project.creator_id !== user.userId && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: You are not the creator of this project." }, { status: 403 });
    }

    const body = (await request.json()) as {
      title?: string;
      description?: string;
      type?: string;
      tags?: string[];
      aiGenerated?: boolean;
      aiModel?: string;
      thumbnailUrl?: string;
    };

    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (body.title && body.title.trim()) {
      updates.push(`title = $${idx++}`);
      values.push(body.title.trim());
    }
    if (typeof body.description === "string") {
      updates.push(`description = $${idx++}`);
      values.push(body.description.trim());
    }
    if (body.type) {
      updates.push(`type = $${idx++}`);
      values.push(body.type);
    }
    if (Array.isArray(body.tags)) {
      updates.push(`tags = $${idx++}`);
      values.push(body.tags);
    }
    if (typeof body.aiGenerated === "boolean") {
      updates.push(`ai_generated = $${idx++}`);
      values.push(body.aiGenerated);
    }
    if (body.aiModel !== undefined) {
      updates.push(`ai_model = $${idx++}`);
      values.push(body.aiModel);
    }
    if (body.thumbnailUrl !== undefined) {
      updates.push(`thumbnail_url = $${idx++}`);
      values.push(body.thumbnailUrl);
    }

    updates.push(`updated_at = NOW()`);
    values.push(project.id);

    await query(
      `UPDATE workofhuman.projects SET ${updates.join(", ")} WHERE id = $${idx}`,
      values
    );

    return NextResponse.json({ success: true, message: "Project updated successfully." });
  } catch (err: unknown) {
    console.error("[Update Project Error]:", err);
    return NextResponse.json({ error: "Failed to update project." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const projRes = await query<{ id: string; creator_id: string }>(
      `SELECT id, creator_id FROM workofhuman.projects WHERE slug = $1 LIMIT 1`,
      [slug]
    );

    if (projRes.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projRes.rows[0];
    if (project.creator_id !== user.userId && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: You are not the creator of this project." }, { status: 403 });
    }

    await query(`DELETE FROM workofhuman.projects WHERE id = $1`, [project.id]);

    return NextResponse.json({ success: true, message: "Project deleted successfully." });
  } catch (err: unknown) {
    console.error("[Delete Project Error]:", err);
    return NextResponse.json({ error: "Failed to delete project." }, { status: 500 });
  }
}

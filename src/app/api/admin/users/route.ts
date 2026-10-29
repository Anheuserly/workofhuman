import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

const UpdateUserSchema = z.object({
  profileId: z.string().min(1),
  role: z.enum(["creator", "admin", "moderator"]).optional(),
  verified: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = UpdateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid update data." },
        { status: 400 }
      );
    }

    const { profileId, role, verified } = parsed.data;

    // Build dynamic update
    const updates: string[] = [];
    const values: unknown[] = [profileId];

    if (role !== undefined) {
      values.push(role);
      updates.push(`role = $${values.length}`);
    }

    if (verified !== undefined) {
      values.push(verified);
      updates.push(`verified = $${values.length}`);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    values.push(new Date().toISOString());
    updates.push(`updated_at = $${values.length}`);

    const sql = `
      UPDATE workofhuman.profiles
      SET ${updates.join(", ")}
      WHERE id = $1
      RETURNING id, username, role, verified, updated_at
    `;

    const res = await query(sql, values);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile: res.rows[0] });
  } catch (err) {
    console.error("[Admin Update User Error]:", err);
    return NextResponse.json({ error: "Failed to update creator profile." }, { status: 500 });
  }
}

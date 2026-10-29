import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { contentTypes } from "@/lib/platform";

export const dynamic = "force-dynamic";

const isValidMediaUrl = (val: string) => {
  if (!val) return true;
  return val.startsWith("/") || val.startsWith("http://") || val.startsWith("https://");
};

const UploadProjectSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters long.").max(200),
  slug: z.string().trim().max(180).optional(),
  type: z.enum(contentTypes as unknown as [string, ...string[]]),
  description: z.string().max(10000).optional(),
  thumbnailUrl: z.string().trim().refine(isValidMediaUrl, "Invalid thumbnail URL or file path.").optional().or(z.literal("")),
  mediaUrls: z.array(z.string().trim().refine(isValidMediaUrl, "Invalid media URL or file path.")).default([]),
  tags: z.array(z.string().trim().max(50)).default([]),
  aiGenerated: z.boolean().default(false),
  aiModel: z.string().trim().max(160).optional(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

function generateId(prefix: string): string {
  const uuid =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "")
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `${prefix}_${uuid}`;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to publish projects." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = UploadProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid project submission data." },
        { status: 400 }
      );
    }

    const {
      title,
      slug: customSlug,
      type,
      description,
      thumbnailUrl,
      mediaUrls,
      tags,
      aiGenerated,
      aiModel,
    } = parsed.data;

    // Generate unique slug
    let baseSlug = customSlug && customSlug.length > 0 ? slugify(customSlug) : slugify(title);
    if (!baseSlug) baseSlug = `project-${Date.now().toString(36)}`;

    // Ensure slug uniqueness
    let finalSlug = baseSlug;
    const existingSlug = await query(
      `SELECT id FROM workofhuman.projects WHERE slug = $1 LIMIT 1`,
      [finalSlug]
    );
    if (existingSlug.rows.length > 0) {
      const shortSuffix =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID().replace(/-/g, "").slice(0, 6)
          : Math.random().toString(36).substring(2, 8);
      finalSlug = `${baseSlug}-${shortSuffix}`;
    }

    const projectId = generateId("proj");
    const cleanMediaUrls = mediaUrls.filter((url) => Boolean(url && url.length > 0));
    const cleanTags = tags.filter((t) => Boolean(t && t.length > 0));

    await query(
      `INSERT INTO workofhuman.projects (
        id, title, slug, description, creator_id, creator_name,
        type, media_urls, thumbnail_url, tags, ai_generated, ai_model,
        views, likes_count, saves_count, published_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8::jsonb, $9, $10::jsonb, $11, $12,
        0, 0, 0, NOW(), NOW(), NOW()
      )`,
      [
        projectId,
        title,
        finalSlug,
        description || null,
        user.userId,
        user.displayName || user.username,
        type,
        JSON.stringify(cleanMediaUrls),
        thumbnailUrl || null,
        JSON.stringify(cleanTags),
        aiGenerated,
        aiGenerated ? aiModel || "AI Assisted" : null,
      ]
    );

    const redirectPath = `/@${user.username}/${finalSlug}`;

    return NextResponse.json(
      {
        success: true,
        slug: finalSlug,
        redirectUrl: redirectPath,
        project: {
          id: projectId,
          slug: finalSlug,
          creatorUsername: user.username,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[Project Upload Error]:", err);
    return NextResponse.json(
      { error: "Failed to publish project. Please try again." },
      { status: 500 }
    );
  }
}

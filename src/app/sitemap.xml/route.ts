import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { contentTypes } from "@/lib/platform";

export const dynamic = "force-dynamic";

interface ProjectRow {
  slug: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  updated_at: string | Date | null;
  username: string | null;
  short_id: string | null;
  display_name: string | null;
}

interface ProfileRow {
  username: string;
  short_id: string | null;
  updated_at: string | Date | null;
}

interface SitemapImage {
  loc: string;
  title: string;
  caption?: string;
}

interface SitemapItem {
  loc: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
  image?: SitemapImage;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const baseUrl = "https://theworkofhuman.com";
  const now = new Date().toISOString();

  // 1. Static Core Discovery & Trust Pages
  const staticPages: SitemapItem[] = [
    { loc: `${baseUrl}/`, priority: "1.0", changefreq: "daily", lastmod: now },
    { loc: `${baseUrl}/about`, priority: "0.9", changefreq: "weekly", lastmod: now },
    { loc: `${baseUrl}/explore`, priority: "0.9", changefreq: "daily", lastmod: now },
    { loc: `${baseUrl}/trending`, priority: "0.9", changefreq: "daily", lastmod: now },
    { loc: `${baseUrl}/ai`, priority: "0.9", changefreq: "daily", lastmod: now },
    { loc: `${baseUrl}/categories`, priority: "0.8", changefreq: "weekly", lastmod: now },
    { loc: `${baseUrl}/communities`, priority: "0.7", changefreq: "weekly", lastmod: now },
    { loc: `${baseUrl}/marketplace`, priority: "0.7", changefreq: "weekly", lastmod: now },
  ];

  // 2. Creative Disciplines & Mediums (Paintings, Books, Architecture, etc.)
  const categoryPages: SitemapItem[] = contentTypes.map((type) => ({
    loc: `${baseUrl}/categories/${type}`,
    priority: "0.8",
    changefreq: "weekly",
    lastmod: now,
  }));

  // 3. Dynamic Real Creator Profiles & Published Creations from DB
  let creatorUrls: SitemapItem[] = [];
  let projectUrls: SitemapItem[] = [];

  try {
    const profilesRes = await query<ProfileRow>(
      `SELECT username, short_id, updated_at FROM workofhuman.profiles ORDER BY created_at DESC LIMIT 500`
    );

    creatorUrls = profilesRes.rows.flatMap((p) => {
      const urls: SitemapItem[] = [];
      const lastmod = p.updated_at ? new Date(p.updated_at).toISOString() : now;
      if (p.username) {
        urls.push({
          loc: `${baseUrl}/@${p.username}`,
          priority: "0.8",
          changefreq: "daily",
          lastmod,
        });
      }
      if (p.short_id && p.short_id !== p.username) {
        urls.push({
          loc: `${baseUrl}/@${p.short_id}`,
          priority: "0.7",
          changefreq: "daily",
          lastmod,
        });
      }
      return urls;
    });

    const projectsRes = await query<ProjectRow>(`
      SELECT p.slug, p.title, p.description, p.thumbnail_url, p.updated_at, pr.username, pr.short_id, pr.display_name
      FROM workofhuman.projects p
      LEFT JOIN workofhuman.profiles pr ON p.creator_id = pr.user_id
      ORDER BY p.created_at DESC
      LIMIT 1000
    `);

    projectUrls = projectsRes.rows.map((p) => {
      const creatorHandle = p.short_id || p.username || "creator";
      const creatorName = p.display_name || p.username || "Creator";
      const lastmod = p.updated_at ? new Date(p.updated_at).toISOString() : now;
      
      let imageUrl: string | undefined = undefined;
      if (p.thumbnail_url) {
        imageUrl = p.thumbnail_url.startsWith("/") ? `${baseUrl}${p.thumbnail_url}` : p.thumbnail_url;
      }

      return {
        loc: `${baseUrl}/@${creatorHandle}/${p.slug}`,
        priority: "0.9",
        changefreq: "weekly",
        lastmod,
        image: imageUrl && p.title ? {
          loc: imageUrl,
          title: `${p.title} • by ${creatorName}`,
          caption: p.description ? p.description.slice(0, 200) : `${p.title} by ${creatorName} on The Work of Human`,
        } : undefined,
      };
    });
  } catch (err) {
    console.error("[Sitemap Generation DB Error]:", err);
  }

  const allUrls: SitemapItem[] = [...staticPages, ...categoryPages, ...creatorUrls, ...projectUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${
      u.image
        ? `
    <image:image>
      <image:loc>${u.image.loc}</image:loc>
      <image:title>${escapeXml(u.image.title)}</image:title>
      <image:caption>${escapeXml(u.image.caption || u.image.title)}</image:caption>
    </image:image>`
        : ""
    }
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = "https://theworkofhuman.com";

  let itemsXml = "";
  try {
    const res = await query<{
      title: string;
      slug: string;
      description: string;
      type: string;
      thumbnail_url?: string;
      published_at: string;
      username: string;
      short_id?: string;
      display_name?: string;
    }>(
      `SELECT p.title, p.slug, p.description, p.type, p.thumbnail_url, p.published_at,
              pr.username, pr.short_id, pr.display_name
       FROM workofhuman.projects p
       LEFT JOIN workofhuman.profiles pr ON p.creator_id = pr.user_id
       WHERE p.status = 'published'
       ORDER BY p.published_at DESC
       LIMIT 50`
    );

    itemsXml = res.rows
      .map((row) => {
        const creatorHandle = row.short_id || row.username || "creator";
        const creatorName = row.display_name || row.username || "Creator";
        const itemUrl = `${siteUrl}/@${creatorHandle}/${row.slug}`;
        const pubDate = new Date(row.published_at || Date.now()).toUTCString();

        let enclosure = "";
        if (row.thumbnail_url) {
          const fullThumb = row.thumbnail_url.startsWith("/")
            ? `${siteUrl}${row.thumbnail_url}`
            : row.thumbnail_url;
          enclosure = `<enclosure url="${escapeXml(fullThumb)}" type="image/jpeg" length="0" />`;
        }

        return `
    <item>
      <title>${escapeXml(row.title)}</title>
      <link>${escapeXml(itemUrl)}</link>
      <guid isPermaLink="true">${escapeXml(itemUrl)}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(creatorName)}</author>
      <category>${escapeXml(row.type)}</category>
      <description>${escapeXml(row.description || row.title)}</description>
      ${enclosure}
    </item>`;
      })
      .join("\n");
  } catch (err) {
    console.error("[RSS Feed Error]:", err);
  }

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Work of Human — The World&apos;s Creative Output</title>
    <link>${siteUrl}</link>
    <description>A global creative platform and digital archive for independent human and AI-made music, films, paintings, literature, and design.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

import { Client } from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = "https://theworkofhuman.com";
const now = new Date().toISOString();

const contentTypes = [
  "music",
  "songs",
  "podcasts",
  "audio_tracks",
  "digital_art",
  "paintings",
  "photography",
  "ui_ux_design",
  "graphic_design",
  "3d_models",
  "animations",
  "films",
  "short_movies",
  "cinematic_edits",
  "documentaries",
  "books",
  "stories",
  "poetry",
  "articles",
  "blogs",
  "coding_projects",
  "websites",
  "apps",
  "indie_games",
  "ai_generated_art",
  "ai_music",
  "ai_films",
  "inventions",
  "startup_ideas",
  "architecture",
  "fashion_design",
  "handmade_crafts",
  "experimental_projects",
];

function escapeXml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function generate() {
  console.log("[Sitemap Generator] Generating full sitemap with Google Image XML extension...");

  const staticPages = [
    { loc: `${baseUrl}/`, priority: "1.0", changefreq: "daily", lastmod: now },
    { loc: `${baseUrl}/about`, priority: "0.9", changefreq: "weekly", lastmod: now },
    { loc: `${baseUrl}/explore`, priority: "0.9", changefreq: "daily", lastmod: now },
    { loc: `${baseUrl}/trending`, priority: "0.9", changefreq: "daily", lastmod: now },
    { loc: `${baseUrl}/ai`, priority: "0.9", changefreq: "daily", lastmod: now },
    { loc: `${baseUrl}/categories`, priority: "0.8", changefreq: "weekly", lastmod: now },
    { loc: `${baseUrl}/communities`, priority: "0.7", changefreq: "weekly", lastmod: now },
    { loc: `${baseUrl}/marketplace`, priority: "0.7", changefreq: "weekly", lastmod: now },
  ];

  const categoryPages = contentTypes.map((type) => ({
    loc: `${baseUrl}/categories/${type}`,
    priority: "0.8",
    changefreq: "weekly",
    lastmod: now,
  }));

  let creatorUrls = [];
  let projectUrls = [];

  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:AnheVps2022@vps.amcmep.in:5432/workofhuman";

  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();

    const profilesRes = await client.query(
      `SELECT username, short_id, updated_at FROM workofhuman.profiles ORDER BY created_at DESC LIMIT 500`
    );

    creatorUrls = profilesRes.rows.flatMap((p) => {
      const urls = [];
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

    const projectsRes = await client.query(`
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

      let imageUrl = undefined;
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

    await client.end();
  } catch (err) {
    console.warn("[Sitemap Generator] DB fetch warning:", err.message);
  }

  const allUrls = [...staticPages, ...categoryPages, ...creatorUrls, ...projectUrls];

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
</urlset>
`;

  const publicSitemapPath = path.resolve(__dirname, "../public/sitemap.xml");
  fs.writeFileSync(publicSitemapPath, xml, "utf-8");
  console.log(`[Sitemap Generator] Successfully generated ${publicSitemapPath} with ${allUrls.length} entries.`);
}

generate().catch(console.error);

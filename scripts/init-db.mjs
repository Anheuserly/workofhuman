import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:AnheVps2022@vps.amcmep.in:5432/workofhuman";

console.log(`Connecting to: ${connectionString.replace(/:[^:@]+@/, ":***@")}`);

const client = new Client({ connectionString });

async function init() {
  await client.connect();
  console.log("Connected to PostgreSQL successfully.");

  // Read schema.sql
  const schemaPath = path.join(process.cwd(), "src/lib/db/schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  console.log("Creating workofhuman schema and tables...");
  await client.query(schemaSql);
  console.log("Schema and tables initialized successfully.");

  // Seed homepage settings
  console.log("Seeding homepage settings...");
  await client.query(`
    INSERT INTO workofhuman.homepage_settings (
      id, eyebrow, heading, subheading, primary_cta_label, primary_cta_href,
      secondary_cta_label, secondary_cta_href, footer_text, updated_at
    ) VALUES (
      'default',
      'Independent work across every creative discipline.',
      'A home for serious creative work.',
      'Publish portfolios, films, music, writing, apps, inventions, design studies, and transparent AI-assisted experiments in one refined space.',
      'Explore Creations',
      '/explore',
      'Start Creating',
      '/studio/upload',
      'The digital home of imagination, originality, expression, and innovation.',
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      eyebrow = EXCLUDED.eyebrow,
      heading = EXCLUDED.heading,
      subheading = EXCLUDED.subheading,
      primary_cta_label = EXCLUDED.primary_cta_label,
      primary_cta_href = EXCLUDED.primary_cta_href,
      secondary_cta_label = EXCLUDED.secondary_cta_label,
      secondary_cta_href = EXCLUDED.secondary_cta_href,
      footer_text = EXCLUDED.footer_text,
      updated_at = NOW();
  `);

  // Seed Profiles
  console.log("Seeding creator profiles...");
  const profiles = [
    {
      id: "prof_workofhuman_studio",
      userId: "creator_workofhuman_studio",
      username: "workofhumanstudio",
      displayName: "WorkOfHuman Studio",
      bio: "Cinematic storytelling, archive films, and visual essays about modern creativity.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80",
      verified: true,
      categories: ["films", "cinematic_edits", "documentaries"],
      followersCount: 182400,
      viewsCount: 4200000,
    },
    {
      id: "prof_workofhuman_lab",
      userId: "creator_workofhuman_lab",
      username: "workofhumanlab",
      displayName: "WorkOfHuman Lab",
      bio: "Transparent AI experiments across music, image, film, and creative tools.",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1600&q=80",
      verified: true,
      categories: ["ai_generated_art", "ai_music", "ai_films"],
      followersCount: 146800,
      viewsCount: 3500000,
    },
    {
      id: "prof_global_makers",
      userId: "creator_global_makers",
      username: "globalmakers",
      displayName: "Global Makers",
      bio: "Inventions, handmade objects, craft systems, and practical imagination.",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
      verified: false,
      categories: ["inventions", "handmade_crafts", "startup_ideas"],
      followersCount: 98500,
      viewsCount: 1800000,
    },
    {
      id: "prof_design_index",
      userId: "creator_design_index",
      username: "designindex",
      displayName: "Design Index",
      bio: "Interface systems, product case studies, and visual design research.",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80",
      verified: true,
      categories: ["ui_ux_design", "apps", "websites"],
      followersCount: 96700,
      viewsCount: 1600000,
    },
    {
      id: "prof_sound_archive",
      userId: "creator_sound_archive",
      username: "soundarchive",
      displayName: "Sound Archive",
      bio: "Music releases, podcasts, stems, and production journals.",
      avatarUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1600&q=80",
      verified: true,
      categories: ["music", "podcasts", "audio_tracks"],
      followersCount: 112300,
      viewsCount: 2100000,
    },
    {
      id: "prof_playtest_lab",
      userId: "creator_playtest_lab",
      username: "playtestlab",
      displayName: "Playtest Lab",
      bio: "Indie games, prototypes, mechanics, and player feedback loops.",
      avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80",
      verified: false,
      categories: ["indie_games", "animations", "3d_models"],
      followersCount: 73100,
      viewsCount: 980000,
    },
    {
      id: "prof_lens_collective",
      userId: "creator_lens_collective",
      username: "lenscollective",
      displayName: "Lens Collective",
      bio: "Photography sets, contact sheets, exhibitions, and visual essays.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1600&q=80",
      verified: true,
      categories: ["photography", "digital_art", "articles"],
      followersCount: 104900,
      viewsCount: 1900000,
    },
  ];

  for (const p of profiles) {
    await client.query(`
      INSERT INTO workofhuman.profiles (
        id, user_id, username, display_name, bio, avatar_url, banner_url,
        verified, categories, followers_count, views_count, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        bio = EXCLUDED.bio,
        avatar_url = EXCLUDED.avatar_url,
        banner_url = EXCLUDED.banner_url,
        verified = EXCLUDED.verified,
        categories = EXCLUDED.categories,
        followers_count = EXCLUDED.followers_count,
        views_count = EXCLUDED.views_count,
        updated_at = NOW();
    `, [
      p.id, p.userId, p.username, p.displayName, p.bio, p.avatarUrl, p.bannerUrl,
      p.verified, JSON.stringify(p.categories), p.followersCount, p.viewsCount
    ]);
  }

  // Seed Projects
  console.log("Seeding projects...");
  const projects = [
    {
      id: "proj_cinematic_human_archive",
      title: "Cinematic Human Archive",
      slug: "cinematic-human-archive",
      description: "A short film and process journal tracing the handmade details behind contemporary creative work.",
      creatorId: "creator_workofhuman_studio",
      creatorName: "WorkOfHuman Studio",
      type: "films",
      mediaUrls: ["https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80"],
      thumbnailUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
      tags: ["film", "archive", "process"],
      aiGenerated: false,
      aiModel: null,
      views: 920000,
      likesCount: 48100,
      savesCount: 12400,
    },
    {
      id: "proj_ai_sound_atlas",
      title: "AI Sound Atlas",
      slug: "ai-sound-atlas",
      description: "A labeled AI music experiment with stems, prompts, cover art, and release notes.",
      creatorId: "creator_workofhuman_lab",
      creatorName: "WorkOfHuman Lab",
      type: "ai_music",
      mediaUrls: ["https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1600&q=80"],
      thumbnailUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
      tags: ["ai", "music", "sound"],
      aiGenerated: true,
      aiModel: "WorkOfHuman experimental audio pipeline",
      views: 760000,
      likesCount: 39200,
      savesCount: 10100,
    },
    {
      id: "proj_future_craft_index",
      title: "Future Craft Index",
      slug: "future-craft-index",
      description: "A maker portfolio documenting materials, sketches, prototypes, and field notes for useful objects.",
      creatorId: "creator_global_makers",
      creatorName: "Global Makers",
      type: "inventions",
      mediaUrls: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80"],
      thumbnailUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      tags: ["craft", "prototype", "invention"],
      aiGenerated: false,
      aiModel: null,
      views: 510000,
      likesCount: 28400,
      savesCount: 8800,
    },
    {
      id: "proj_open_imagination_os",
      title: "Open Imagination OS",
      slug: "open-imagination-os",
      description: "An app concept for capturing sketches, writing, code snippets, sound notes, and AI generations in one canvas.",
      creatorId: "creator_workofhuman_lab",
      creatorName: "WorkOfHuman Lab",
      type: "apps",
      mediaUrls: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80"],
      thumbnailUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      tags: ["app", "workflow", "creative-tools"],
      aiGenerated: true,
      aiModel: "AI-assisted design and captioning",
      views: 448000,
      likesCount: 21100,
      savesCount: 7900,
    },
    {
      id: "proj_interface_study_04",
      title: "Interface Study 04",
      slug: "interface-study-04",
      description: "A product design case study with screens, interaction notes, and a compact design system.",
      creatorId: "creator_design_index",
      creatorName: "Design Index",
      type: "ui_ux_design",
      mediaUrls: ["https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1600&q=80"],
      thumbnailUrl: "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80",
      tags: ["product", "design", "systems"],
      aiGenerated: false,
      aiModel: null,
      views: 9640,
      likesCount: 730,
      savesCount: 310,
    },
    {
      id: "proj_midnight_signal_ep",
      title: "Midnight Signal EP",
      slug: "midnight-signal-ep",
      description: "A four-track electronic release with cover art, stems, lyrics, and production notes.",
      creatorId: "creator_sound_archive",
      creatorName: "Sound Archive",
      type: "music",
      mediaUrls: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1600&q=80"],
      thumbnailUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
      tags: ["music", "electronic", "album"],
      aiGenerated: false,
      aiModel: null,
      views: 11290,
      likesCount: 860,
      savesCount: 340,
    },
    {
      id: "proj_tiny_planet_builder",
      title: "Tiny Planet Builder",
      slug: "tiny-planet-builder",
      description: "A playable indie game prototype with character sheets, mechanics, dev logs, and pixel art.",
      creatorId: "creator_playtest_lab",
      creatorName: "Playtest Lab",
      type: "indie_games",
      mediaUrls: ["https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80"],
      thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
      tags: ["game", "prototype", "pixel"],
      aiGenerated: false,
      aiModel: null,
      views: 18940,
      likesCount: 1640,
      savesCount: 720,
    },
    {
      id: "proj_street_light_photo_set",
      title: "Street Light Photo Set",
      slug: "street-light-photo-set",
      description: "A photography series with location notes, contact sheets, edits, and exhibition sequencing.",
      creatorId: "creator_lens_collective",
      creatorName: "Lens Collective",
      type: "photography",
      mediaUrls: ["https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1600&q=80"],
      thumbnailUrl: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1200&q=80",
      tags: ["photography", "street", "gallery"],
      aiGenerated: false,
      aiModel: null,
      views: 12110,
      likesCount: 970,
      savesCount: 430,
    },
    {
      id: "proj_the_city_that_remembered",
      title: "The City That Remembered",
      slug: "the-city-that-remembered",
      description: "A serialized short story collection with character notes, concept sketches, and reader discussion.",
      creatorId: "creator_workofhuman_studio",
      creatorName: "WorkOfHuman Studio",
      type: "stories",
      mediaUrls: ["https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1600&q=80"],
      thumbnailUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1200&q=80",
      tags: ["fiction", "worldbuilding", "chapters"],
      aiGenerated: false,
      aiModel: null,
      views: 7430,
      likesCount: 540,
      savesCount: 260,
    },
  ];

  for (const proj of projects) {
    await client.query(`
      INSERT INTO workofhuman.projects (
        id, title, slug, description, creator_id, creator_name, type,
        media_urls, thumbnail_url, tags, ai_generated, ai_model,
        views, likes_count, saves_count, published_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        creator_id = EXCLUDED.creator_id,
        creator_name = EXCLUDED.creator_name,
        type = EXCLUDED.type,
        media_urls = EXCLUDED.media_urls,
        thumbnail_url = EXCLUDED.thumbnail_url,
        tags = EXCLUDED.tags,
        ai_generated = EXCLUDED.ai_generated,
        ai_model = EXCLUDED.ai_model,
        views = EXCLUDED.views,
        likes_count = EXCLUDED.likes_count,
        saves_count = EXCLUDED.saves_count,
        updated_at = NOW();
    `, [
      proj.id, proj.title, proj.slug, proj.description, proj.creatorId, proj.creatorName,
      proj.type, JSON.stringify(proj.mediaUrls), proj.thumbnailUrl, JSON.stringify(proj.tags),
      proj.aiGenerated, proj.aiModel, proj.views, proj.likesCount, proj.savesCount
    ]);
  }

  // Seed Communities
  console.log("Seeding communities...");
  const communities = [
    {
      id: "comm_indie_filmmakers",
      name: "Indie Filmmakers",
      slug: "indie-filmmakers",
      description: "Short films, cinematic edits, documentaries, and process breakdowns.",
      avatarUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=400&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
      ownerId: "creator_workofhuman_studio",
      memberCount: 42000,
      isPrivate: false,
      featured: true,
    },
    {
      id: "comm_ai_experimenters",
      name: "AI Experimenters",
      slug: "ai-experimenters",
      description: "Transparent AI art, music, film, writing, and creative tooling.",
      avatarUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
      ownerId: "creator_workofhuman_lab",
      memberCount: 58000,
      isPrivate: false,
      featured: true,
    },
    {
      id: "comm_open_source_makers",
      name: "Open Source Makers",
      slug: "open-source-makers",
      description: "Apps, code projects, indie games, websites, and creative dev logs.",
      avatarUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      ownerId: "creator_workofhuman_lab",
      memberCount: 36000,
      isPrivate: false,
      featured: true,
    },
  ];

  for (const comm of communities) {
    await client.query(`
      INSERT INTO workofhuman.communities (
        id, name, slug, description, avatar_url, banner_url, owner_id,
        member_count, is_private, featured, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        avatar_url = EXCLUDED.avatar_url,
        banner_url = EXCLUDED.banner_url,
        member_count = EXCLUDED.member_count,
        featured = EXCLUDED.featured,
        updated_at = NOW();
    `, [
      comm.id, comm.name, comm.slug, comm.description, comm.avatarUrl, comm.bannerUrl,
      comm.ownerId, comm.memberCount, comm.isPrivate, comm.featured
    ]);
  }

  // Seed Trending Cache
  console.log("Seeding trending cache...");
  await client.query(`DELETE FROM workofhuman.trending_cache WHERE period = 'week';`);
  for (let i = 0; i < projects.length; i++) {
    const proj = projects[i];
    await client.query(`
      INSERT INTO workofhuman.trending_cache (
        id, period, project_id, score, rank, updated_at
      ) VALUES ($1, 'week', $2, $3, $4, NOW())
      ON CONFLICT (period, rank) DO UPDATE SET
        project_id = EXCLUDED.project_id,
        score = EXCLUDED.score,
        updated_at = NOW();
    `, [`trend_week_${i + 1}`, proj.slug, Number((98 - i * 4.7).toFixed(1)), i + 1]);
  }

  console.log("Database initialized and seeded successfully!");
  await client.end();
}

init().catch((err) => {
  console.error("Initialization error:", err);
  process.exit(1);
});

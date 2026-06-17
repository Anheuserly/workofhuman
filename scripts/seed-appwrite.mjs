import fs from "node:fs";
import path from "node:path";
import { Client, Databases, ID } from "node-appwrite";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] ||= value;
  }
}

loadEnvFile(path.join(process.cwd(), ".env"));
loadEnvFile(path.join(process.cwd(), ".env.local"));

const endpoint = process.env.APPWRITE_ENDPOINT;
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || "main_db";

if (!endpoint || !projectId || !apiKey) {
  console.error("Missing APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, or APPWRITE_API_KEY.");
  process.exit(1);
}

const collections = {
  homepage: process.env.APPWRITE_HOMEPAGE_COLLECTION_ID || "homepage",
  profiles: process.env.APPWRITE_PROFILES_COLLECTION_ID || "profiles",
  projects: process.env.APPWRITE_PROJECTS_COLLECTION_ID || "projects",
  trendingCache: process.env.APPWRITE_TRENDING_CACHE_COLLECTION_ID || "trending_cache",
  communities: process.env.APPWRITE_COMMUNITIES_COLLECTION_ID || "communities",
  communityMembers: process.env.APPWRITE_COMMUNITY_MEMBERS_COLLECTION_ID || "community_members",
};

const now = new Date().toISOString();
const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);

const profiles = [
  {
    userId: "creator_workofhuman_studio",
    username: "workofhumanstudio",
    displayName: "WorkOfHuman Studio",
    bio: "Cinematic storytelling, archive films, and visual essays about modern creativity.",
    avatarUrl: "",
    bannerUrl: "",
    verified: true,
    categories: ["films", "cinematic_edits", "documentaries"],
    socialLinks: "{}",
    followersCount: 182400,
    viewsCount: 4200000,
    createdAt: now,
    updatedAt: now,
  },
  {
    userId: "creator_workofhuman_lab",
    username: "workofhumanlab",
    displayName: "WorkOfHuman Lab",
    bio: "Transparent AI experiments across music, image, film, and creative tools.",
    avatarUrl: "",
    bannerUrl: "",
    verified: true,
    categories: ["ai_generated_art", "ai_music", "ai_films"],
    socialLinks: "{}",
    followersCount: 146800,
    viewsCount: 3500000,
    createdAt: now,
    updatedAt: now,
  },
  {
    userId: "creator_global_makers",
    username: "globalmakers",
    displayName: "Global Makers",
    bio: "Inventions, handmade objects, craft systems, and practical imagination.",
    avatarUrl: "",
    bannerUrl: "",
    verified: false,
    categories: ["inventions", "handmade_crafts", "startup_ideas"],
    socialLinks: "{}",
    followersCount: 98500,
    viewsCount: 1800000,
    createdAt: now,
    updatedAt: now,
  },
];

const projects = [
  {
    title: "Cinematic Human Archive",
    slug: "cinematic-human-archive",
    description: "A short film and process journal tracing the handmade details behind contemporary creative work.",
    creatorId: profiles[0].userId,
    creatorName: profiles[0].displayName,
    type: "films",
    mediaUrls: ["https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80"],
    thumbnailUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
    tags: ["film", "archive", "process"],
    aiGenerated: false,
    aiModel: "",
    views: 920000,
    likesCount: 48100,
    savesCount: 12400,
    createdAt: now,
    publishedAt: now,
  },
  {
    title: "AI Sound Atlas",
    slug: "ai-sound-atlas",
    description: "A labeled AI music experiment with stems, prompts, cover art, and release notes.",
    creatorId: profiles[1].userId,
    creatorName: profiles[1].displayName,
    type: "ai_music",
    mediaUrls: ["https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1600&q=80"],
    thumbnailUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
    tags: ["ai", "music", "sound"],
    aiGenerated: true,
    aiModel: "WorkOfHuman experimental audio pipeline",
    views: 760000,
    likesCount: 39200,
    savesCount: 10100,
    createdAt: now,
    publishedAt: now,
  },
  {
    title: "Future Craft Index",
    slug: "future-craft-index",
    description: "A maker portfolio documenting materials, sketches, prototypes, and field notes for useful objects.",
    creatorId: profiles[2].userId,
    creatorName: profiles[2].displayName,
    type: "inventions",
    mediaUrls: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80"],
    thumbnailUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    tags: ["craft", "prototype", "invention"],
    aiGenerated: false,
    aiModel: "",
    views: 510000,
    likesCount: 28400,
    savesCount: 8800,
    createdAt: now,
    publishedAt: now,
  },
  {
    title: "Open Imagination OS",
    slug: "open-imagination-os",
    description: "An app concept for capturing sketches, writing, code snippets, sound notes, and AI generations in one canvas.",
    creatorId: profiles[1].userId,
    creatorName: profiles[1].displayName,
    type: "apps",
    mediaUrls: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80"],
    thumbnailUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    tags: ["app", "workflow", "creative-tools"],
    aiGenerated: true,
    aiModel: "AI-assisted design and captioning",
    views: 448000,
    likesCount: 21100,
    savesCount: 7900,
    createdAt: now,
    publishedAt: now,
  },
];

const communities = [
  {
    name: "Indie Filmmakers",
    slug: "indie-filmmakers",
    description: "Short films, cinematic edits, documentaries, and process breakdowns.",
    avatarUrl: "",
    bannerUrl: "",
    ownerId: profiles[0].userId,
    memberCount: 42000,
    isPrivate: false,
    featured: true,
    createdAt: now,
  },
  {
    name: "AI Experimenters",
    slug: "ai-experimenters",
    description: "Transparent AI art, music, film, writing, and creative tooling.",
    avatarUrl: "",
    bannerUrl: "",
    ownerId: profiles[1].userId,
    memberCount: 58000,
    isPrivate: false,
    featured: true,
    createdAt: now,
  },
  {
    name: "Open Source Makers",
    slug: "open-source-makers",
    description: "Apps, code projects, indie games, websites, and creative dev logs.",
    avatarUrl: "",
    bannerUrl: "",
    ownerId: profiles[1].userId,
    memberCount: 36000,
    isPrivate: false,
    featured: true,
    createdAt: now,
  },
];

profiles.push(
  {
    userId: "creator_design_index",
    username: "designindex",
    displayName: "Design Index",
    bio: "Interface systems, product case studies, and visual design research.",
    avatarUrl: "",
    bannerUrl: "",
    verified: true,
    categories: ["ui_ux_design", "apps", "websites"],
    socialLinks: "{}",
    followersCount: 96700,
    viewsCount: 1600000,
    createdAt: now,
    updatedAt: now,
  },
  {
    userId: "creator_sound_archive",
    username: "soundarchive",
    displayName: "Sound Archive",
    bio: "Music releases, podcasts, stems, and production journals.",
    avatarUrl: "",
    bannerUrl: "",
    verified: true,
    categories: ["music", "podcasts", "audio_tracks"],
    socialLinks: "{}",
    followersCount: 112300,
    viewsCount: 2100000,
    createdAt: now,
    updatedAt: now,
  },
  {
    userId: "creator_playtest_lab",
    username: "playtestlab",
    displayName: "Playtest Lab",
    bio: "Indie games, prototypes, mechanics, and player feedback loops.",
    avatarUrl: "",
    bannerUrl: "",
    verified: false,
    categories: ["indie_games", "animations", "3d_models"],
    socialLinks: "{}",
    followersCount: 73100,
    viewsCount: 980000,
    createdAt: now,
    updatedAt: now,
  },
  {
    userId: "creator_lens_collective",
    username: "lenscollective",
    displayName: "Lens Collective",
    bio: "Photography sets, contact sheets, exhibitions, and visual essays.",
    avatarUrl: "",
    bannerUrl: "",
    verified: true,
    categories: ["photography", "digital_art", "articles"],
    socialLinks: "{}",
    followersCount: 104900,
    viewsCount: 1900000,
    createdAt: now,
    updatedAt: now,
  },
);

projects.push(
  {
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
    aiModel: "",
    views: 9640,
    likesCount: 730,
    savesCount: 310,
    createdAt: now,
    publishedAt: now,
  },
  {
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
    aiModel: "",
    views: 11290,
    likesCount: 860,
    savesCount: 340,
    createdAt: now,
    publishedAt: now,
  },
  {
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
    aiModel: "",
    views: 18940,
    likesCount: 1640,
    savesCount: 720,
    createdAt: now,
    publishedAt: now,
  },
  {
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
    aiModel: "",
    views: 12110,
    likesCount: 970,
    savesCount: 430,
    createdAt: now,
    publishedAt: now,
  },
  {
    title: "AI Short Film Frames",
    slug: "ai-short-film-frames",
    description: "A labeled AI film experiment showing storyboards, generated clips, edit decisions, and final sequence.",
    creatorId: "creator_workofhuman_lab",
    creatorName: "WorkOfHuman Lab",
    type: "ai_films",
    mediaUrls: ["https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80"],
    thumbnailUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
    tags: ["ai", "film", "storyboard"],
    aiGenerated: true,
    aiModel: "Text-to-video concept pipeline",
    views: 20850,
    likesCount: 1880,
    savesCount: 910,
    createdAt: now,
    publishedAt: now,
  },
);

communities.push(
  {
    name: "Music Producers",
    slug: "music-producers",
    description: "Songs, stems, album art, sample packs, and production breakdowns.",
    avatarUrl: "",
    bannerUrl: "",
    ownerId: "creator_sound_archive",
    memberCount: 51400,
    isPrivate: false,
    featured: true,
    createdAt: now,
  },
  {
    name: "Game Makers",
    slug: "game-makers",
    description: "Playable prototypes, dev logs, worldbuilding, mechanics, and art direction.",
    avatarUrl: "",
    bannerUrl: "",
    ownerId: "creator_playtest_lab",
    memberCount: 46200,
    isPrivate: false,
    featured: true,
    createdAt: now,
  },
  {
    name: "Writers Circle",
    slug: "writers-circle",
    description: "Stories, poetry, essays, drafts, critique, and publishing notes.",
    avatarUrl: "",
    bannerUrl: "",
    ownerId: profiles[0].userId,
    memberCount: 33700,
    isPrivate: false,
    featured: true,
    createdAt: now,
  },
);

const seed = {
  [collections.homepage]: [
    {
      eyebrow: "Human originals, AI creations, and everything imagination can build.",
      heading: "The World's Creative Output - Human & AI",
      subheading: "Share music, films, art, ideas, stories, inventions, designs, and everything imagination can create.",
      primaryCtaLabel: "Explore Creations",
      primaryCtaHref: "/explore",
      secondaryCtaLabel: "Start Creating",
      secondaryCtaHref: "/studio/upload",
      footerText: "The digital home of imagination, originality, expression, and innovation.",
    },
  ],
  [collections.profiles]: profiles,
  [collections.projects]: projects,
  [collections.communities]: communities,
  [collections.trendingCache]: projects.map((project, index) => ({
    period: "week",
    projectId: project.slug,
    score: Number((100 - index * 11.5).toFixed(2)),
    rank: index + 1,
    updatedAt: now,
  })),
  [collections.communityMembers]: communities.map((community, index) => ({
    communityId: community.slug,
    userId: profiles[index % profiles.length].userId,
    role: "admin",
    joinedAt: now,
  })),
};

for (const [collectionId, documents] of Object.entries(seed)) {
  for (const document of documents) {
    await databases.createDocument(databaseId, collectionId, ID.unique(), document);
  }
  console.log(`Seeded ${documents.length} documents into ${collectionId}.`);
}

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
const databaseId = process.env.APPWRITE_DATABASE_ID || "workofhuman";

if (!endpoint || !projectId || !apiKey) {
  console.error("Missing APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, or APPWRITE_API_KEY.");
  process.exit(1);
}

const collections = {
  homepage: process.env.APPWRITE_HOMEPAGE_COLLECTION_ID || "homepage",
  creations: process.env.APPWRITE_CREATIONS_COLLECTION_ID || "creations",
  creators: process.env.APPWRITE_CREATORS_COLLECTION_ID || "creators",
  categories: process.env.APPWRITE_CATEGORIES_COLLECTION_ID || "categories",
  communities: process.env.APPWRITE_COMMUNITIES_COLLECTION_ID || "communities",
  feedItems: process.env.APPWRITE_FEED_ITEMS_COLLECTION_ID || "feed_items",
  aiSpotlights: process.env.APPWRITE_AI_SPOTLIGHTS_COLLECTION_ID || "ai_spotlights",
  metrics: process.env.APPWRITE_METRICS_COLLECTION_ID || "metrics",
};

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);

const visible = { isVisible: true };

const seed = {
  [collections.homepage]: [
    {
      ...visible,
      sortOrder: 1,
      eyebrow: "Human originals, AI creations, and everything imagination can build.",
      heading: "The World's Creative Output - Human & AI",
      subheading:
        "Share music, films, art, ideas, stories, inventions, designs, and everything imagination can create.",
      primaryCtaLabel: "Explore Creations",
      primaryCtaHref: "#explore",
      secondaryCtaLabel: "Start Creating",
      secondaryCtaHref: "/upload",
      footerText: "The digital home of imagination, originality, expression, and innovation.",
    },
  ],
  [collections.metrics]: [
    { ...visible, sortOrder: 1, value: "46", label: "creative mediums" },
    { ...visible, sortOrder: 2, value: "Global", label: "creator discovery" },
    { ...visible, sortOrder: 3, value: "AI", label: "transparent publishing" },
  ],
  [collections.creations]: [
    {
      ...visible,
      sortOrder: 1,
      featured: true,
      title: "Cinematic Human Archive",
      creatorName: "WorkOfHuman Studio",
      contentType: "Featured film",
      statLabel: "Editor pick",
      thumbnailUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
      accentColor: "#7C3AED",
    },
    {
      ...visible,
      sortOrder: 2,
      featured: true,
      title: "AI Sound Atlas",
      creatorName: "WorkOfHuman Lab",
      contentType: "AI music",
      statLabel: "New release",
      thumbnailUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
      accentColor: "#06B6D4",
    },
    {
      ...visible,
      sortOrder: 3,
      featured: true,
      title: "Future Craft Index",
      creatorName: "Global Makers",
      contentType: "Invention",
      statLabel: "Rising",
      thumbnailUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      accentColor: "#F43F5E",
    },
    {
      ...visible,
      sortOrder: 4,
      featured: true,
      title: "Open Imagination OS",
      creatorName: "Creator Systems",
      contentType: "Coding project",
      statLabel: "Open source",
      thumbnailUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      accentColor: "#FFFFFF",
    },
  ],
  [collections.creators]: [
    { ...visible, sortOrder: 1, displayName: "WorkOfHuman Studio", category: "Cinematic storytelling", statLabel: "Verified creator", avatarUrl: "", verified: true },
    { ...visible, sortOrder: 2, displayName: "WorkOfHuman Lab", category: "AI experiments", statLabel: "AI-labeled creator", avatarUrl: "", verified: true },
    { ...visible, sortOrder: 3, displayName: "Global Makers", category: "Inventions and crafts", statLabel: "Featured community", avatarUrl: "", verified: false },
    { ...visible, sortOrder: 4, displayName: "Creator Systems", category: "Apps and tools", statLabel: "Open source", avatarUrl: "", verified: false },
  ],
  [collections.categories]: [
    "music",
    "films",
    "digital-art",
    "writing",
    "apps",
    "games",
    "fashion",
    "architecture",
    "inventions",
    "ai-experiments",
    "photography",
    "crafts",
  ].map((slug, index) => ({
    ...visible,
    sortOrder: index + 1,
    slug,
    name: slug
      .split("-")
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" "),
  })),
  [collections.communities]: [
    { ...visible, sortOrder: 1, name: "Indie Filmmakers", slug: "indie-filmmakers", memberCountLabel: "Cinema room" },
    { ...visible, sortOrder: 2, name: "AI Experimenters", slug: "ai-experimenters", memberCountLabel: "AI-labeled" },
    { ...visible, sortOrder: 3, name: "Open Source Makers", slug: "open-source-makers", memberCountLabel: "Build room" },
    { ...visible, sortOrder: 4, name: "Poetry Rooms", slug: "poetry-rooms", memberCountLabel: "Writing room" },
    { ...visible, sortOrder: 5, name: "Future Fashion", slug: "future-fashion", memberCountLabel: "Design room" },
  ],
  [collections.aiSpotlights]: [
    { ...visible, sortOrder: 1, title: "AI content tagging", body: "Label AI-assisted and fully AI-generated creations with transparent metadata." },
    { ...visible, sortOrder: 2, title: "AI discovery", body: "Personalize search, recommendations, and category exploration around creator intent." },
    { ...visible, sortOrder: 3, title: "Generated thumbnails", body: "Prepare adaptive visuals for films, tracks, stories, apps, and experiments." },
    { ...visible, sortOrder: 4, title: "Creator assistant", body: "Help creators caption, describe, and package original work for discovery." },
  ],
  [collections.feedItems]: [
    { ...visible, sortOrder: 1, contentType: "Film", body: "A creator published a cinematic world as a short film, gallery, and process journal." },
    { ...visible, sortOrder: 2, contentType: "Music", body: "A composer released stems, lyrics, artwork, and an AI-assisted visualizer in one project." },
    { ...visible, sortOrder: 3, contentType: "App", body: "A developer shared an indie tool with source notes, screenshots, and roadmap updates." },
    { ...visible, sortOrder: 4, contentType: "Writing", body: "A writer launched a living story collection with community discussion and saved chapters." },
  ],
};

for (const [collectionId, documents] of Object.entries(seed)) {
  for (const document of documents) {
    await databases.createDocument(databaseId, collectionId, ID.unique(), document);
  }
  console.log(`Seeded ${documents.length} documents into ${collectionId}.`);
}

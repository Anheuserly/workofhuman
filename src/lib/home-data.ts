import { Models, Query } from "node-appwrite";
import { appwriteConfig, appwriteQueries, getDatabases, isAppwriteConfigured, missingAppwriteEnv } from "./appwrite";
import { contentTypes } from "./platform";

export type Project = {
  title: string;
  slug: string;
  description: string;
  creatorId: string;
  creatorName?: string;
  type: string;
  mediaUrls?: string[];
  thumbnailUrl?: string;
  tags?: string[];
  aiGenerated?: boolean;
  aiModel?: string;
  views?: number;
  likesCount?: number;
  savesCount?: number;
  publishedAt?: string;
};

export type Profile = {
  userId: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  verified?: boolean;
  categories?: string[];
  followersCount?: number;
  viewsCount?: number;
};

export type Community = {
  name: string;
  slug: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  memberCount?: number;
  featured?: boolean;
};

export type TrendingItem = {
  period: "day" | "week" | "month";
  projectId: string;
  score: number;
  rank: number;
};

export type HomeSettings = {
  eyebrow: string;
  heading: string;
  subheading: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  footerText: string;
};

export type HomeData =
  | { status: "missing-config"; missingEnv: string[] }
  | { status: "error"; message: string }
  | {
      status: "ready";
      settings: HomeSettings | null;
      projects: Project[];
      aiProjects: Project[];
      creators: Profile[];
      communities: Community[];
      trending: TrendingItem[];
      categories: string[];
    };

export const defaultHomeSettings: HomeSettings = {
  eyebrow: "Independent work across every creative discipline.",
  heading: "A home for serious creative work.",
  subheading: "Publish portfolios, films, music, writing, apps, inventions, design studies, and transparent AI-assisted experiments in one refined space.",
  primaryCtaLabel: "Explore Creations",
  primaryCtaHref: "/explore",
  secondaryCtaLabel: "Start Creating",
  secondaryCtaHref: "/studio/upload",
  footerText: "The digital home of imagination, originality, expression, and innovation.",
};

export function getStarterHomeData(): Extract<HomeData, { status: "ready" }> {
  const projects: Project[] = [
    {
      title: "Field Notes in Motion",
      slug: "field-notes-in-motion",
      description: "A documentary-style visual journal pairing short film, photography, and production notes.",
      creatorId: "creator_workofhuman_studio",
      creatorName: "WorkOfHuman Studio",
      type: "films",
      thumbnailUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
      tags: ["film", "journal", "process"],
      aiGenerated: false,
      views: 12840,
      likesCount: 920,
      savesCount: 220,
    },
    {
      title: "Midnight Signal EP",
      slug: "midnight-signal-ep",
      description: "A four-track electronic release with cover art, stems, lyrics, and production notes.",
      creatorId: "creator_sound_archive",
      creatorName: "Sound Archive",
      type: "music",
      thumbnailUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
      tags: ["music", "electronic", "album"],
      aiGenerated: false,
      views: 11290,
      likesCount: 860,
      savesCount: 340,
    },
    {
      title: "The City That Remembered",
      slug: "the-city-that-remembered",
      description: "A serialized short story collection with character notes, concept sketches, and reader discussion.",
      creatorId: "creator_page_foundry",
      creatorName: "Page Foundry",
      type: "stories",
      thumbnailUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1200&q=80",
      tags: ["fiction", "worldbuilding", "chapters"],
      aiGenerated: false,
      views: 7430,
      likesCount: 540,
      savesCount: 260,
    },
    {
      title: "Interface Study 04",
      slug: "interface-study-04",
      description: "A product design case study with screens, interaction notes, and a compact design system.",
      creatorId: "creator_design_index",
      creatorName: "Design Index",
      type: "ui_ux_design",
      thumbnailUrl: "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80",
      tags: ["product", "design", "systems"],
      aiGenerated: false,
      views: 9640,
      likesCount: 730,
      savesCount: 310,
    },
    {
      title: "Pocket Finance App",
      slug: "pocket-finance-app",
      description: "An indie app case study covering product thinking, screens, onboarding, and launch metrics.",
      creatorId: "creator_indie_tools",
      creatorName: "Indie Tools Club",
      type: "apps",
      thumbnailUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80",
      tags: ["app", "startup", "finance"],
      aiGenerated: false,
      views: 13520,
      likesCount: 1010,
      savesCount: 490,
    },
    {
      title: "Tiny Planet Builder",
      slug: "tiny-planet-builder",
      description: "A playable indie game prototype with character sheets, mechanics, dev logs, and pixel art.",
      creatorId: "creator_playtest_lab",
      creatorName: "Playtest Lab",
      type: "indie_games",
      thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
      tags: ["game", "prototype", "pixel"],
      aiGenerated: false,
      views: 18940,
      likesCount: 1640,
      savesCount: 720,
    },
    {
      title: "Synthetic Choir Notes",
      slug: "synthetic-choir-notes",
      description: "An AI-labeled audio experiment with stems, prompt history, and a release journal.",
      creatorId: "creator_workofhuman_lab",
      creatorName: "WorkOfHuman Lab",
      type: "ai_music",
      thumbnailUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
      tags: ["audio", "ai", "stems"],
      aiGenerated: true,
      aiModel: "AI-assisted composition workflow",
      views: 14820,
      likesCount: 1180,
      savesCount: 450,
    },
    {
      title: "Generated Botanical Atlas",
      slug: "generated-botanical-atlas",
      description: "A transparent AI image series with prompt notes, model disclosure, edits, and final gallery prints.",
      creatorId: "creator_workofhuman_lab",
      creatorName: "WorkOfHuman Lab",
      type: "ai_generated_art",
      thumbnailUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
      tags: ["ai", "gallery", "botanical"],
      aiGenerated: true,
      aiModel: "Image generation plus human curation",
      views: 15660,
      likesCount: 1330,
      savesCount: 610,
    },
    {
      title: "Low Carbon Home Study",
      slug: "low-carbon-home-study",
      description: "Architecture concepts with floor plans, material choices, sunlight studies, and build notes.",
      creatorId: "creator_spatial_notes",
      creatorName: "Spatial Notes",
      type: "architecture",
      thumbnailUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      tags: ["architecture", "housing", "materials"],
      aiGenerated: false,
      views: 10240,
      likesCount: 780,
      savesCount: 390,
    },
    {
      title: "Quiet Uniform System",
      slug: "quiet-uniform-system",
      description: "A fashion design capsule with sketches, fabric references, lookbook frames, and production notes.",
      creatorId: "creator_stitch_index",
      creatorName: "Stitch Index",
      type: "fashion_design",
      thumbnailUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      tags: ["fashion", "lookbook", "textiles"],
      aiGenerated: false,
      views: 8840,
      likesCount: 690,
      savesCount: 280,
    },
    {
      title: "Material Futures",
      slug: "material-futures",
      description: "A maker archive of sketches, prototypes, materials, and field-tested object ideas.",
      creatorId: "creator_global_makers",
      creatorName: "Global Makers",
      type: "inventions",
      thumbnailUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      tags: ["prototype", "craft", "objects"],
      aiGenerated: false,
      views: 8120,
      likesCount: 610,
      savesCount: 190,
    },
    {
      title: "Open Source Canvas Kit",
      slug: "open-source-canvas-kit",
      description: "A developer project with repository notes, UI components, diagrams, and implementation logs.",
      creatorId: "creator_indie_tools",
      creatorName: "Indie Tools Club",
      type: "coding_projects",
      thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
      tags: ["code", "open-source", "canvas"],
      aiGenerated: false,
      views: 17280,
      likesCount: 1420,
      savesCount: 830,
    },
    {
      title: "Tabletop Ceramic Process",
      slug: "tabletop-ceramic-process",
      description: "A handmade craft journal showing raw material, tools, glaze tests, failures, and final pieces.",
      creatorId: "creator_handmade_room",
      creatorName: "Handmade Room",
      type: "handmade_crafts",
      thumbnailUrl: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=1200&q=80",
      tags: ["craft", "ceramics", "process"],
      aiGenerated: false,
      views: 6920,
      likesCount: 520,
      savesCount: 210,
    },
    {
      title: "Street Light Photo Set",
      slug: "street-light-photo-set",
      description: "A photography series with location notes, contact sheets, edits, and exhibition sequencing.",
      creatorId: "creator_lens_collective",
      creatorName: "Lens Collective",
      type: "photography",
      thumbnailUrl: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1200&q=80",
      tags: ["photography", "street", "gallery"],
      aiGenerated: false,
      views: 12110,
      likesCount: 970,
      savesCount: 430,
    },
    {
      title: "Morning Pages Podcast",
      slug: "morning-pages-podcast",
      description: "A podcast season about creative routines with episode art, transcripts, clips, and guest notes.",
      creatorId: "creator_sound_archive",
      creatorName: "Sound Archive",
      type: "podcasts",
      thumbnailUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
      tags: ["podcast", "interviews", "audio"],
      aiGenerated: false,
      views: 9280,
      likesCount: 640,
      savesCount: 300,
    },
    {
      title: "AI Short Film Frames",
      slug: "ai-short-film-frames",
      description: "A labeled AI film experiment showing storyboards, generated clips, edit decisions, and final sequence.",
      creatorId: "creator_workofhuman_lab",
      creatorName: "WorkOfHuman Lab",
      type: "ai_films",
      thumbnailUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
      tags: ["ai", "film", "storyboard"],
      aiGenerated: true,
      aiModel: "Text-to-video concept pipeline",
      views: 20850,
      likesCount: 1880,
      savesCount: 910,
    },
    {
      title: "New Market Thesis",
      slug: "new-market-thesis",
      description: "A startup idea brief with problem framing, audience notes, wireframes, and launch experiments.",
      creatorId: "creator_indie_tools",
      creatorName: "Indie Tools Club",
      type: "startup_ideas",
      thumbnailUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80",
      tags: ["startup", "strategy", "research"],
      aiGenerated: false,
      views: 11120,
      likesCount: 810,
      savesCount: 510,
    },
  ];

  const creators: Profile[] = [
    {
      userId: "creator_workofhuman_studio",
      username: "workofhumanstudio",
      displayName: "WorkOfHuman Studio",
      bio: "Film, visual essays, and creator archives.",
      verified: true,
      categories: ["films", "photography", "documentaries"],
      followersCount: 182400,
      viewsCount: 4200000,
    },
    {
      userId: "creator_sound_archive",
      username: "soundarchive",
      displayName: "Sound Archive",
      bio: "Music releases, podcasts, stems, and production journals.",
      verified: true,
      categories: ["music", "podcasts", "audio_tracks"],
      followersCount: 112300,
      viewsCount: 2100000,
    },
    {
      userId: "creator_design_index",
      username: "designindex",
      displayName: "Design Index",
      bio: "Interface systems and product case studies.",
      verified: true,
      categories: ["ui_ux_design", "apps", "websites"],
      followersCount: 96700,
      viewsCount: 1600000,
    },
    {
      userId: "creator_indie_tools",
      username: "indietoolsclub",
      displayName: "Indie Tools Club",
      bio: "Apps, websites, open source projects, and startup experiments.",
      verified: false,
      categories: ["apps", "websites", "coding_projects"],
      followersCount: 87500,
      viewsCount: 1350000,
    },
    {
      userId: "creator_workofhuman_lab",
      username: "workofhumanlab",
      displayName: "WorkOfHuman Lab",
      bio: "Transparent AI experiments across sound, image, and tools.",
      verified: true,
      categories: ["ai_music", "ai_generated_art", "ai_apps"],
      followersCount: 146800,
      viewsCount: 3500000,
    },
    {
      userId: "creator_playtest_lab",
      username: "playtestlab",
      displayName: "Playtest Lab",
      bio: "Indie games, prototypes, mechanics, and player feedback loops.",
      verified: false,
      categories: ["indie_games", "animations", "3d_models"],
      followersCount: 73100,
      viewsCount: 980000,
    },
    {
      userId: "creator_spatial_notes",
      username: "spatialnotes",
      displayName: "Spatial Notes",
      bio: "Architecture, interiors, materials, and speculative environments.",
      verified: false,
      categories: ["architecture", "3d_models", "photography"],
      followersCount: 68400,
      viewsCount: 820000,
    },
    {
      userId: "creator_stitch_index",
      username: "stitchindex",
      displayName: "Stitch Index",
      bio: "Fashion systems, textile studies, and handmade garment research.",
      verified: false,
      categories: ["fashion_design", "handmade_crafts", "photography"],
      followersCount: 59200,
      viewsCount: 760000,
    },
    {
      userId: "creator_handmade_room",
      username: "handmaderoom",
      displayName: "Handmade Room",
      bio: "Ceramics, craft process, tools, material tests, and object studies.",
      verified: false,
      categories: ["handmade_crafts", "paintings", "inventions"],
      followersCount: 53300,
      viewsCount: 610000,
    },
    {
      userId: "creator_lens_collective",
      username: "lenscollective",
      displayName: "Lens Collective",
      bio: "Photography sets, contact sheets, exhibitions, and visual essays.",
      verified: true,
      categories: ["photography", "digital_art", "articles"],
      followersCount: 104900,
      viewsCount: 1900000,
    },
  ];

  const communities: Community[] = [
    {
      name: "Film Rooms",
      slug: "film-rooms",
      description: "Short films, process edits, documentaries, and production critique.",
      memberCount: 42000,
      featured: true,
    },
    {
      name: "Music Producers",
      slug: "music-producers",
      description: "Songs, stems, album art, sample packs, and production breakdowns.",
      memberCount: 51400,
      featured: true,
    },
    {
      name: "Product Design",
      slug: "product-design",
      description: "Interfaces, case studies, prototypes, systems, and critique.",
      memberCount: 38800,
      featured: true,
    },
    {
      name: "Writers Circle",
      slug: "writers-circle",
      description: "Stories, poetry, essays, drafts, critique, and publishing notes.",
      memberCount: 33700,
      featured: true,
    },
    {
      name: "Game Makers",
      slug: "game-makers",
      description: "Playable prototypes, dev logs, worldbuilding, mechanics, and art direction.",
      memberCount: 46200,
      featured: true,
    },
    {
      name: "AI Experiments",
      slug: "ai-experiments",
      description: "Clearly labeled AI-assisted work with process transparency.",
      memberCount: 58000,
      featured: true,
    },
    {
      name: "Makers and Inventors",
      slug: "makers-and-inventors",
      description: "Physical prototypes, craft systems, tools, inventions, and material research.",
      memberCount: 28900,
      featured: true,
    },
    {
      name: "Fashion Studio",
      slug: "fashion-studio",
      description: "Lookbooks, textiles, garment sketches, styling, and production diaries.",
      memberCount: 24500,
      featured: true,
    },
    {
      name: "Architecture Desk",
      slug: "architecture-desk",
      description: "Plans, models, interiors, urban ideas, and spatial storytelling.",
      memberCount: 19800,
      featured: true,
    },
  ];

  const trending: TrendingItem[] = projects.slice(0, 10).map((project, index) => ({
    period: "week",
    projectId: project.slug,
    score: Number((98 - index * 4.7).toFixed(1)),
    rank: index + 1,
  }));

  return {
    status: "ready",
    settings: defaultHomeSettings,
    projects,
    aiProjects: projects.filter((project) => project.aiGenerated),
    creators,
    communities,
    trending,
    categories: [...contentTypes],
  };
}

function asDocument<T>(document: Models.Document) {
  return document as Models.Document & T;
}

async function listDocuments<T>(collectionId: string, queries: string[]) {
  const databases = getDatabases();
  const response = await databases.listDocuments(appwriteConfig.databaseId, collectionId, queries);
  return response.documents.map((document) => asDocument<T>(document));
}

export async function getHomeData(): Promise<HomeData> {
  if (!isAppwriteConfigured()) {
    return { status: "missing-config", missingEnv: missingAppwriteEnv() };
  }

  try {
    const [settings, projects, aiProjects, creators, communities, trending] = await Promise.all([
      listDocuments<HomeSettings>(appwriteConfig.collections.homepage, [Query.limit(1)]),
      listDocuments<Project>(appwriteConfig.collections.projects, appwriteQueries.published),
      listDocuments<Project>(appwriteConfig.collections.projects, appwriteQueries.aiSpotlight),
      listDocuments<Profile>(appwriteConfig.collections.profiles, appwriteQueries.topCreators),
      listDocuments<Community>(appwriteConfig.collections.communities, appwriteQueries.featuredCommunities),
      listDocuments<TrendingItem>(appwriteConfig.collections.trendingCache, appwriteQueries.trending),
    ]);

    return {
      status: "ready",
      settings: settings[0] ?? null,
      projects,
      aiProjects,
      creators,
      communities,
      trending,
      categories: [...contentTypes],
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to load Appwrite content.",
    };
  }
}

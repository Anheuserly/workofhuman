import { query } from "./db";
import { contentTypes, ContentType } from "./platform";

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
  project?: Project;
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
  subheading:
    "Publish portfolios, films, music, writing, apps, inventions, design studies, and transparent AI-assisted experiments in one refined space.",
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
      creatorId: "creator_workofhuman_studio",
      creatorName: "WorkOfHuman Studio",
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
      title: "Future Craft Index",
      slug: "future-craft-index",
      description: "A maker portfolio documenting materials, sketches, prototypes, and field notes for useful objects.",
      creatorId: "creator_global_makers",
      creatorName: "Global Makers",
      type: "inventions",
      thumbnailUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      tags: ["craft", "prototype", "invention"],
      aiGenerated: false,
      views: 510000,
      likesCount: 28400,
      savesCount: 8800,
    },
  ];

  const creators: Profile[] = [
    {
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
  ];

  const communities: Community[] = [
    {
      name: "Indie Filmmakers",
      slug: "indie-filmmakers",
      description: "Short films, cinematic edits, documentaries, and process breakdowns.",
      avatarUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=400&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
      memberCount: 42000,
      featured: true,
    },
    {
      name: "AI Experimenters",
      slug: "ai-experimenters",
      description: "Transparent AI art, music, film, writing, and creative tooling.",
      avatarUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
      memberCount: 58000,
      featured: true,
    },
  ];

  const trending: TrendingItem[] = projects.slice(0, 10).map((project, index) => ({
    period: "week",
    projectId: project.slug,
    score: Number((98 - index * 4.7).toFixed(1)),
    rank: index + 1,
    project,
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

interface DbProjectRow {
  title: string;
  slug: string;
  description?: string | null;
  creator_id: string;
  creator_name?: string | null;
  type: ContentType | string;
  media_urls?: string[] | null;
  thumbnail_url?: string | null;
  tags?: string[] | null;
  ai_generated?: boolean | null;
  ai_model?: string | null;
  views?: number | string | null;
  likes_count?: number | string | null;
  saves_count?: number | string | null;
  published_at?: string | Date | null;
}

interface DbProfileRow {
  user_id: string;
  username: string;
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  verified?: boolean | null;
  categories?: string[] | null;
  followers_count?: number | string | null;
  views_count?: number | string | null;
}

interface DbCommunityRow {
  name: string;
  slug: string;
  description?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  member_count?: number | string | null;
  featured?: boolean | null;
}

interface DbTrendingRow {
  period: "day" | "week" | "month";
  project_id: string;
  score: number | string;
  rank: number | string;
  p_title?: string | null;
  p_thumb?: string | null;
  p_creator?: string | null;
  p_type?: ContentType | string | null;
}

function mapProject(r: DbProjectRow): Project {
  return {
    title: r.title,
    slug: r.slug,
    description: r.description || "",
    creatorId: r.creator_id,
    creatorName: r.creator_name || undefined,
    type: r.type,
    mediaUrls: Array.isArray(r.media_urls) ? r.media_urls : [],
    thumbnailUrl: r.thumbnail_url || undefined,
    tags: Array.isArray(r.tags) ? r.tags : [],
    aiGenerated: Boolean(r.ai_generated),
    aiModel: r.ai_model || undefined,
    views: Number(r.views || 0),
    likesCount: Number(r.likes_count || 0),
    savesCount: Number(r.saves_count || 0),
    publishedAt: r.published_at ? new Date(r.published_at).toISOString() : undefined,
  };
}

function mapProfile(r: DbProfileRow): Profile {
  return {
    userId: r.user_id,
    username: r.username,
    displayName: r.display_name || undefined,
    bio: r.bio || undefined,
    avatarUrl: r.avatar_url || undefined,
    bannerUrl: r.banner_url || undefined,
    verified: Boolean(r.verified),
    categories: Array.isArray(r.categories) ? r.categories : [],
    followersCount: Number(r.followers_count || 0),
    viewsCount: Number(r.views_count || 0),
  };
}

function mapCommunity(r: DbCommunityRow): Community {
  return {
    name: r.name,
    slug: r.slug,
    description: r.description || undefined,
    avatarUrl: r.avatar_url || undefined,
    bannerUrl: r.banner_url || undefined,
    memberCount: Number(r.member_count || 0),
    featured: Boolean(r.featured),
  };
}

export async function getHomeData(): Promise<HomeData> {
  try {
    const [settingsRes, projectsRes, aiProjectsRes, creatorsRes, communitiesRes, trendingRes] =
      await Promise.all([
        query(`SELECT * FROM homepage_settings WHERE id = 'default' LIMIT 1`),
        query<DbProjectRow>(`SELECT * FROM projects ORDER BY published_at DESC LIMIT 24`),
        query<DbProjectRow>(`SELECT * FROM projects WHERE ai_generated = true ORDER BY views DESC LIMIT 6`),
        query<DbProfileRow>(`SELECT * FROM profiles ORDER BY followers_count DESC LIMIT 8`),
        query<DbCommunityRow>(`SELECT * FROM communities WHERE featured = true ORDER BY member_count DESC LIMIT 6`),
        query<DbTrendingRow>(`SELECT t.*, p.title as p_title, p.thumbnail_url as p_thumb, p.creator_name as p_creator, p.type as p_type
               FROM trending_cache t
               LEFT JOIN projects p ON p.slug = t.project_id
               WHERE t.period = 'week'
               ORDER BY t.rank ASC LIMIT 12`),
      ]);

    const s = settingsRes.rows[0];
    const settings: HomeSettings | null = s
      ? {
          eyebrow: s.eyebrow,
          heading: s.heading,
          subheading: s.subheading,
          primaryCtaLabel: s.primary_cta_label,
          primaryCtaHref: s.primary_cta_href,
          secondaryCtaLabel: s.secondary_cta_label,
          secondaryCtaHref: s.secondary_cta_href,
          footerText: s.footer_text,
        }
      : defaultHomeSettings;

    const projects = projectsRes.rows.map(mapProject);
    const aiProjects = aiProjectsRes.rows.map(mapProject);
    const creators = creatorsRes.rows.map(mapProfile);
    const communities = communitiesRes.rows.map(mapCommunity);
    const trending: TrendingItem[] = trendingRes.rows.map((r: DbTrendingRow) => ({
      period: r.period,
      projectId: r.project_id,
      score: Number(r.score),
      rank: Number(r.rank),
      project: r.p_title
        ? {
            title: r.p_title,
            slug: r.project_id,
            description: "",
            creatorId: "",
            creatorName: r.p_creator || undefined,
            type: (r.p_type as ContentType) || "art",
            thumbnailUrl: r.p_thumb || undefined,
          }
        : undefined,
    }));

    // If database returned records, serve them!
    if (projects.length > 0) {
      return {
        status: "ready",
        settings,
        projects,
        aiProjects: aiProjects.length > 0 ? aiProjects : projects.filter((p) => p.aiGenerated),
        creators,
        communities,
        trending,
        categories: [...contentTypes],
      };
    }

    // Fallback to starter data if database is empty
    const starter = getStarterHomeData();
    return {
      status: "ready",
      settings,
      projects: starter.projects,
      aiProjects: starter.aiProjects,
      creators: starter.creators,
      communities: starter.communities,
      trending: starter.trending,
      categories: [...contentTypes],
    };
  } catch (error) {
    console.error("[PostgreSQL getHomeData Error]:", error);
    const starter = getStarterHomeData();
    return {
      status: "ready",
      settings: starter.settings,
      projects: starter.projects,
      aiProjects: starter.aiProjects,
      creators: starter.creators,
      communities: starter.communities,
      trending: starter.trending,
      categories: starter.categories,
    };
  }
}

export async function getProjectsByCategory(categorySlug: string): Promise<Project[]> {
  try {
    const res = await query<DbProjectRow>(
      `SELECT * FROM projects WHERE type = $1 OR type = $2 ORDER BY published_at DESC LIMIT 50`,
      [categorySlug, categorySlug.replaceAll("-", "_")]
    );
    return res.rows.map(mapProject);
  } catch (err) {
    console.error(`[getProjectsByCategory Error]:`, err);
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const res = await query<DbProjectRow>(`SELECT * FROM projects WHERE slug = $1 LIMIT 1`, [slug]);
    if (res.rows.length === 0) return null;
    return mapProject(res.rows[0]);
  } catch (err) {
    console.error(`[getProjectBySlug Error]:`, err);
    return null;
  }
}

export async function getProfileByUsername(
  username: string
): Promise<{ profile: Profile | null; projects: Project[] }> {
  try {
    const cleanUsername = username.replace(/^[@%40]+/, "").toLowerCase();
    const profRes = await query<DbProfileRow>(`SELECT * FROM profiles WHERE LOWER(username) = $1 LIMIT 1`, [
      cleanUsername,
    ]);
    if (profRes.rows.length === 0) return { profile: null, projects: [] };

    const profile = mapProfile(profRes.rows[0]);
    const projRes = await query<DbProjectRow>(
      `SELECT * FROM projects WHERE creator_id = $1 ORDER BY published_at DESC LIMIT 30`,
      [profile.userId]
    );

    return {
      profile,
      projects: projRes.rows.map(mapProject),
    };
  } catch (err) {
    console.error(`[getProfileByUsername Error]:`, err);
    return { profile: null, projects: [] };
  }
}

export async function getCommunityBySlug(slug: string): Promise<Community | null> {
  try {
    const res = await query<DbCommunityRow>(`SELECT * FROM communities WHERE slug = $1 LIMIT 1`, [slug]);
    if (res.rows.length === 0) return null;
    return mapCommunity(res.rows[0]);
  } catch (err) {
    console.error(`[getCommunityBySlug Error]:`, err);
    return null;
  }
}

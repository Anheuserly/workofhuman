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
  } catch (error) {
    console.error("[PostgreSQL getHomeData Error]:", error);
    return {
      status: "ready",
      settings: defaultHomeSettings,
      projects: [],
      aiProjects: [],
      creators: [],
      communities: [],
      trending: [],
      categories: [...contentTypes],
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

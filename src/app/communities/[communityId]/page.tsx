import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, UsersRound } from "lucide-react";
import { PageShell } from "@/components/shell";
import { ProjectCard } from "@/components/project-card";
import { CommunityJoinButton } from "@/components/community-join-button";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { Project } from "@/lib/home-data";

export const dynamic = "force-dynamic";

interface CommunityRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatar_url?: string;
  banner_url?: string;
  owner_id?: string;
  member_count: number;
  featured: boolean;
  created_at: string;
}

interface MemberRow {
  id: string;
  role: string;
  joined_at: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  short_id?: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ communityId: string }>;
}): Promise<Metadata> {
  const { communityId } = await params;

  const res = await query<CommunityRow>(
    `SELECT name, description, avatar_url, banner_url FROM workofhuman.communities WHERE slug = $1 LIMIT 1`,
    [communityId]
  );

  const comm = res.rows[0];
  if (!comm) {
    return {
      title: "Community Guild | The Work of Human",
    };
  }

  const title = `${comm.name} Guild | The Work of Human`;
  const description = comm.description || `Join ${comm.name} on The Work of Human.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://theworkofhuman.com/communities/${communityId}`,
    },
    openGraph: {
      title,
      description,
      url: `https://theworkofhuman.com/communities/${communityId}`,
      siteName: "The Work of Human",
      images: comm.banner_url || comm.avatar_url ? [{ url: comm.banner_url || comm.avatar_url! }] : [],
    },
  };
}

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ communityId: string }>;
}) {
  const { communityId } = await params;
  const currentUser = await getCurrentUser();

  // 1. Fetch community
  const commRes = await query<CommunityRow>(
    `SELECT id, name, slug, description, avatar_url, banner_url, owner_id, member_count, featured, created_at
     FROM workofhuman.communities
     WHERE slug = $1
     LIMIT 1`,
    [communityId]
  );

  if (commRes.rows.length === 0) {
    notFound();
  }

  const community = commRes.rows[0];

  // 2. Fetch members
  const membersRes = await query<MemberRow>(
    `SELECT cm.id, cm.role, cm.joined_at, pr.username, pr.display_name, pr.avatar_url, pr.short_id
     FROM workofhuman.community_members cm
     JOIN workofhuman.profiles pr ON cm.user_id = pr.user_id OR cm.user_id = pr.id
     WHERE cm.community_id = $1
     ORDER BY cm.joined_at DESC
     LIMIT 24`,
    [community.id]
  );
  const members = membersRes.rows;

  // Check if current user is member
  let isCurrentUserMember = false;
  if (currentUser) {
    const checkRes = await query(
      `SELECT id FROM workofhuman.community_members WHERE community_id = $1 AND user_id = $2 LIMIT 1`,
      [community.id, currentUser.userId]
    );
    isCurrentUserMember = checkRes.rows.length > 0;
  }

  // 3. Fetch community projects (matching medium or creator membership)
  let typeFilters: string[] = [];
  let requireAi = false;

  if (community.slug === "indie-filmmakers") {
    typeFilters = ["films", "short_movies", "cinematic_edits", "animations", "ai_films"];
  } else if (community.slug === "ai-experimenters") {
    requireAi = true;
  } else if (community.slug === "open-source-makers") {
    typeFilters = ["coding_projects", "websites", "apps", "indie_games", "inventions"];
  }

  let projectsSql = `
    SELECT 
      p.id,
      p.creator_id as "creatorId",
      p.title,
      p.slug,
      p.description,
      p.type,
      p.ai_generated as "aiGenerated",
      p.location,
      p.media_urls as "mediaUrls",
      p.thumbnail_url as "thumbnailUrl",
      p.status,
      p.views,
      p.likes_count as "likesCount",
      p.created_at as "createdAt",
      p.published_at as "publishedAt",
      pr.username as "creatorUsername",
      pr.display_name as "creatorName",
      pr.short_id as "creatorShortId"
    FROM workofhuman.projects p
    LEFT JOIN workofhuman.profiles pr ON p.creator_id = pr.user_id
    WHERE p.status = 'published'
  `;

  const projectParams: unknown[] = [];
  if (typeFilters.length > 0) {
    projectParams.push(typeFilters);
    projectsSql += ` AND p.type = ANY($${projectParams.length})`;
  } else if (requireAi) {
    projectsSql += ` AND p.ai_generated = true`;
  }

  projectsSql += ` ORDER BY p.created_at DESC LIMIT 24`;

  let projects: Project[] = [];
  try {
    const projRes = await query<Record<string, unknown>>(projectsSql, projectParams);
    projects = projRes.rows.map((row) => ({
      id: String(row.id),
      creatorId: String(row.creatorId),
      creatorUsername: String(row.creatorUsername || ""),
      creatorName: row.creatorName ? String(row.creatorName) : undefined,
      creatorShortId: row.creatorShortId ? String(row.creatorShortId) : undefined,
      title: String(row.title),
      slug: String(row.slug),
      description: String(row.description || ""),
      type: String(row.type),
      aiGenerated: Boolean(row.aiGenerated),
      location: row.location ? String(row.location) : undefined,
      mediaUrls: Array.isArray(row.mediaUrls) ? (row.mediaUrls as string[]) : [],
      thumbnailUrl: row.thumbnailUrl ? String(row.thumbnailUrl) : undefined,
      status: String(row.status || "published"),
      views: Number(row.views) || 0,
      likesCount: Number(row.likesCount) || 0,
      createdAt: String(row.createdAt),
      publishedAt: row.publishedAt ? String(row.publishedAt) : undefined,
    }));
  } catch (err) {
    console.warn("[Community Projects Fetch Warning]:", err);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${community.name} Guild — The Work of Human`,
    description: community.description,
    url: `https://theworkofhuman.com/communities/${community.slug}`,
    publisher: {
      "@type": "Organization",
      name: "The Work of Human",
      url: "https://theworkofhuman.com",
    },
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl py-6 sm:py-10 px-4 sm:px-6 space-y-10">
        {/* Navigation Breadcrumb */}
        <Link
          href="/communities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6f6a61] hover:text-[#151515] transition"
        >
          <ArrowLeft size={14} />
          Back to Communities &amp; Guilds
        </Link>

        {/* Guild Banner Card */}
        <div className="relative overflow-hidden rounded-3xl border border-[#ded9cf] bg-white shadow-sm">
          {/* Cover Header */}
          <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-gradient-to-r from-[#0f766e] via-[#115e59] to-[#042f2e]">
            {community.banner_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={community.banner_url}
                alt={community.name}
                className="h-full w-full object-cover opacity-60 mix-blend-overlay"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>

          {/* Profile & Info Bar */}
          <div className="p-6 sm:p-8 relative">
            {/* Avatar Emblem */}
            <div className="absolute -top-14 sm:-top-16 left-6 sm:left-8 size-24 sm:size-28 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white">
              {community.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={community.avatar_url}
                  alt={community.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center bg-[#0f766e] text-white">
                  <UsersRound size={36} />
                </div>
              )}
            </div>

            <div className="pt-10 sm:pt-0 sm:pl-36 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#0f766e]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0f766e]">
                    Official Guild
                  </span>
                  <span className="text-xs font-semibold text-[#8c857b]">
                    {(community.member_count || 0).toLocaleString()} Members
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#151515]">
                  {community.name}
                </h1>
                <p className="text-xs sm:text-sm text-[#555047] max-w-2xl leading-relaxed">
                  {community.description}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                <CommunityJoinButton
                  communitySlug={community.slug}
                  initialIsMember={isCurrentUserMember}
                  initialMemberCount={community.member_count || 0}
                  isAuthenticated={!!currentUser}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Member Roster Strip if members exist */}
        {members.length > 0 && (
          <div className="surface p-5 sm:p-6 rounded-2xl border border-[#ded9cf] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#151515] uppercase tracking-wider text-[11px]">
                Guild Member Roster
              </span>
              <span className="text-[#8c857b] font-medium">{members.length} Active Fellows</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {members.map((m) => {
                const handle = m.short_id || m.username;
                return (
                  <Link
                    key={m.id}
                    href={`/@${handle}`}
                    className="flex items-center gap-2 rounded-full bg-[#f6f4ef] border border-[#ded9cf] px-3 py-1 hover:border-[#0f766e] transition group"
                  >
                    {m.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.avatar_url}
                        alt={m.display_name || m.username}
                        className="size-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="size-5 rounded-full bg-[#0f766e] text-white text-[9px] font-bold grid place-items-center uppercase">
                        {(m.display_name || m.username).slice(0, 1)}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-[#151515] group-hover:text-[#0f766e]">
                      @{handle}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Featured Guild Creations Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#ded9cf] pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#151515]">
                Guild Showcase &amp; Creations
              </h2>
              <p className="text-xs text-[#6f6a61] mt-0.5">
                Curated craft and published works representing the {community.name} collective.
              </p>
            </div>
            <span className="text-xs font-bold text-[#0f766e] bg-[#0f766e]/10 px-3 py-1 rounded-full">
              {projects.length} Works
            </span>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isOwner={currentUser?.userId === project.creatorId}
                />
              ))}
            </div>
          ) : (
            <div className="surface p-12 text-center rounded-2xl border border-[#ded9cf] space-y-3">
              <UsersRound size={36} className="mx-auto text-[#0f766e]" />
              <h3 className="text-base font-bold text-[#151515]">No works in this guild yet</h3>
              <p className="text-xs text-[#6f6a61] max-w-sm mx-auto">
                Be the first member to publish a creation in this medium to showcase here.
              </p>
              <Link
                href="/publish"
                className="button-primary text-xs !px-4 !py-2 font-bold inline-block mt-2"
              >
                Publish a Creation
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

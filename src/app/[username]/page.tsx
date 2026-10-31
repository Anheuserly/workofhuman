import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/shell";
import { ProjectCard } from "@/components/project-card";
import { getProfileByUsername, getProjectBySlug } from "@/lib/home-data";
import { Users, Eye, Sparkles, Globe, Link2, ExternalLink } from "lucide-react";
import { RoleBadge } from "@/components/role-badge";
import { MessageCreatorModal } from "@/components/message-creator-modal";
import { FollowButton } from "@/components/follow-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const decoded = decodeURIComponent(username || "");
  const cleanHandle = decoded.replace(/^[@%40]+/, "").trim().toLowerCase();
  const { profile } = await getProfileByUsername(cleanHandle);

  const siteOrigin = "https://theworkofhuman.com";

  if (!profile) {
    // If it's a project ID shortcut (e.g. /67170d0e)
    const directProject = await getProjectBySlug(cleanHandle);
    if (directProject) {
      const creatorDisplay = directProject.creatorName || directProject.creatorUsername || "creator";
      const title = `${directProject.title} • by ${creatorDisplay} | The Work of Human`;
      let ogImage = directProject.thumbnailUrl;
      if (ogImage && ogImage.startsWith("/")) ogImage = `${siteOrigin}${ogImage}`;

      return {
        title,
        description: directProject.description?.slice(0, 200) || `Experience ${directProject.title} on The Work of Human.`,
        openGraph: {
          siteName: "The Work of Human",
          title,
          description: directProject.description?.slice(0, 200) || `Experience ${directProject.title} on The Work of Human.`,
          images: ogImage ? [{ url: ogImage, width: 1280, height: 720 }] : [],
        },
      };
    }

    return {
      title: "Creator Not Found | The Work of Human",
      description: "We couldn't find this creator on The Work of Human.",
    };
  }

  const name = profile.displayName || `@${profile.username}`;
  const title = `${name} (@${profile.username}) • Portfolio | The Work of Human`;
  const description = profile.bio || `Explore original portfolio and creative works by ${name} on The Work of Human.`;
  const image = profile.avatarUrl || profile.bannerUrl;
  const absoluteImage = image ? (image.startsWith("/") ? `${siteOrigin}${image}` : image) : undefined;
  const pageUrl = `${siteOrigin}/@${profile.shortId || profile.username}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "profile",
      siteName: "The Work of Human",
      title,
      description,
      url: pageUrl,
      images: absoluteImage
        ? [
            {
              url: absoluteImage,
              width: 800,
              height: 800,
              alt: name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: absoluteImage ? [absoluteImage] : [],
    },
  };
}

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const decoded = decodeURIComponent(username || "");
  const cleanHandle = decoded.replace(/^[@%40]+/, "").trim().toLowerCase();
  const { profile, projects } = await getProfileByUsername(cleanHandle);

  if (!profile && projects.length === 0) {
    const directProject = await getProjectBySlug(cleanHandle);
    if (directProject) {
      const creatorRef = directProject.creatorShortId || directProject.creatorUsername || "creator";
      redirect(`/@${creatorRef}/${directProject.slug}`);
    }

    return (
      <PageShell>
        <section className="mx-auto max-w-2xl py-20 text-center">
          <div className="surface p-8 sm:p-12 space-y-4 rounded-2xl border border-[#ded9cf]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f766e]">
              Creator Directory
            </span>
            <h1 className="text-2xl font-bold text-[#151515]">Creator Not Found</h1>
            <p className="text-xs text-[#6f6a61] leading-relaxed">
              We couldn&apos;t find a creator profile for &ldquo;@{cleanHandle}&rdquo;.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <Link
                href="/explore"
                className="button-primary text-xs font-semibold !px-4 !py-2"
              >
                Explore All Creators &amp; Works
              </Link>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  const socials = profile?.socialLinks || {};

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-8 sm:py-12">
        {/* Profile Card with Optional Banner */}
        <div className="surface rounded-2xl border border-[#ded9cf] mb-10 overflow-hidden shadow-xs">
          {profile?.bannerUrl && (
            <div className="relative h-44 sm:h-64 w-full overflow-hidden bg-[#e9e4da]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.bannerUrl}
                alt={`${profile.displayName || cleanHandle}'s banner`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          )}

          <div className="p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                {profile?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName || cleanHandle}
                    className="size-20 sm:size-24 rounded-full object-cover border-4 border-white shadow-md -mt-10 sm:-mt-14 shrink-0 bg-white"
                  />
                ) : (
                  <div className="grid size-20 sm:size-24 place-items-center rounded-full bg-[#0f766e] text-white font-black text-2xl sm:text-3xl uppercase border-4 border-white shadow-md -mt-10 sm:-mt-14 shrink-0">
                    {(profile?.displayName || cleanHandle).slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#151515]">
                      {profile?.displayName || `@${cleanHandle}`}
                    </h1>
                    <RoleBadge role={profile?.role} verified={profile?.verified} size="md" />
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs font-semibold text-[#0f766e]">@{profile?.username || cleanHandle}</p>
                    {profile?.shortId && (
                      <span className="text-[10px] font-mono font-bold text-[#6f6a61] bg-[#f6f4ef] border border-[#ded9cf] px-2 py-0.5 rounded-full">
                        ID: {profile.shortId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#6f6a61] max-w-2xl leading-relaxed pt-1">
                    {profile?.bio || `Independent creator portfolio and multimedia archive of @${cleanHandle}.`}
                  </p>

                  {/* Social & Web Links */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#6f6a61]">
                    {socials.website && (
                      <a
                        href={socials.website.startsWith("http") ? socials.website : `https://${socials.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-[#0f766e] transition font-medium"
                      >
                        <Globe size={13} />
                        Website
                        <ExternalLink size={10} />
                      </a>
                    )}
                    {socials.twitter && (
                      <a
                        href={`https://x.com/${socials.twitter.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-[#0f766e] transition font-medium"
                      >
                        <Link2 size={13} />
                        X/@{socials.twitter.replace(/^@/, "")}
                      </a>
                    )}
                    {socials.github && (
                      <a
                        href={`https://github.com/${socials.github.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-[#0f766e] transition font-medium"
                      >
                        <Link2 size={13} />
                        GitHub
                      </a>
                    )}
                    {socials.instagram && (
                      <a
                        href={`https://instagram.com/${socials.instagram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-[#0f766e] transition font-medium"
                      >
                        <Link2 size={13} />
                        Instagram
                      </a>
                    )}
                    {socials.youtube && (
                      <a
                        href={socials.youtube.startsWith("http") ? socials.youtube : `https://youtube.com/${socials.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-[#0f766e] transition font-medium"
                      >
                        <Link2 size={13} />
                        YouTube
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Direct Communication & Follow Actions */}
              <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 sm:pt-0">
                <FollowButton
                  username={cleanHandle}
                  initialFollowers={profile?.followersCount || 0}
                />
                <MessageCreatorModal
                  recipientUsername={cleanHandle}
                  recipientName={profile?.displayName}
                />
              </div>
            </div>

            {/* Metrics & Categories Bar */}
            <div className="mt-8 pt-6 border-t border-[#f0ede6] flex flex-wrap items-center justify-between gap-4 text-xs text-[#5f5a52]">
              <div className="flex items-center gap-6">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Users size={15} className="text-[#6f6a61]" />
                  <strong className="text-[#151515] font-bold">
                    {profile?.followersCount?.toLocaleString() || 0}
                  </strong>{" "}
                  followers
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Eye size={15} className="text-[#6f6a61]" />
                  <strong className="text-[#151515] font-bold">
                    {profile?.viewsCount?.toLocaleString() || 0}
                  </strong>{" "}
                  views
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Sparkles size={15} className="text-[#0f766e]" />
                  <strong className="text-[#151515] font-bold">{projects.length}</strong> creations
                </span>
              </div>

              {profile?.categories && profile.categories.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {profile.categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-full bg-[#f6f4ef] border border-[#ded9cf] px-2.5 py-0.5 text-[11px] font-semibold text-[#504b44]"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Creator Published Works Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#151515]">
              Published Works ({projects.length})
            </h3>
            <span className="text-xs text-[#8c857b]">Click any creation to play and view</span>
          </div>

          {projects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard project={project} key={`${project.creatorId}-${project.slug}`} />
              ))}
            </div>
          ) : (
            <div className="surface p-12 text-center text-[#6f6a61] rounded-2xl border border-dashed border-[#ded9cf]">
              <p className="text-xs font-semibold">
                No published projects found for @{cleanHandle} yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

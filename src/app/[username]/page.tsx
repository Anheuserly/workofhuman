import { PageShell } from "@/components/shell";
import { ProjectCard } from "@/components/project-card";
import { getProfileByUsername } from "@/lib/home-data";
import { Users, Eye, Sparkles, Globe, Link2, ExternalLink } from "lucide-react";
import { RoleBadge } from "@/components/role-badge";
import { MessageCreatorModal } from "@/components/message-creator-modal";
import { FollowButton } from "@/components/follow-button";

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const cleanHandle = username.replace(/^[@%40]+/, "");
  const { profile, projects } = await getProfileByUsername(cleanHandle);

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
                  <p className="font-mono text-xs font-semibold text-[#0f766e]">@{cleanHandle}</p>
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

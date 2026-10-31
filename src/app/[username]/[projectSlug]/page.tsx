import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Eye,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { PageShell } from "@/components/shell";
import { getProjectBySlug, getProfileByUsername } from "@/lib/home-data";
import { getCurrentUser } from "@/lib/auth";
import { RoleBadge } from "@/components/role-badge";
import { MessageCreatorModal } from "@/components/message-creator-modal";
import { ProjectComments } from "@/components/project-comments";
import { AppreciateButton } from "@/components/appreciate-button";
import { FollowButton } from "@/components/follow-button";
import { ProjectManageMenu } from "@/components/project-manage-menu";
import { MediaLightbox } from "@/components/media-lightbox";
import { AudioTrackPlayer } from "@/components/audio-track-player";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ username: string; projectSlug: string }>;
}) {
  const { username, projectSlug } = await params;
  const cleanUsername = username.replace(/^[@%40]+/, "").toLowerCase();

  const [project, currentUser] = await Promise.all([
    getProjectBySlug(projectSlug),
    getCurrentUser(),
  ]);

  // Gracefully handle missing or undefined project slugs
  if (!project) {
    return (
      <PageShell>
        <section className="mx-auto max-w-2xl py-20 text-center">
          <div className="surface p-8 sm:p-12 space-y-4 rounded-2xl border border-[#ded9cf]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f766e]">
              Creation Directory
            </span>
            <h1 className="text-2xl font-bold text-[#151515]">Creation Not Found</h1>
            <p className="text-xs text-[#6f6a61] leading-relaxed">
              The project &ldquo;{projectSlug}&rdquo; could not be located or may have been renamed.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <Link
                href={`/@${cleanUsername}`}
                className="button-primary text-xs font-semibold !px-4 !py-2"
              >
                View @{cleanUsername}&apos;s Portfolio
              </Link>
              <Link
                href="/explore"
                className="button-secondary text-xs font-semibold !px-4 !py-2"
              >
                Explore All Creations
              </Link>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  const effectiveUsername =
    project.creatorUsername ||
    (cleanUsername !== "undefined" ? cleanUsername : project.creatorName || "creator");

  const { profile } = await getProfileByUsername(effectiveUsername);

  // Helper to detect media types
  function isVideo(url?: string): boolean {
    if (!url) return false;
    return /\.(mp4|webm|mov|m4v|mkv|ogv)(\?.*)?$/i.test(url);
  }

  function isAudio(url?: string): boolean {
    if (!url) return false;
    return /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(url);
  }

  // Determine main video or primary visual asset
  const videoAsset =
    project.mediaUrls?.find(isVideo) || (isVideo(project.thumbnailUrl) ? project.thumbnailUrl : undefined);
  const audioAsset =
    project.mediaUrls?.find(isAudio) || (isAudio(project.thumbnailUrl) ? project.thumbnailUrl : undefined);
  const primaryImage =
    project.thumbnailUrl || project.mediaUrls?.find((u) => !isVideo(u) && !isAudio(u));

  // Additional media reel (excluding main playback asset)
  const additionalAssets = (project.mediaUrls || []).filter(
    (url) => url !== videoAsset && url !== audioAsset && url !== primaryImage
  );

  const isOwner = currentUser?.userId === project.creatorId || currentUser?.role === "admin";

  return (
    <PageShell>
      <article className="mx-auto max-w-5xl py-8">
        {/* Back Link & Navigation Bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href={`/@${effectiveUsername}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6f6a61] hover:text-[#151515] transition"
          >
            <ArrowLeft size={14} />
            Back to @{effectiveUsername}&apos;s Portfolio
          </Link>

          {isOwner && (
            <ProjectManageMenu
              projectSlug={project.slug}
              initialTitle={project.title}
              initialDescription={project.description}
              creatorUsername={effectiveUsername}
            />
          )}
        </div>

        {/* Project Header */}
        <header className="border-b border-[#ded9cf] pb-6 mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded-full bg-[#151515] px-3 py-1 text-xs font-bold text-white capitalize">
              {project.type.replaceAll("_", " ")}
            </span>

            {project.aiGenerated && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f766e]/10 border border-[#0f766e]/20 px-3 py-1 text-xs font-semibold text-[#0f766e]">
                <Sparkles size={13} />
                AI Disclosed: {project.aiModel || "Generative AI"}
              </span>
            )}

            <span className="inline-flex items-center gap-1 rounded-full bg-[#f6f4ef] border border-[#ded9cf] px-2.5 py-1 text-[11px] font-mono text-[#6f6a61]">
              <span className="text-[#0f766e] font-semibold">{videoAsset ? "VIDEO ID:" : "ID:"}</span>
              <span className="font-bold text-[#151515]">{project.slug || project.id}</span>
            </span>

            {project.creatorShortId && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f6f4ef] border border-[#ded9cf] px-2.5 py-1 text-[11px] font-mono text-[#6f6a61]">
                <span className="text-[#0f766e] font-semibold">CREATOR ID:</span>
                <span className="font-bold text-[#151515]">{project.creatorShortId}</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#151515]">
            {project.title}
          </h1>

          {/* Author info & communication metrics */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[#6f6a61]">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/@${effectiveUsername}`}
                className="flex items-center gap-2.5 hover:text-[#151515] transition group"
              >
                {profile?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName || effectiveUsername}
                    className="size-9 rounded-full object-cover border border-[#ded9cf] group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="grid size-9 place-items-center rounded-full bg-[#0f766e] text-white font-bold text-xs uppercase group-hover:scale-105 transition">
                    {(profile?.displayName || effectiveUsername).slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-[#151515] group-hover:text-[#0f766e] transition">
                    {project.creatorName || profile?.displayName || `@${effectiveUsername}`}
                  </p>
                  <p className="font-mono text-[11px] text-[#8c857b]">@{effectiveUsername}</p>
                </div>
                <RoleBadge role={profile?.role} verified={profile?.verified} size="sm" />
              </Link>

              {/* Direct Follow & Message Buttons */}
              <FollowButton
                username={effectiveUsername}
                initialFollowers={profile?.followersCount || 0}
              />
              <MessageCreatorModal
                recipientUsername={effectiveUsername}
                recipientName={profile?.displayName || project.creatorName}
              />
            </div>

            {/* Metrics & Appreciate Button */}
            <div className="flex items-center gap-3 sm:gap-4 text-[#8c857b]">
              {project.publishedAt && (
                <span className="inline-flex items-center gap-1" suppressHydrationWarning>
                  <Calendar size={13} />
                  {new Date(project.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Eye size={13} />
                {(project.views || 0).toLocaleString()} views
              </span>

              {/* Interactive Like / Appreciate Button */}
              <AppreciateButton
                projectSlug={project.slug}
                initialCount={project.likesCount || 0}
              />
            </div>
          </div>
        </header>

        {/* Primary Media Display (Full Video / Audio Waveform / High-Res Image Lightbox) */}
        <section className="mb-10">
          <div className="surface overflow-hidden rounded-2xl border border-[#ded9cf] shadow-sm">
            {videoAsset ? (
              <div className="relative aspect-video w-full bg-black">
                <video
                  src={videoAsset}
                  poster={project.thumbnailUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-contain"
                >
                  Your browser does not support HTML5 video playback.
                </video>
              </div>
            ) : audioAsset ? (
              <AudioTrackPlayer
                src={audioAsset}
                title={project.title}
                subtitle={`${project.type.replaceAll("_", " ")} • by ${project.creatorName || `@${cleanUsername}`}`}
              />
            ) : primaryImage ? (
              <div className="relative w-full max-h-[720px] bg-[#e9e4da] flex items-center justify-center">
                <MediaLightbox
                  src={primaryImage}
                  alt={project.title}
                  className="h-auto max-h-[720px] w-full object-contain"
                />
              </div>
            ) : (
              <div className="surface p-12 text-center text-[#6f6a61]">
                <p className="text-sm font-semibold">No visual media uploaded for this creation.</p>
              </div>
            )}
          </div>
        </section>

        {/* Additional Assets / Media Reel Gallery with Lightbox */}
        {additionalAssets.length > 0 && (
          <section className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6f6a61] mb-4">
              Additional Works &amp; Process Assets ({additionalAssets.length})
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {additionalAssets.map((assetUrl, i) => (
                <div key={i} className="surface overflow-hidden rounded-xl border border-[#ded9cf]">
                  {isVideo(assetUrl) ? (
                    <video src={assetUrl} controls playsInline className="w-full aspect-video bg-black" />
                  ) : isAudio(assetUrl) ? (
                    <div className="p-4 bg-[#f6f4ef]">
                      <audio src={assetUrl} controls className="w-full" />
                    </div>
                  ) : (
                    <MediaLightbox
                      src={assetUrl}
                      alt={`Asset ${i + 1}`}
                      className="w-full h-64 object-cover"
                    />
                  )}
                  <div className="p-3 text-right border-t border-[#ded9cf]">
                    <a
                      href={assetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f766e] hover:underline"
                    >
                      Open Raw Asset
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Project Description & Narrative */}
        {project.description && (
          <section className="surface p-6 sm:p-8 mb-8 space-y-4 rounded-xl border border-[#ded9cf]">
            <h2 className="text-base font-bold text-[#151515]">Project Notes &amp; Statement</h2>
            <div className="prose prose-sm max-w-none text-[#4d4942] leading-relaxed whitespace-pre-wrap">
              {project.description}
            </div>
          </section>
        )}

        {/* AI Provenance Disclosure Details */}
        {project.aiGenerated && (
          <section className="rounded-xl border border-[#0f766e]/30 bg-[#0f766e]/5 p-5 mb-8">
            <div className="flex items-center gap-2 text-[#0f766e] font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles size={16} />
              Transparent AI Disclosure
            </div>
            <p className="text-xs text-[#5f5a52] leading-relaxed">
              This creator has declared this work as AI-assisted or generated. The Work of Human requires full provenance disclosure to maintain integrity across human craftsmanship and synthetic experimentation.
            </p>
            {project.aiModel && (
              <p className="mt-2 text-xs font-mono font-semibold text-[#151515]">
                Disclosed Tooling: <span className="text-[#0f766e]">{project.aiModel}</span>
              </p>
            )}
          </section>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <section className="mb-10 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8c857b] mr-2">Tags:</span>
            {project.tags.map((tag) => (
              <Link
                key={tag}
                href={`/explore?tag=${encodeURIComponent(tag)}`}
                className="rounded-full bg-[#f6f4ef] border border-[#ded9cf] px-3 py-1 text-xs text-[#504b44] hover:bg-[#151515] hover:text-white transition"
              >
                #{tag}
              </Link>
            ))}
          </section>
        )}

        {/* Interactive Comments & Community Feedback */}
        <ProjectComments projectSlug={project.slug} currentUser={currentUser} />
      </article>
    </PageShell>
  );
}

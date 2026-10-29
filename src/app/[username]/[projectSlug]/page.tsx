import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Eye,
  Heart,
  Sparkles,
  ExternalLink,
  Music,
} from "lucide-react";
import { PageShell } from "@/components/shell";
import { getProjectBySlug, getProfileByUsername } from "@/lib/home-data";
import { RoleBadge } from "@/components/role-badge";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ username: string; projectSlug: string }>;
}) {
  const { username, projectSlug } = await params;
  const cleanUsername = username.replace(/^[@%40]+/, "").toLowerCase();

  const project = await getProjectBySlug(projectSlug);
  if (!project) {
    notFound();
  }

  const { profile } = await getProfileByUsername(cleanUsername);

  // Helper to detect media types
  function isVideo(url?: string): boolean {
    if (!url) return false;
    return /\.(mp4|webm|mov|m4v|mkv|ogv)(\?.*)?$/i.test(url);
  }

  function isAudio(url?: string): boolean {
    if (!url) return false;
    return /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(url);
  }

  const primaryAsset = project.mediaUrls?.[0] || project.thumbnailUrl;
  const additionalAssets = project.mediaUrls && project.mediaUrls.length > 1
    ? project.mediaUrls.slice(1)
    : [];

  return (
    <PageShell>
      <article className="mx-auto max-w-5xl py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href={`/${cleanUsername}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6f6a61] hover:text-[#151515] transition"
          >
            <ArrowLeft size={14} />
            Back to @{cleanUsername}&apos;s Portfolio
          </Link>
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
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#151515]">
            {project.title}
          </h1>

          {/* Author info & metrics */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[#6f6a61]">
            <Link
              href={`/${cleanUsername}`}
              className="flex items-center gap-2.5 hover:text-[#151515] transition"
            >
              {profile?.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName || cleanUsername}
                  className="size-8 rounded-full object-cover border border-[#ded9cf]"
                />
              ) : (
                <div className="grid size-8 place-items-center rounded-full bg-[#0f766e] text-white font-bold text-xs">
                  {(profile?.displayName || cleanUsername).slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-bold text-[#151515]">
                  {project.creatorName || profile?.displayName || `@${cleanUsername}`}
                </p>
                <p className="font-mono text-[11px] text-[#8c857b]">@{cleanUsername}</p>
              </div>
              <RoleBadge role={profile?.role} verified={profile?.verified} size="sm" />
            </Link>

            <div className="flex items-center gap-4 text-[#8c857b]">
              {project.publishedAt && (
                <span className="inline-flex items-center gap-1">
                  <Calendar size={13} />
                  {new Date(project.publishedAt).toLocaleDateString()}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Eye size={13} />
                {(project.views || 0).toLocaleString()} views
              </span>
              <span className="inline-flex items-center gap-1">
                <Heart size={13} />
                {(project.likesCount || 0).toLocaleString()} appreciates
              </span>
            </div>
          </div>
        </header>

        {/* Primary Media Display */}
        <section className="mb-10">
          {primaryAsset ? (
            <div className="surface overflow-hidden shadow-sm">
              {isVideo(primaryAsset) ? (
                <div className="relative aspect-video w-full bg-black">
                  <video
                    src={primaryAsset}
                    controls
                    playsInline
                    className="h-full w-full object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : isAudio(primaryAsset) ? (
                <div className="p-8 sm:p-12 bg-gradient-to-br from-[#151515] to-[#252220] text-white text-center rounded-lg">
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#0f766e] text-white mb-6">
                    <Music size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-xs text-white/60 mb-6">Audio Track • {project.type.replaceAll("_", " ")}</p>
                  <audio src={primaryAsset} controls className="w-full max-w-lg mx-auto" />
                </div>
              ) : (
                <div className="relative w-full max-h-[720px] bg-[#e9e4da] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={primaryAsset}
                    alt={project.title}
                    className="h-auto max-h-[720px] w-full object-contain"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="surface p-12 text-center text-[#6f6a61]">
              <p className="text-sm font-semibold">No visual media uploaded for this creation.</p>
            </div>
          )}
        </section>

        {/* Additional Assets / Media Gallery */}
        {additionalAssets.length > 0 && (
          <section className="mb-10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#6f6a61] mb-4">
              Additional Works &amp; Process Assets ({additionalAssets.length})
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {additionalAssets.map((assetUrl, i) => (
                <div key={i} className="surface overflow-hidden">
                  {isVideo(assetUrl) ? (
                    <video src={assetUrl} controls playsInline className="w-full aspect-video bg-black" />
                  ) : isAudio(assetUrl) ? (
                    <div className="p-4 bg-[#f6f4ef]">
                      <audio src={assetUrl} controls className="w-full" />
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={assetUrl} alt={`Asset ${i + 1}`} className="w-full h-64 object-cover" />
                  )}
                  <div className="p-3 text-right">
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
          <section className="surface p-6 sm:p-8 mb-8 space-y-4">
            <h2 className="text-lg font-bold text-[#151515]">Project Notes &amp; Statement</h2>
            <div className="prose prose-sm max-w-none text-[#4d4942] leading-relaxed whitespace-pre-wrap">
              {project.description}
            </div>
          </section>
        )}

        {/* AI Provenance Disclosure Details */}
        {project.aiGenerated && (
          <section className="rounded-lg border border-[#0f766e]/30 bg-[#0f766e]/5 p-5 mb-8">
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
              <span
                key={tag}
                className="rounded-full bg-[#f6f4ef] border border-[#ded9cf] px-3 py-1 text-xs text-[#504b44]"
              >
                #{tag}
              </span>
            ))}
          </section>
        )}
      </article>
    </PageShell>
  );
}

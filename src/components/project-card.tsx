import Link from "next/link";
import { Eye, Heart, ImageIcon, Play, Sparkles } from "lucide-react";
import type { Project } from "@/lib/home-data";
import { CreationActionsMenu } from "@/components/creation-actions-menu";

export function ProjectCard({
  project,
  isOwner = false,
  onDeleted,
}: {
  project: Project;
  isOwner?: boolean;
  onDeleted?: () => void;
}) {
  const rawCreator = project.creatorShortId || project.creatorUsername || project.creatorName || "creator";
  const creatorHandle = String(rawCreator).replace(/^@+/, "").trim() || "creator";
  const projectHref = `/@${creatorHandle}/${project.slug}`;
  const profileHref = `/@${creatorHandle}`;

  const hasVideo =
    project.mediaUrls?.some((u) => /\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i.test(u)) ||
    ["films", "short_movies", "cinematic_edits", "animations", "ai_films"].includes(project.type);

  return (
    <article className="project-card group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#ded9cf] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#151515] hover:shadow-lg">
      {/* Quick Action Menu Button */}
      <div className="absolute top-3 right-3 z-20">
        <CreationActionsMenu
          projectId={project.id}
          projectSlug={project.slug}
          projectTitle={project.title}
          creatorUsername={project.creatorUsername || creatorHandle}
          creatorShortId={project.creatorShortId}
          isOwner={isOwner}
          onDeleted={onDeleted}
        />
      </div>

      <Link href={projectHref} className="block overflow-hidden focus:outline-none" aria-label={project.title}>
        <div className="relative h-56 overflow-hidden bg-[#e9e4da]">
          {project.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={project.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              src={project.thumbnailUrl}
            />
          ) : (
            <div className="grid h-full place-items-center text-white/60">
              <ImageIcon size={34} />
            </div>
          )}

          {/* Video Play Overlay */}
          {hasVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-90 transition group-hover:opacity-100 group-hover:bg-black/30">
              <div className="grid size-12 place-items-center rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20 transition duration-300 group-hover:scale-110 shadow-lg">
                <Play size={20} className="ml-0.5 fill-current" />
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 pointer-events-none">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#151515] backdrop-blur">
              {project.type.replaceAll("_", " ")}
            </span>
            {project.aiGenerated && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#0f766e] px-3 py-1 text-xs font-black text-white">
                <Sparkles size={12} />
                AI
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <Link href={projectHref} className="hover:text-[#0f766e] transition">
            <h3 className="text-xl font-bold line-clamp-1 text-[#151515]">{project.title}</h3>
          </Link>
          <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-[#6f6a61]">{project.description}</p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#f0ede6] pt-3 text-xs text-[#6f6a61]">
          <Link
            href={profileHref}
            className="truncate font-semibold text-[#151515] hover:text-[#0f766e] hover:underline transition"
          >
            @{creatorHandle}
          </Link>
          <span className="inline-flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1">
              <Eye size={14} />
              {project.views ?? 0}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart size={14} />
              {project.likesCount ?? 0}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}

import { Eye, Heart, ImageIcon, Sparkles } from "lucide-react";
import type { Project } from "@/lib/home-data";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card group">
      <div className="relative h-56 overflow-hidden bg-[#e9e4da]">
        {project.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={project.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            src={project.thumbnailUrl}
          />
        ) : (
          <div className="grid h-full place-items-center text-white/62">
            <ImageIcon size={34} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#151515] backdrop-blur">{project.type}</span>
          {project.aiGenerated ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0f766e] px-3 py-1 text-xs font-black text-white">
              <Sparkles size={12} />
              AI
            </span>
          ) : null}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-2xl font-semibold">{project.title}</h3>
        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#6f6a61]">{project.description}</p>
        <div className="mt-6 flex items-center justify-between gap-3 text-sm text-[#6f6a61]">
          <span>{project.creatorName ?? project.creatorId}</span>
          <span className="inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Eye size={15} />
              {project.views ?? 0}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart size={15} />
              {project.likesCount ?? 0}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}

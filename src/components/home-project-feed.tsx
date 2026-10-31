"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Sparkles, Play, Compass, ArrowRight } from "lucide-react";
import type { Project } from "@/lib/home-data";
import { ProjectCard } from "@/components/project-card";

interface HomeProjectFeedProps {
  projects: Project[];
}

const CATEGORY_CHIPS = [
  { id: "all", label: "All Works" },
  { id: "video", label: "Cinema & Video", types: ["films", "short_movies", "cinematic_edits", "animations", "ai_films", "video"] },
  { id: "ai", label: "AI Creations", onlyAi: true },
  { id: "digital_art", label: "Digital Art", types: ["digital_art", "paintings", "photography", "ai_generated_art"] },
  { id: "3d", label: "3D & Animation", types: ["animations", "3d_models", "indie_games"] },
  { id: "music", label: "Music & Audio", types: ["music", "songs", "podcasts", "audio_tracks", "ai_music"] },
  { id: "writing", label: "Writing & Stories", types: ["stories", "poetry", "books", "articles", "blogs"] },
  { id: "code", label: "Code & Inventions", types: ["coding_projects", "websites", "apps", "inventions", "startup_ideas"] },
];

export function HomeProjectFeed({ projects }: HomeProjectFeedProps) {
  const [selectedChip, setSelectedChip] = useState("all");

  const filteredProjects = useMemo(() => {
    if (selectedChip === "all") return projects;

    const chip = CATEGORY_CHIPS.find((c) => c.id === selectedChip);
    if (!chip) return projects;

    if (chip.onlyAi) {
      return projects.filter((p) => p.aiGenerated || p.type.startsWith("ai_"));
    }

    if (chip.types) {
      return projects.filter((p) => {
        const typeMatch = chip.types?.includes(p.type);
        const tagMatch = p.tags?.some((t) =>
          chip.types?.some((ct) => t.toLowerCase().includes(ct.replace("_", " ")))
        );
        return typeMatch || tagMatch;
      });
    }

    return projects;
  }, [projects, selectedChip]);

  const featuredProject = projects[0];
  const featuredCreator = featuredProject
    ? featuredProject.creatorShortId || featuredProject.creatorUsername || "creator"
    : "creator";
  const featuredHref = featuredProject ? `/@${featuredCreator}/${featuredProject.slug}` : "/explore";

  return (
    <div className="space-y-8">
      {/* 1. Horizontal Category Filter Bar (YouTube / Behance style) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none -mx-2 px-2">
        {CATEGORY_CHIPS.map((chip) => {
          const active = selectedChip === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setSelectedChip(chip.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer shadow-2xs ${
                active
                  ? "bg-[#151515] text-white shadow-xs font-bold"
                  : "bg-white text-[#504b44] border border-[#ded9cf] hover:bg-[#f6f4ef] hover:text-[#151515]"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* 2. Featured Creation Spotlight Hero (Only when on 'All Works' and projects exist) */}
      {selectedChip === "all" && featuredProject && (
        <section className="relative group rounded-2xl overflow-hidden border border-[#ded9cf] bg-white shadow-xs hover:shadow-md transition">
          <Link
            href={featuredHref}
            className="block relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-[#151515]"
          >
            {featuredProject.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={featuredProject.title}
                src={featuredProject.thumbnailUrl}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[#151515] text-white/50 text-xs font-mono">
                Featured Creation
              </div>
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white border border-white/15">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                Featured Spotlight
              </div>

              <span className="rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-[#151515] uppercase tracking-wider capitalize shadow-xs">
                {featuredProject.type.replaceAll("_", " ")}
              </span>
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid size-14 place-items-center rounded-full bg-white/90 text-[#151515] backdrop-blur-md shadow-xl transition duration-300 group-hover:scale-110 group-hover:bg-white">
                <Play size={24} className="ml-0.5 fill-current" />
              </div>
            </div>

            {/* Bottom Content Overlay */}
            <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
              <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm group-hover:text-emerald-300 transition line-clamp-1">
                {featuredProject.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-white/80 font-mono">
                <span>@{featuredProject.creatorUsername || featuredProject.creatorShortId || "creator"}</span>
                {featuredProject.aiGenerated && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-[#0f766e]/90 text-white px-2 py-0.5 rounded-full font-sans font-semibold">
                    <Sparkles size={11} />
                    AI Disclosed
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* Footer bar */}
          <div className="p-4 sm:p-5 flex items-center justify-between bg-white border-t border-[#ded9cf] gap-3">
            <p className="text-xs text-[#6f6a61] line-clamp-1 flex-1">
              {featuredProject.description || "Original creative work published on The Work of Human."}
            </p>
            <Link
              href={featuredHref}
              className="button-primary shrink-0 text-xs !py-1.5 !px-4 font-bold flex items-center gap-1.5"
            >
              Watch Creation
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* 3. Main Projects Feed Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#ded9cf] pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#151515]">
              {selectedChip === "all" ? "All Published Creations" : CATEGORY_CHIPS.find(c => c.id === selectedChip)?.label}
            </h2>
            <span className="text-xs font-mono font-semibold text-[#8c857b]">
              ({filteredProjects.length})
            </span>
          </div>

          <Link
            href="/explore"
            className="text-xs font-semibold text-[#0f766e] hover:underline flex items-center gap-1"
          >
            Explore Directory &rarr;
          </Link>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={`${project.creatorId}-${project.slug}`}
                project={project}
              />
            ))}
          </div>
        ) : (
          <div className="surface p-12 text-center rounded-2xl border border-[#ded9cf] space-y-3">
            <Compass className="mx-auto text-[#8c857b]" size={32} />
            <p className="text-sm font-bold text-[#151515]">
              No creations found in this category yet
            </p>
            <p className="text-xs text-[#6f6a61] max-w-sm mx-auto">
              Be the first creator to publish an original work in this discipline.
            </p>
            <Link
              href="/studio/upload"
              className="button-primary inline-flex text-xs !px-4 !py-2 mt-2 font-bold"
            >
              + Create in Studio
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

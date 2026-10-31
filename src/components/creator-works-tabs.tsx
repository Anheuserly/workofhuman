"use client";

import { useState, useMemo } from "react";
import { Project } from "@/lib/home-data";
import { ProjectCard } from "@/components/project-card";
import {
  Layers,
  Video,
  Sparkles,
  Palette,
  Music,
  ArrowUpDown,
  Search,
} from "lucide-react";

export function CreatorWorksTabs({
  initialProjects,
  isOwner = false,
}: {
  initialProjects: Project[];
  isOwner?: boolean;
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "likes" | "views">("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Helper checkers
  function isVideo(p: Project) {
    return (
      p.mediaUrls?.some((u) => /\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i.test(u)) ||
      ["films", "short_movies", "cinematic_edits", "animations", "ai_films", "video"].includes(p.type)
    );
  }

  function isAudio(p: Project) {
    return (
      p.mediaUrls?.some((u) => /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(u)) ||
      ["music", "songs", "podcasts", "audio_tracks"].includes(p.type)
    );
  }

  // Calculate counts for categories present in creator's works
  const counts = useMemo(() => {
    let videos = 0;
    let ai = 0;
    let audio = 0;
    let art = 0;

    projects.forEach((p) => {
      if (isVideo(p)) videos++;
      if (p.aiGenerated) ai++;
      if (isAudio(p)) audio++;
      if (!isVideo(p) && !isAudio(p)) art++;
    });

    return { all: projects.length, videos, ai, audio, art };
  }, [projects]);

  // Filter & Sort
  const filteredProjects = useMemo(() => {
    let list = [...projects];

    if (selectedCategory === "videos") {
      list = list.filter(isVideo);
    } else if (selectedCategory === "ai") {
      list = list.filter((p) => p.aiGenerated);
    } else if (selectedCategory === "audio") {
      list = list.filter(isAudio);
    } else if (selectedCategory === "art") {
      list = list.filter((p) => !isVideo(p) && !isAudio(p));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === "likes") {
      list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (sortBy === "views") {
      list.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      // Newest first by publishedAt or createdAt
      list.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return list;
  }, [projects, selectedCategory, sortBy, searchQuery]);

  function handleProjectDeleted(slug: string) {
    setProjects((prev) => prev.filter((p) => p.slug !== slug && p.id !== slug));
  }

  return (
    <div className="space-y-6">
      {/* Category Pills & Sorting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#ded9cf]">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[#151515] text-white shadow-xs"
                : "bg-white text-[#6f6a61] border border-[#ded9cf] hover:text-[#151515] hover:border-[#151515]"
            }`}
          >
            <Layers size={13} />
            All Works
            <span className="ml-1 opacity-70 font-mono">({counts.all})</span>
          </button>

          {counts.videos > 0 && (
            <button
              type="button"
              onClick={() => setSelectedCategory("videos")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                selectedCategory === "videos"
                  ? "bg-[#0f766e] text-white shadow-xs"
                  : "bg-white text-[#6f6a61] border border-[#ded9cf] hover:text-[#0f766e] hover:border-[#0f766e]"
              }`}
            >
              <Video size={13} />
              Videos &amp; Cinema
              <span className="ml-1 opacity-70 font-mono">({counts.videos})</span>
            </button>
          )}

          {counts.ai > 0 && (
            <button
              type="button"
              onClick={() => setSelectedCategory("ai")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                selectedCategory === "ai"
                  ? "bg-[#0f766e] text-white shadow-xs"
                  : "bg-white text-[#6f6a61] border border-[#ded9cf] hover:text-[#0f766e] hover:border-[#0f766e]"
              }`}
            >
              <Sparkles size={13} />
              AI Works
              <span className="ml-1 opacity-70 font-mono">({counts.ai})</span>
            </button>
          )}

          {counts.art > 0 && (
            <button
              type="button"
              onClick={() => setSelectedCategory("art")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                selectedCategory === "art"
                  ? "bg-[#151515] text-white shadow-xs"
                  : "bg-white text-[#6f6a61] border border-[#ded9cf] hover:text-[#151515] hover:border-[#151515]"
              }`}
            >
              <Palette size={13} />
              Visual Art
              <span className="ml-1 opacity-70 font-mono">({counts.art})</span>
            </button>
          )}

          {counts.audio > 0 && (
            <button
              type="button"
              onClick={() => setSelectedCategory("audio")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                selectedCategory === "audio"
                  ? "bg-[#151515] text-white shadow-xs"
                  : "bg-white text-[#6f6a61] border border-[#ded9cf] hover:text-[#151515] hover:border-[#151515]"
              }`}
            >
              <Music size={13} />
              Audio
              <span className="ml-1 opacity-70 font-mono">({counts.audio})</span>
            </button>
          )}
        </div>

        {/* Sort & Search Controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8c857b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search works..."
              className="bg-white border border-[#ded9cf] text-xs text-[#151515] placeholder:text-[#8c857b] rounded-lg pl-7 pr-2.5 py-1 w-32 sm:w-40 focus:border-[#0f766e] focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#6f6a61]">
            <ArrowUpDown size={13} className="text-[#8c857b]" />
            <span className="text-[11px] uppercase font-bold text-[#8c857b] hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "likes" | "views")}
              className="bg-white border border-[#ded9cf] text-xs font-semibold text-[#151515] rounded-lg px-2.5 py-1 focus:border-[#0f766e] focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="likes">Most Appreciated</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Creations */}
      {filteredProjects.length === 0 ? (
        <div className="surface p-12 text-center rounded-2xl border border-dashed border-[#ded9cf] space-y-2">
          <p className="text-sm font-bold text-[#151515]">No creations in this category</p>
          <p className="text-xs text-[#6f6a61]">
            Try switching filter tabs or checking back later for new releases.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id || project.slug}
              project={project}
              isOwner={isOwner}
              onDeleted={() => handleProjectDeleted(project.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

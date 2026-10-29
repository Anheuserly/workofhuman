"use client";

import { useState, useMemo } from "react";
import { Search, Sparkles, User, SlidersHorizontal, X } from "lucide-react";
import type { Project } from "@/lib/home-data";
import { ProjectCard } from "@/components/project-card";

export function ExploreFeed({
  initialProjects,
  initialTag,
}: {
  initialProjects: Project[];
  initialTag?: string;
}) {
  const [search, setSearch] = useState(initialTag ? `#${initialTag}` : "");
  const [provenanceFilter, setProvenanceFilter] = useState<"all" | "human" | "ai">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Disciplines" },
    { id: "digital_art", label: "Digital Art" },
    { id: "films", label: "Films & Shorts" },
    { id: "music", label: "Music & Audio" },
    { id: "animations", label: "Animations" },
    { id: "3d_models", label: "3D & Spatial" },
    { id: "stories", label: "Stories & Writing" },
    { id: "coding_projects", label: "Software & Apps" },
  ];

  const filteredProjects = useMemo(() => {
    return initialProjects.filter((project) => {
      // 1. Provenance filter
      if (provenanceFilter === "human" && project.aiGenerated) return false;
      if (provenanceFilter === "ai" && !project.aiGenerated) return false;

      // 2. Category filter
      if (selectedCategory !== "all") {
        if (!project.type.toLowerCase().includes(selectedCategory)) return false;
      }

      // 3. Search query
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase().replace(/^#/, "");

      const matchTitle = project.title.toLowerCase().includes(q);
      const matchDesc = project.description.toLowerCase().includes(q);
      const matchCreator = (project.creatorName || "").toLowerCase().includes(q);
      const matchUsername = (project.creatorUsername || "").toLowerCase().includes(q);
      const matchTag = project.tags?.some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchDesc || matchCreator || matchUsername || matchTag;
    });
  }, [initialProjects, search, provenanceFilter, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Search & Transparency Filters Bar */}
      <div className="surface p-4 sm:p-6 rounded-2xl border border-[#ded9cf] space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c857b]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, tag (#sadavocado), creator handle, or discipline..."
              className="w-full rounded-xl border border-[#ded9cf] bg-[#fcfbfa] pl-10 pr-9 py-2.5 text-xs text-[#151515] placeholder:text-[#8c857b] focus:border-[#0f766e] focus:bg-white focus:outline-none transition shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c857b] hover:text-[#151515] cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Provenance Craftsmanship Toggle */}
          <div className="flex items-center gap-1 rounded-xl bg-[#f6f4ef] p-1 border border-[#ded9cf] shrink-0">
            <button
              type="button"
              onClick={() => setProvenanceFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                provenanceFilter === "all"
                  ? "bg-white text-[#151515] shadow-xs"
                  : "text-[#6f6a61] hover:text-[#151515]"
              }`}
            >
              All Works
            </button>
            <button
              type="button"
              onClick={() => setProvenanceFilter("human")}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                provenanceFilter === "human"
                  ? "bg-white text-[#151515] shadow-xs"
                  : "text-[#6f6a61] hover:text-[#151515]"
              }`}
            >
              <User size={13} className="text-[#6f6a61]" />
              Human Made
            </button>
            <button
              type="button"
              onClick={() => setProvenanceFilter("ai")}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                provenanceFilter === "ai"
                  ? "bg-[#0f766e] text-white shadow-xs"
                  : "text-[#6f6a61] hover:text-[#151515]"
              }`}
            >
              <Sparkles size={13} />
              AI Disclosed
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <SlidersHorizontal size={14} className="text-[#8c857b] shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-3 py-1 font-semibold transition shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#151515] text-white"
                  : "bg-[#f6f4ef] text-[#6f6a61] hover:bg-[#e9e4da] hover:text-[#151515]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-bold text-[#6f6a61]">
            Showing <strong className="text-[#151515]">{filteredProjects.length}</strong> creations
          </p>
          {(search || provenanceFilter !== "all" || selectedCategory !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setProvenanceFilter("all");
                setSelectedCategory("all");
              }}
              className="text-xs font-semibold text-[#0f766e] hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filteredProjects.map((project) => (
              <ProjectCard project={project} key={`${project.creatorId}-${project.slug}`} />
            ))}
          </div>
        ) : (
          <div className="surface p-12 text-center text-[#6f6a61] rounded-2xl border border-dashed border-[#ded9cf] space-y-2">
            <h4 className="text-sm font-bold text-[#151515]">No matching creations found</h4>
            <p className="text-xs max-w-sm mx-auto">
              Try adjusting your search terms or clearing the craftsmanship filters to discover more works.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

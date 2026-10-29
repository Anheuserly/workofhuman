import Link from "next/link";
import { ArrowRight, Palette, Film, Music, BookOpen, Code, Lightbulb, Sparkles } from "lucide-react";
import { PageShell, SectionIntro } from "@/components/shell";

export const metadata = {
  title: "Creative Disciplines & Mediums | The Work of Human",
  description: "Browse works across all 33 creative mediums supported by The Work of Human.",
};

const categoryClusters = [
  {
    title: "Visual Arts & Design",
    icon: Palette,
    description: "Original static visual expressions, fine art, photography, 3D, and environmental design.",
    items: [
      "digital_art",
      "paintings",
      "photography",
      "ui_ux_design",
      "graphic_design",
      "3d_models",
      "fashion_design",
      "architecture",
    ],
  },
  {
    title: "Cinema & Motion",
    icon: Film,
    description: "Motion pictures, narrative shorts, documentary essays, and animation.",
    items: ["films", "short_movies", "cinematic_edits", "documentaries", "animations"],
  },
  {
    title: "Sound & Music",
    icon: Music,
    description: "Full compositions, vocal tracks, narrative podcasts, and acoustic experiments.",
    items: ["music", "songs", "podcasts", "audio_tracks"],
  },
  {
    title: "Literature & Thought",
    icon: BookOpen,
    description: "Original long-form writing, stories, poetry, architectural critiques, and essays.",
    items: ["books", "stories", "poetry", "articles", "blogs"],
  },
  {
    title: "Code, Software & Games",
    icon: Code,
    description: "Open-source software, indie games, interactive systems, and digital utilities.",
    items: ["coding_projects", "websites", "apps", "indie_games"],
  },
  {
    title: "Inventions & Physical Crafts",
    icon: Lightbulb,
    description: "Physical crafts, tangible inventions, startup prototypes, and studio discoveries.",
    items: ["inventions", "startup_ideas", "handmade_crafts", "experimental_projects"],
  },
  {
    title: "Transparent AI Disciplines",
    icon: Sparkles,
    description: "Experimental synthetic creations with transparent disclosure of model provenance.",
    items: ["ai_generated_art", "ai_music", "ai_films"],
  },
];

export default function CategoriesPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro
          eyebrow="Taxonomy of Creation"
          title="33 Creative Disciplines"
          body="The Work of Human treats every creative medium with equal rigor. Explore specialized archives, filter by discipline, or publish your own work."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {categoryClusters.map((cluster) => {
            const Icon = cluster.icon;
            return (
              <div key={cluster.title} className="surface p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-lg bg-[#0f766e]/10 text-[#0f766e]">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-[#151515]">{cluster.title}</h3>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[#6f6a61]">
                    {cluster.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {cluster.items.map((item) => (
                      <Link
                        key={item}
                        href={`/categories/${item}`}
                        className="rounded-full bg-[#f6f4ef] px-3 py-1 text-xs font-semibold text-[#151515] border border-[#ded9cf] hover:border-[#0f766e] hover:bg-white transition"
                      >
                        {item.replaceAll("_", " ")}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#ded9cf]">
                  <Link
                    href={`/categories/${cluster.items[0]}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f766e] hover:underline"
                  >
                    Explore {cluster.title.split(" ")[0]}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}

import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { EmptyState, PageShell, SectionIntro } from "@/components/shell";
import { getHomeData } from "@/lib/home-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Creations & Transparent Process | The Work of Human",
  description:
    "AI creations, clearly labeled and discoverable with full provenance, tools disclosure, and human involvement breakdown.",
  alternates: {
    canonical: "https://theworkofhuman.com/ai",
  },
  openGraph: {
    title: "Transparent AI Creations & Process — The Work of Human",
    description:
      "The AI hub surfaces generated and AI-assisted projects without hiding provenance from viewers.",
    url: "https://theworkofhuman.com/ai",
    siteName: "The Work of Human",
    type: "website",
  },
};

export default async function AiPage() {
  const homeData = await getHomeData();
  const aiProjects = homeData.status === "ready" ? homeData.aiProjects : [];

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro
          eyebrow="AI creations"
          title="AI work, clearly labeled and discoverable."
          body="The AI hub surfaces generated and AI-assisted projects without hiding provenance from viewers."
        />
        {aiProjects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {aiProjects.map((project) => (
              <ProjectCard project={project} key={`${project.creatorId}-${project.slug}`} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No AI-tagged creations yet"
            body="Transparently disclosed AI creations will be cataloged here once published."
          />
        )}
      </section>
    </PageShell>
  );
}

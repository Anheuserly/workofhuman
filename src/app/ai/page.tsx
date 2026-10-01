import { ProjectCard } from "@/components/project-card";
import { EmptyState, PageShell, SectionIntro } from "@/components/shell";
import { getHomeData } from "@/lib/home-data";

export const dynamic = "force-dynamic";

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

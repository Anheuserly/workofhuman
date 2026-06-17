import { ProjectCard } from "@/components/project-card";
import { PageShell, SectionIntro } from "@/components/shell";
import { getHomeData, getStarterHomeData } from "@/lib/home-data";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  const homeData = await getHomeData();
  const data = homeData.status === "ready" ? homeData : getStarterHomeData();

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro
          eyebrow="AI creations"
          title="AI work, clearly labeled and discoverable."
          body="The AI hub surfaces generated and AI-assisted projects without hiding provenance from viewers."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.aiProjects.map((project) => (
            <ProjectCard project={project} key={`${project.creatorId}-${project.slug}`} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}

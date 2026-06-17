import { ProjectCard } from "@/components/project-card";
import { PageShell, SectionIntro } from "@/components/shell";
import { getHomeData, getStarterHomeData } from "@/lib/home-data";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const homeData = await getHomeData();
  const data = homeData.status === "ready" ? homeData : getStarterHomeData();

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro
          eyebrow="Explore"
          title="A living atlas of creative output."
          body="Browse every medium with Appwrite-backed discovery, AI labels, creator metadata, and category paths."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.projects.map((project) => (
            <ProjectCard project={project} key={`${project.creatorId}-${project.slug}`} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}

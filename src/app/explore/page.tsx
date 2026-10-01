import { ProjectCard } from "@/components/project-card";
import { EmptyState, PageShell, SectionIntro } from "@/components/shell";
import { getHomeData } from "@/lib/home-data";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const homeData = await getHomeData();
  const projects = homeData.status === "ready" ? homeData.projects : [];

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro
          eyebrow="Explore"
          title="A living atlas of creative output."
          body="Browse every medium with database-backed discovery, AI labels, creator metadata, and category paths."
        />
        {projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard project={project} key={`${project.creatorId}-${project.slug}`} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No published creations yet"
            body="No projects are currently published in the database. Creators can publish work through the upload studio."
          />
        )}
      </section>
    </PageShell>
  );
}

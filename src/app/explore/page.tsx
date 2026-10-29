import { PageShell, SectionIntro } from "@/components/shell";
import { getHomeData } from "@/lib/home-data";
import { ExploreFeed } from "@/components/explore-feed";

export const dynamic = "force-dynamic";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: Promise<{ tag?: string }>;
}) {
  const homeData = await getHomeData();
  const projects = homeData.status === "ready" ? homeData.projects : [];
  const params = searchParams ? await searchParams : {};

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-12 sm:py-16">
        <div className="mb-8">
          <SectionIntro
            eyebrow="Explore Directory"
            title="A living atlas of creative output"
            body="Discover independent cinema, original music, digital art, stories, and transparent AI-assisted experiments."
          />
        </div>

        <ExploreFeed initialProjects={projects} initialTag={params?.tag} />
      </section>
    </PageShell>
  );
}

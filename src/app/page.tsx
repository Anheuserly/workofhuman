import { PageShell } from "@/components/shell";
import { getHomeData } from "@/lib/home-data";
import { HomeProjectFeed } from "@/components/home-project-feed";

export const dynamic = "force-dynamic";

export default async function Home() {
  const homeData = await getHomeData();
  const projects = homeData.status === "ready" ? homeData.projects : [];

  return (
    <PageShell>
      <div className="py-2">
        <HomeProjectFeed projects={projects} />
      </div>
    </PageShell>
  );
}

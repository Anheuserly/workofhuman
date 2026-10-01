import { UsersRound } from "lucide-react";
import Link from "next/link";
import { EmptyState, PageShell, SectionIntro } from "@/components/shell";
import { getHomeData } from "@/lib/home-data";

export const dynamic = "force-dynamic";

export default async function CommunitiesPage() {
  const homeData = await getHomeData();
  const communities = homeData.status === "ready" ? homeData.communities : [];

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro
          eyebrow="Communities"
          title="Creative neighborhoods for every medium."
          body="Curated creative hubs with active member communities, featured showcases, and collaborative studios."
        />
        {communities.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {communities.map((community) => (
              <Link className="surface block p-6 transition hover:border-[#0f766e]" href={`/communities/${community.slug}`} key={community.slug}>
                <UsersRound className="text-[#0f766e]" size={28} />
                <h2 className="mt-8 text-3xl font-semibold">{community.name}</h2>
                <p className="mt-3 min-h-14 text-[#6f6a61]">{community.description}</p>
                <p className="mt-8 text-sm text-[#837c70]">{community.memberCount ?? 0} members</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No creative communities yet"
            body="Communities will appear here as creative collectives, circles, and disciplinary guilds are established."
          />
        )}
      </section>
    </PageShell>
  );
}

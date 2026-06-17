import { Flame } from "lucide-react";
import { PageShell, SectionIntro } from "@/components/shell";
import { getHomeData, getStarterHomeData } from "@/lib/home-data";

export const dynamic = "force-dynamic";

export default async function TrendingPage() {
  const homeData = await getHomeData();
  const data = homeData.status === "ready" ? homeData : getStarterHomeData();

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro
          eyebrow="Trending"
          title="Signals from the creative pulse."
          body="Trending cache documents keep rankings fast while Appwrite projects remain the source of truth."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.trending.map((item) => (
            <article className="surface p-6" key={`${item.period}-${item.projectId}`}>
              <Flame className="text-[#c2410c]" size={28} />
              <p className="mt-8 text-sm uppercase tracking-[0.18em] text-[#837c70]">{item.period}</p>
              <h2 className="mt-3 text-3xl font-semibold">Rank {item.rank}</h2>
              <p className="mt-3 font-mono text-sm text-[#6f6a61]">{item.projectId}</p>
              <p className="mt-6 text-[#5f5a52]">Score {item.score}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

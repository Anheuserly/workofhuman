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
          body="Real-time trending algorithms track velocity, likes, views, and community saves across all creative mediums."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.trending.map((item) => (
            <article className="surface p-6 transition hover:border-[#c2410c]" key={`${item.period}-${item.projectId}`}>
              <div className="flex items-center justify-between">
                <Flame className="text-[#c2410c]" size={28} />
                <span className="text-xs uppercase tracking-[0.18em] font-semibold text-[#837c70]">{item.period}</span>
              </div>
              <h2 className="mt-5 text-2xl font-semibold">
                {item.project?.title || item.projectId.replaceAll("-", " ")}
              </h2>
              {item.project?.creatorName && (
                <p className="mt-1 text-sm text-[#0f766e] font-medium">{item.project.creatorName}</p>
              )}
              <div className="mt-6 flex items-center justify-between border-t border-[#ded9cf] pt-4 text-sm text-[#5f5a52]">
                <span className="font-bold text-lg text-[#151515]">Rank #{item.rank}</span>
                <span>Score {item.score}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

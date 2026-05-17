import { ArrowRight, Database, ImageIcon, Sparkles, UploadCloud, UsersRound } from "lucide-react";
import { getHomeData, type HomeData } from "@/lib/home-data";

export const dynamic = "force-dynamic";

const navItems = ["Explore", "Trending", "AI Creations", "Communities", "Marketplace"];

export default async function Home() {
  const data = await getHomeData();

  if (data.status !== "ready") {
    return <AppwriteState data={data} />;
  }

  const hasContent =
    data.settings &&
    data.creations.length > 0 &&
    data.creators.length > 0 &&
    data.categories.length > 0 &&
    data.communities.length > 0;

  if (!hasContent) {
    return <EmptyDatabaseState />;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <section className="relative isolate min-h-[92svh] px-5 py-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_20%,rgba(124,58,237,0.28),transparent_34%),radial-gradient(circle_at_80%_16%,rgba(6,182,212,0.22),transparent_30%),radial-gradient(circle_at_58%_78%,rgba(244,63,94,0.2),transparent_34%),linear-gradient(180deg,#070707_0%,#111111_48%,#050505_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-[#050505] to-transparent" />
        <div className="absolute left-1/2 top-24 -z-10 h-[520px] w-[min(940px,92vw)] -translate-x-1/2 overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] shadow-2xl shadow-violet-950/30">
          <div className="hero-visual h-full w-full" />
        </div>

        <Header />

        <div className="mx-auto flex min-h-[calc(92svh-84px)] max-w-7xl flex-col justify-end pb-10 pt-24">
          <div className="max-w-5xl animate-rise">
            <p className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/78 backdrop-blur-xl">
              {data.settings!.eyebrow}
            </p>
            <h1 className="text-balance text-5xl font-semibold leading-[0.95] text-white sm:text-7xl lg:text-8xl">
              {data.settings!.heading}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
              {data.settings!.subheading}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a className="button-primary" href={data.settings!.primaryCtaHref}>
                {data.settings!.primaryCtaLabel}
                <ArrowRight size={18} />
              </a>
              <a className="button-secondary" href={data.settings!.secondaryCtaHref}>
                {data.settings!.secondaryCtaLabel}
                <UploadCloud size={18} />
              </a>
            </div>
          </div>

          <div className="mt-14 grid gap-3 sm:grid-cols-3">
            {data.metrics.map((metric) => (
              <div className="border-t border-white/15 py-4 text-sm uppercase tracking-[0.16em] text-white/58" key={metric.label}>
                <strong className="block text-2xl font-semibold normal-case tracking-normal text-white">{metric.value}</strong>
                {metric.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="explore" className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionIntro eyebrow="Trending now" title="Creations moving through culture." />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.creations.map((creation) => (
              <article className="creation-card group" key={creation.title}>
                <div
                  className="relative h-56 overflow-hidden bg-zinc-900"
                  style={{ backgroundColor: creation.accentColor }}
                >
                  {creation.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={creation.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      src={creation.thumbnailUrl}
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-white/72">
                      <ImageIcon size={36} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/12 to-transparent" />
                  <p className="absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold backdrop-blur">
                    {creation.contentType}
                  </p>
                </div>
                <div className="p-5">
                  <h3 className="text-2xl font-semibold">{creation.title}</h3>
                  <div className="mt-7 flex items-center justify-between gap-3 text-sm text-white/62">
                    <span>{creation.creatorName}</span>
                    <span>{creation.statLabel}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="ai-creations" className="border-y border-white/10 bg-white/[0.03] px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="section-eyebrow text-rose-300">AI creations spotlight</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              Transparent AI publishing, built into the culture.
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/66">
              AI-assisted and fully AI-generated work stays clearly labeled,
              searchable, recommendable, and ready for creator communities.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.aiSpotlights.map((item) => (
              <article className="rounded-[8px] border border-white/10 bg-black/30 p-5" key={item.title}>
                <Sparkles className="mb-8 text-cyan-300" size={28} />
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/56">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="section-eyebrow text-violet-300">Top creators</p>
            <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
              {data.creators.map((creator, index) => (
                <article className="grid gap-4 py-6 sm:grid-cols-[72px_1fr_auto] sm:items-center" key={creator.displayName}>
                  <span className="text-4xl font-semibold text-white/20">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="flex items-center gap-2 text-2xl font-semibold">
                      {creator.displayName}
                      {creator.verified ? <Sparkles className="text-cyan-300" size={18} /> : null}
                    </h3>
                    <p className="mt-1 text-white/56">{creator.category}</p>
                  </div>
                  <p className="text-sm text-white/58">{creator.statLabel}</p>
                </article>
              ))}
            </div>
          </div>

          <div id="communities" className="rounded-[8px] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6">
            <UsersRound className="text-cyan-300" size={30} />
            <p className="section-eyebrow mt-5 text-cyan-300">Featured communities</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Find your creative neighborhood.</h2>
            <div className="mt-8 grid gap-3">
              {data.communities.map((community) => (
                <a className="community-link" href={`/communities/${community.slug}`} key={community.slug}>
                  <span>{community.name}</span>
                  <span className="text-white/46">{community.memberCountLabel}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="section-eyebrow text-rose-300">Explore by category</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {data.categories.map((category) => (
              <a className="category-pill" href={`/categories/${category.slug}`} key={category.slug}>
                {category.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div id="upload" className="flex flex-col justify-between rounded-[8px] bg-white p-7 text-black">
            <div>
              <UploadCloud size={32} />
              <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-black/52">Upload Studio</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight">
                Publish any medium from one expressive studio.
              </h2>
            </div>
            <a className="mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-zinc-800" href="/upload">
              Create a project
              <ArrowRight size={18} />
            </a>
          </div>
          <div className="rounded-[8px] border border-white/10 bg-white/[0.03] p-6">
            <p className="section-eyebrow text-cyan-300">Infinite feed</p>
            <div className="mt-5 divide-y divide-white/10">
              {data.feedItems.map((item) => (
                <p className="py-5 text-lg leading-8 text-white/72" key={item.body}>
                  <span className="mr-3 text-sm font-semibold uppercase tracking-[0.14em] text-white/34">{item.contentType}</span>
                  {item.body}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-10 text-sm text-white/52 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row">
          <p>WorkOfHuman.com</p>
          <p>{data.settings!.footerText}</p>
        </div>
      </footer>
    </main>
  );
}

function Header() {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-5 rounded-full border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-xl">
      <a href="#" className="flex items-center gap-3" aria-label="WorkOfHuman home">
        <span className="grid size-9 place-items-center rounded-full bg-white text-sm font-black text-black">W</span>
        <span className="text-sm font-semibold tracking-[0.18em] text-white/90">WORKOFHUMAN</span>
      </a>
      <nav className="hidden items-center gap-6 text-sm text-white/68 lg:flex">
        {navItems.map((item) => (
          <a className="transition hover:text-white" href={`#${item.toLowerCase().replaceAll(" ", "-")}`} key={item}>
            {item}
          </a>
        ))}
      </nav>
      <a className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-200" href="/upload">
        Start Creating
      </a>
    </header>
  );
}

function SectionIntro({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="section-eyebrow text-cyan-300">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
      </div>
      <a className="text-sm font-semibold text-white/70 transition hover:text-white" href="/trending">
        View all trending
      </a>
    </div>
  );
}

function AppwriteState({ data }: { data: Extract<HomeData, { status: "missing-config" | "error" }> }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#050505] px-5 text-white">
      <section className="max-w-2xl rounded-[8px] border border-white/10 bg-white/[0.04] p-8">
        <Database className="text-cyan-300" size={36} />
        <h1 className="mt-6 text-4xl font-semibold tracking-tight">Connect Appwrite Database</h1>
        {data.status === "missing-config" ? (
          <p className="mt-4 leading-7 text-white/68">
            The homepage is database-driven. Add these environment variables and run the Appwrite seed script before launching the app:
            <span className="mt-4 block rounded-[8px] border border-white/10 bg-black/35 p-4 font-mono text-sm text-white/78">
              {data.missingEnv.join("\n")}
            </span>
          </p>
        ) : (
          <p className="mt-4 leading-7 text-white/68">{data.message}</p>
        )}
      </section>
    </main>
  );
}

function EmptyDatabaseState() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#050505] px-5 text-white">
      <section className="max-w-2xl rounded-[8px] border border-white/10 bg-white/[0.04] p-8">
        <Database className="text-cyan-300" size={36} />
        <h1 className="mt-6 text-4xl font-semibold tracking-tight">Appwrite is connected, but content is missing.</h1>
        <p className="mt-4 leading-7 text-white/68">
          Create documents in the homepage, creations, creators, categories, communities, metrics, AI spotlights, and feed item collections.
          The UI renders only Appwrite documents, so empty collections stay empty instead of showing placeholder content.
        </p>
      </section>
    </main>
  );
}

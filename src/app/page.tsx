import { ArrowRight, ShieldCheck, Sparkles, UploadCloud, UsersRound, WandSparkles } from "lucide-react";
import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { PageShell, SectionIntro } from "@/components/shell";
import { defaultHomeSettings, getHomeData } from "@/lib/home-data";
import { contentTypes, featureMatrix } from "@/lib/platform";

export const dynamic = "force-dynamic";

export default async function Home() {
  const homeData = await getHomeData();
  const data =
    homeData.status === "ready"
      ? homeData
      : {
          status: "ready" as const,
          settings: defaultHomeSettings,
          projects: [],
          aiProjects: [],
          creators: [],
          communities: [],
          trending: [],
          categories: [...contentTypes],
        };
  const settings = data.settings ?? defaultHomeSettings;

  const heroP0 = data.projects[0];
  const heroP1 = data.projects[1];
  const heroP2 = data.projects[2];
  const heroP3 = data.projects[3];

  const heroP0Href = heroP0 ? `/@${heroP0.creatorShortId || heroP0.creatorUsername || "creator"}/${heroP0.slug}` : "/explore";
  const heroP1Href = heroP1 ? `/@${heroP1.creatorShortId || heroP1.creatorUsername || "creator"}/${heroP1.slug}` : "/explore";
  const heroP2Href = heroP2 ? `/@${heroP2.creatorShortId || heroP2.creatorUsername || "creator"}/${heroP2.slug}` : "/explore";
  const heroP3Href = heroP3 ? `/@${heroP3.creatorShortId || heroP3.creatorUsername || "creator"}/${heroP3.slug}` : "/explore";

  return (
    <PageShell>
      {/* Hero Showcase Section */}
      <section className="mb-14">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[#d8d2c7] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#5f5a52] shadow-2xs">
              {settings.eyebrow}
            </p>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-[#151515] sm:text-6xl lg:text-7xl leading-[1.05]">
              {settings.heading}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#5f5a52] sm:text-lg">
              {settings.subheading}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link className="button-primary inline-flex items-center gap-2 !px-5 !py-2.5 text-xs font-bold" href={settings.primaryCtaHref}>
                {settings.primaryCtaLabel}
                <ArrowRight size={15} />
              </Link>
              <Link className="button-secondary inline-flex items-center gap-2 !px-5 !py-2.5 text-xs font-bold" href={settings.secondaryCtaHref}>
                {settings.secondaryCtaLabel}
                <UploadCloud size={15} />
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                ["Creative mediums", data.categories.length],
                ["Published works", data.projects.length],
                ["AI-labeled works", data.aiProjects.length],
              ].map(([label, value]) => (
                <div className="border-t border-[#d8d2c7] pt-3 text-[11px] font-bold uppercase tracking-wider text-[#6f6a61]" key={label}>
                  <strong className="block text-2xl font-bold normal-case tracking-tight text-[#151515]">{value}</strong>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {data.projects.length === 1 && heroP0 ? (
            /* Single Featured Creation Spotlight Card - No Empty Dummy Placeholders */
            <div className="relative group rounded-2xl overflow-hidden border border-[#ded9cf] bg-white shadow-xs hover:shadow-md transition">
              <Link href={heroP0Href} className="block relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-[#151515]">
                {heroP0.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={heroP0.title}
                    src={heroP0.thumbnailUrl}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#151515] text-white/50 text-xs font-mono">
                    Featured Creation
                  </div>
                )}

                {/* Subtle dark gradient overlay for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white border border-white/10">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    Featured Creation
                  </div>

                  <span className="rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-[#151515] uppercase tracking-wider capitalize shadow-2xs">
                    {heroP0.type.replaceAll("_", " ")}
                  </span>
                </div>

                {/* Bottom Content Overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1.5">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm group-hover:text-emerald-300 transition line-clamp-1">
                    {heroP0.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-white/80 font-mono">
                    <span>@{heroP0.creatorUsername || heroP0.creatorShortId || "creator"}</span>
                    {heroP0.aiGenerated && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-[#0f766e]/90 text-white px-2 py-0.5 rounded-full font-sans font-semibold">
                        <Sparkles size={11} />
                        AI Disclosed
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Card Footer Bar */}
              <div className="p-4 sm:p-5 flex items-center justify-between bg-white border-t border-[#ded9cf] gap-3">
                <p className="text-xs text-[#6f6a61] line-clamp-1 flex-1">
                  {heroP0.description || "Original creative work on The Work of Human."}
                </p>
                <Link
                  href={heroP0Href}
                  className="button-primary shrink-0 text-xs !py-1.5 !px-3.5 font-bold"
                >
                  Experience Work &rarr;
                </Link>
              </div>
            </div>
          ) : data.projects.length > 1 ? (
            /* Multi-card grid for 2+ real creations */
            <div className="grid min-h-[460px] grid-cols-12 gap-3">
              <Link href={heroP0Href} className="media-tile col-span-7 row-span-4 rounded-xl relative overflow-hidden bg-[#e6dfd1] group block transition hover:ring-2 hover:ring-[#0f766e] border border-[#ded9cf]">
                {heroP0?.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={heroP0.title}
                    src={heroP0.thumbnailUrl}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full flex-col justify-between p-6">
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#0f766e] w-fit shadow-xs">
                      {heroP0?.type || "Creative Showcase"}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-[#151515] group-hover:text-[#0f766e] transition">{heroP0?.title}</h3>
                      <p className="mt-1.5 text-xs text-[#5f5a52] line-clamp-2">{heroP0?.description}</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Featured Creation
                </div>
              </Link>

              {heroP1 && (
                <Link href={heroP1Href} className="media-tile col-span-5 row-span-3 rounded-xl relative overflow-hidden bg-[#ded7c8] group block transition hover:ring-2 hover:ring-[#0f766e] border border-[#ded9cf]">
                  {heroP1.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={heroP1.title}
                      src={heroP1.thumbnailUrl}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="flex h-full flex-col justify-between p-5">
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#0f766e] w-fit shadow-xs">
                      {heroP1.type || "Featured Study"}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-[#151515] group-hover:text-[#0f766e] transition">{heroP1.title}</h4>
                      <p className="mt-1 text-xs text-[#5f5a52] line-clamp-1">{heroP1.creatorName}</p>
                    </div>
                  </div>
                </Link>
              )}

              {heroP2 && (
                <Link href={heroP2Href} className="media-tile col-span-4 row-span-2 rounded-xl relative overflow-hidden bg-[#e3ddd1] group block transition hover:ring-2 hover:ring-[#0f766e] border border-[#ded9cf]">
                  {heroP2.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={heroP2.title}
                      src={heroP2.thumbnailUrl}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="flex h-full flex-col justify-center p-3">
                    <span className="text-[10px] font-semibold text-[#0f766e]">{heroP2.type}</span>
                    <p className="mt-0.5 font-bold text-[#151515] text-xs line-clamp-1 group-hover:text-[#0f766e] transition">{heroP2.title}</p>
                  </div>
                </Link>
              )}

              {heroP3 && (
                <Link href={heroP3Href} className="media-tile col-span-8 row-span-2 rounded-xl relative overflow-hidden bg-[#ede7dc] group block transition hover:ring-2 hover:ring-[#0f766e] border border-[#ded9cf]">
                  {heroP3.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={heroP3.title}
                      src={heroP3.thumbnailUrl}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="flex h-full flex-col justify-center p-4">
                    <span className="text-[10px] font-semibold text-[#0f766e]">{heroP3.type}</span>
                    <p className="mt-0.5 font-bold text-[#151515] text-xs line-clamp-1 group-hover:text-[#0f766e] transition">{heroP3.title}</p>
                  </div>
                </Link>
              )}
            </div>
          ) : (
            <div className="surface p-8 sm:p-10 flex flex-col justify-between shadow-xs min-h-[420px] rounded-2xl border border-[#ded9cf]">
              <div>
                <span className="section-eyebrow text-[#0f766e]">Platform Manifesto</span>
                <h3 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-[#151515] leading-tight">
                  Independent work across every creative discipline.
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-[#6f6a61] max-w-lg">
                  No sample or placeholder projects are displayed. The stage is live for real creators to publish works with transparent AI disclosure and attribution.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {data.categories.slice(0, 10).map((cat) => (
                    <span
                      key={cat}
                      className="rounded-full bg-[#f6f4ef] px-2.5 py-1 text-[11px] font-semibold text-[#504b44] border border-[#ded9cf]"
                    >
                      {cat.replaceAll("_", " ")}
                    </span>
                  ))}
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0f766e] border border-[#0f766e]/30">
                    +23 more disciplines
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-[#ded9cf] flex items-center justify-between">
                <p className="text-[11px] text-[#8c857b]">Database connected: PostgreSQL</p>
                <Link href="/studio/upload" className="button-primary !py-1.5 text-xs">
                  <UploadCloud size={14} />
                  Publish First Creation
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 border-t border-[#ded9cf]">
        <SectionIntro eyebrow="Trending now" title="Creations moving through culture." href="/trending" />
        {data.projects.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.projects.slice(0, 12).map((project) => (
              <ProjectCard project={project} key={`${project.creatorId}-${project.slug}`} />
            ))}
          </div>
        ) : (
          <EmptyContent />
        )}
      </section>

      {/* Transparent AI Hub Banner */}
      <section className="rounded-2xl bg-[#151515] p-6 sm:p-10 text-white my-12 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="section-eyebrow text-rose-300">AI creations hub</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-4xl">
              Transparent AI publishing, built into the culture.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              AI-assisted and fully AI-generated work stays clearly labeled, searchable, recommendable, and ready for creator communities.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["AI content tagging", "Label AI-assisted and fully AI-generated creations with transparent metadata."],
              ["AI discovery", "Personalize search, recommendations, and category exploration around creator intent."],
              ["Generated thumbnails", "Prepare adaptive visuals for films, tracks, stories, apps, and experiments."],
              ["Creator assistant", "Help creators caption, describe, and package original work for discovery."],
            ].map(([title, body]) => (
              <article className="rounded-xl border border-white/10 bg-white/[0.05] p-4.5" key={title}>
                <WandSparkles className="mb-4 text-[#f4a261]" size={22} />
                <h3 className="text-base font-bold text-white">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/60">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Top Creators & Communities Grid */}
      <section className="py-10 border-t border-[#ded9cf]">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <div className="flex items-center justify-between">
              <p className="section-eyebrow text-[#0f766e]">Top Creators</p>
              <Link
                href="/explore"
                className="text-xs font-semibold text-[#6f6a61] hover:text-[#151515] transition"
              >
                View all &rarr;
              </Link>
            </div>

            <div className="mt-6 divide-y divide-[#ded9cf] border-y border-[#ded9cf]">
              {data.creators.length > 0 ? (
                data.creators.slice(0, 8).map((creator, index) => {
                  const creatorRef = creator.shortId || creator.username;
                  return (
                    <Link
                      href={`/@${creatorRef}`}
                      className="group grid gap-4 py-4 sm:grid-cols-[48px_1fr_auto] sm:items-center hover:bg-[#faf8f5] px-2 -mx-2 rounded-lg transition"
                      key={creator.userId}
                    >
                      <span className="text-2xl font-bold font-mono text-[#c8c0b2] group-hover:text-[#0f766e] transition">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="flex items-center gap-3 min-w-0">
                        {creator.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={creator.avatarUrl}
                            alt={creator.displayName || creator.username}
                            className="size-9 rounded-full object-cover border border-[#ded9cf] shrink-0"
                          />
                        ) : (
                          <div className="grid size-9 place-items-center rounded-full bg-[#0f766e] text-white font-bold text-xs uppercase shrink-0">
                            {(creator.displayName || creator.username).slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="flex items-center gap-1.5 text-base font-bold text-[#151515] group-hover:text-[#0f766e] transition truncate">
                            {creator.displayName ?? creator.username}
                            {creator.verified ? <Sparkles className="text-[#0f766e] shrink-0" size={14} /> : null}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-[#6f6a61] font-mono">
                            <span>@{creator.username}</span>
                            {creator.shortId && (
                              <span className="rounded bg-[#ded9cf]/50 px-1.5 py-0.2 text-[10px] text-[#504b44]">
                                ID: {creator.shortId}
                              </span>
                            )}
                          </div>
                          {creator.bio && (
                            <p className="mt-1 text-xs text-[#6f6a61] line-clamp-1">{creator.bio}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-[#8c857b] whitespace-nowrap">
                        {creator.followersCount ?? 0} followers
                      </p>
                    </Link>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-[#8c857b] space-y-2">
                  <p className="font-semibold text-[#151515]">No creators registered yet</p>
                  <p>Be among the first to establish a portfolio on The Work of Human.</p>
                  <Link href="/register" className="button-primary inline-flex text-xs !px-4 !py-1.5 mt-2">
                    Join as Creator
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="surface p-6 rounded-2xl border border-[#ded9cf]">
            <UsersRound className="text-[#0f766e]" size={26} />
            <p className="section-eyebrow mt-4 text-[#0f766e]">Featured communities</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#151515]">Find your creative neighborhood.</h2>
            <div className="mt-6 grid gap-2.5">
              {data.communities.map((community) => (
                <Link className="flex justify-between items-center gap-4 p-3.5 rounded-xl border border-[#ded9cf] bg-white text-[#504b44] transition hover:border-[#0f766e] hover:text-[#151515] hover:shadow-2xs" href={`/communities/${community.slug}`} key={community.slug}>
                  <span className="text-xs font-bold">{community.name}</span>
                  <span className="text-[11px] text-[#837c70] font-mono">{community.memberCount ?? 0} members</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Explore by Category */}
      <section className="py-10 border-t border-[#ded9cf]">
        <SectionIntro
          eyebrow="Explore by category"
          title="Every medium gets a doorway."
          body="Music, films, writing, apps, inventions, fashion, architecture, games, AI experiments, and the beautiful formats still being invented."
        />
        <div className="flex flex-wrap gap-2.5">
          {data.categories.map((category) => (
            <Link className="rounded-full bg-white border border-[#ded9cf] px-3.5 py-1.5 text-xs font-semibold text-[#504b44] hover:bg-[#151515] hover:text-white transition" href={`/categories/${category}`} key={category}>
              {category.replaceAll("_", " ")}
            </Link>
          ))}
        </div>
      </section>

      {/* Upload Studio Banner */}
      <section className="py-10 border-t border-[#ded9cf]">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-between rounded-2xl bg-[#151515] p-7 text-white">
            <div>
              <UploadCloud size={28} className="text-[#0f766e]" />
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/50">Upload Studio</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">Publish any medium from one expressive studio.</h2>
            </div>
            <Link className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-[#151515] transition hover:bg-[#e8e2d8]" href="/studio/upload">
              Create a Project
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className="surface p-6 rounded-2xl border border-[#ded9cf]">
            <p className="section-eyebrow text-[#0f766e]">Platform system</p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {featureMatrix.map((feature) => (
                <div className="flex items-center gap-2.5 rounded-xl border border-[#ded9cf] bg-[#fbfaf7] p-3 text-xs text-[#5f5a52] font-medium" key={feature}>
                  <ShieldCheck className="shrink-0 text-[#0f766e]" size={16} />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function EmptyContent() {
  return (
    <div className="surface p-8 sm:p-12 text-center max-w-xl mx-auto my-8">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#0f766e]/10 text-[#0f766e]">
        <Sparkles size={24} />
      </div>
      <h3 className="mt-4 text-xl font-bold text-[#151515]">No published creations yet</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6f6a61]">
        Be the first creator to share your work with the world. Publish authentic human craftsmanship or transparent AI experiments across 33 creative mediums.
      </p>
      <Link href="/studio/upload" className="button-primary mt-6 inline-flex text-xs">
        <UploadCloud size={15} />
        Publish First Creation
      </Link>
    </div>
  );
}

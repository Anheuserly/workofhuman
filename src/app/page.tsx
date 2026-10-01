import { ArrowRight, ShieldCheck, Sparkles, UploadCloud, UsersRound, WandSparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { SectionIntro, SiteHeader } from "@/components/shell";
import { defaultHomeSettings, getHomeData, getStarterHomeData } from "@/lib/home-data";
import { featureMatrix } from "@/lib/platform";

export const dynamic = "force-dynamic";

export default async function Home() {
  const homeData = await getHomeData();
  const data = homeData.status === "ready" ? homeData : getStarterHomeData();
  const settings = data.settings ?? defaultHomeSettings;

  return (
    <main className="min-h-screen overflow-hidden text-[#151515]">
      <section className="relative isolate min-h-[92svh] px-5 py-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-20 bg-[#f6f4ef]" />
        <div className="absolute right-0 top-0 -z-10 h-full w-[42vw] bg-[#ebe6dc] max-lg:hidden" />

        <SiteHeader />

        <div className="mx-auto grid min-h-[calc(92svh-84px)] max-w-7xl gap-12 pb-10 pt-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <div>
              <p className="mb-5 inline-flex rounded-full border border-[#d8d2c7] bg-white/80 px-4 py-2 text-sm text-[#5f5a52] shadow-sm backdrop-blur-xl">
                {settings.eyebrow}
              </p>
              <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[0.95] text-[#151515] sm:text-7xl lg:text-8xl">
                {settings.heading}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f5a52] sm:text-xl">{settings.subheading}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link className="button-primary" href={settings.primaryCtaHref}>
                  {settings.primaryCtaLabel}
                  <ArrowRight size={18} />
                </Link>
                <Link className="button-secondary" href={settings.secondaryCtaHref}>
                  {settings.secondaryCtaLabel}
                  <UploadCloud size={18} />
                </Link>
              </div>
            </div>

            <div className="mt-14 grid gap-3 sm:grid-cols-3">
              {[
                ["Creative mediums", data.categories.length],
                ["Published works", data.projects.length],
                ["AI-labeled works", data.aiProjects.length],
              ].map(([label, value]) => (
                <div className="border-t border-[#d8d2c7] py-4 text-sm uppercase tracking-[0.16em] text-[#6f6a61]" key={label}>
                  <strong className="block text-2xl font-semibold normal-case tracking-normal text-[#151515]">{value}</strong>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="grid min-h-[520px] grid-cols-12 grid-rows-6 gap-3 max-lg:min-h-[420px] max-sm:hidden">
            <div className="media-tile col-span-7 row-span-4 rounded-[8px]">
              <Image alt="Film production workspace" src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80" fill sizes="(min-width: 1024px) 38vw, 80vw" priority />
            </div>
            <div className="media-tile col-span-5 row-span-3 rounded-[8px]">
              <Image alt="Design desk with screens" src="https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80" fill sizes="(min-width: 1024px) 28vw, 60vw" priority />
            </div>
            <div className="col-span-5 row-span-2 rounded-[8px] border border-[#d8d2c7] bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f766e]">Live system</p>
              <p className="mt-3 text-3xl font-semibold">{data.categories.length}</p>
              <p className="mt-1 text-sm text-[#6f6a61]">creative formats indexed</p>
            </div>
            <div className="media-tile col-span-4 row-span-2 rounded-[8px]">
              <Image alt="Music studio equipment" src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80" fill sizes="24vw" priority />
            </div>
            <div className="media-tile col-span-8 row-span-2 rounded-[8px]">
              <Image alt="Prototype materials and objects" src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80" fill sizes="42vw" priority />
            </div>
          </div>
          <div className="media-tile h-72 rounded-[8px] sm:hidden">
            <Image alt="Creative workspace" src="https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80" fill sizes="92vw" priority />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionIntro eyebrow="Trending now" title="Creations moving through culture." href="/trending" />
          {data.projects.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {data.projects.slice(0, 12).map((project) => (
                <ProjectCard project={project} key={`${project.creatorId}-${project.slug}`} />
              ))}
            </div>
          ) : (
            <EmptyContent />
          )}
        </div>
      </section>

      <section className="border-y border-[#ded9cf] bg-[#151515] px-5 py-20 text-white sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="section-eyebrow text-rose-300">AI creations hub</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              Transparent AI publishing, built into the culture.
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/66">
              AI-assisted and fully AI-generated work stays clearly labeled, searchable, recommendable, and ready for creator communities.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["AI content tagging", "Label AI-assisted and fully AI-generated creations with transparent metadata."],
              ["AI discovery", "Personalize search, recommendations, and category exploration around creator intent."],
              ["Generated thumbnails", "Prepare adaptive visuals for films, tracks, stories, apps, and experiments."],
              ["Creator assistant", "Help creators caption, describe, and package original work for discovery."],
            ].map(([title, body]) => (
              <article className="rounded-[8px] border border-white/12 bg-white/[0.06] p-5" key={title}>
                <WandSparkles className="mb-8 text-[#f4a261]" size={28} />
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="section-eyebrow text-[#0f766e]">Top creators</p>
            <div className="mt-6 divide-y divide-[#ded9cf] border-y border-[#ded9cf]">
              {data.creators.slice(0, 8).map((creator, index) => (
                <article className="grid gap-4 py-6 sm:grid-cols-[72px_1fr_auto] sm:items-center" key={creator.userId}>
                  <span className="text-4xl font-semibold text-[#c8c0b2]">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="flex items-center gap-2 text-2xl font-semibold">
                      {creator.displayName ?? creator.username}
                      {creator.verified ? <Sparkles className="text-[#0f766e]" size={18} /> : null}
                    </h3>
                    <p className="mt-1 text-[#6f6a61]">{creator.bio ?? creator.categories?.join(", ")}</p>
                  </div>
                  <p className="text-sm text-[#6f6a61]">{creator.followersCount ?? 0} followers</p>
                </article>
              ))}
            </div>
          </div>

          <div className="surface p-6">
            <UsersRound className="text-[#0f766e]" size={30} />
            <p className="section-eyebrow mt-5 text-[#0f766e]">Featured communities</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Find your creative neighborhood.</h2>
            <div className="mt-8 grid gap-3">
              {data.communities.map((community) => (
                <Link className="surface flex justify-between gap-4 p-4 text-[#504b44] transition hover:border-[#0f766e] hover:text-[#151515]" href={`/communities/${community.slug}`} key={community.slug}>
                  <span>{community.name}</span>
                  <span className="text-[#837c70]">{community.memberCount ?? 0} members</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Explore by category"
            title="Every medium gets a doorway."
            body="Music, films, writing, apps, inventions, fashion, architecture, games, AI experiments, and the beautiful formats still being invented."
          />
          <div className="flex flex-wrap gap-3">
            {data.categories.map((category) => (
              <Link className="pill" href={`/categories/${category}`} key={category}>
                {category.replaceAll("_", " ")}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-between rounded-[8px] bg-[#151515] p-7 text-white">
            <div>
              <UploadCloud size={32} />
              <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-white/52">Upload Studio</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight">Publish any medium from one expressive studio.</h2>
            </div>
            <Link className="mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#151515] transition hover:bg-[#e8e2d8]" href="/studio/upload">
              Create a project
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="surface p-6">
            <p className="section-eyebrow text-[#0f766e]">Platform system</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {featureMatrix.map((feature) => (
                <div className="flex items-center gap-3 rounded-[8px] border border-[#ded9cf] bg-[#fbfaf7] p-4 text-[#5f5a52]" key={feature}>
                  <ShieldCheck className="shrink-0 text-[#0f766e]" size={18} />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#ded9cf] px-5 py-10 text-sm text-[#6f6a61] sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row">
          <p>WorkOfHuman.com</p>
          <p>{settings.footerText}</p>
        </div>
      </footer>
    </main>
  );
}

function EmptyContent() {
  return (
    <div className="surface p-8">
      <h3 className="text-2xl font-semibold">Database is connected, but no published projects were returned.</h3>
      <p className="mt-3 max-w-2xl leading-7 text-[#6f6a61]">
        The UI is ready for database content. Publish projects in the studio or run database seeding to populate the discovery surfaces.
      </p>
    </div>
  );
}

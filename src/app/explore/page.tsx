import type { Metadata } from "next";
import { PageShell, SectionIntro } from "@/components/shell";
import { getHomeData } from "@/lib/home-data";
import { ExploreFeed } from "@/components/explore-feed";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore Works & Disciplines | The Work of Human",
  description:
    "Discover curated independent human craftsmanship and transparent AI-assisted cinema, fine art, writing, music, architecture, and technology.",
  alternates: {
    canonical: "https://theworkofhuman.com/explore",
  },
  openGraph: {
    title: "Explore Works & Disciplines — The Work of Human",
    description:
      "A living atlas of creative output. Discover independent cinema, original music, digital art, stories, and transparent AI-assisted experiments.",
    url: "https://theworkofhuman.com/explore",
    siteName: "The Work of Human",
    type: "website",
  },
};

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

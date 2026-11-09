import type { Metadata } from "next";
import { PageShell, SectionIntro } from "@/components/shell";
import { ProjectCard } from "@/components/project-card";
import { getProjectsByCategory } from "@/lib/home-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const words = slug.replaceAll("_", " ").replaceAll("-", " ").split(" ");
  const capitalized = words
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");

  return {
    title: `${capitalized} | The Work of Human`,
    description: `Browse curated, verified creations in ${capitalized}. Discover independent works archived on The Work of Human.`,
    alternates: {
      canonical: `https://theworkofhuman.com/categories/${slug}`,
    },
    openGraph: {
      title: `${capitalized} — The Work of Human`,
      description: `Browse curated, verified creations in ${capitalized}. Discover independent works archived on The Work of Human.`,
      url: `https://theworkofhuman.com/categories/${slug}`,
      siteName: "The Work of Human",
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const label = slug.replaceAll("_", " ").replaceAll("-", " ");
  const projects = await getProjectsByCategory(slug);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro
          eyebrow="Category"
          title={label}
          body={`Browse independent, verified works curated under ${label}.`}
        />
        {projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard project={project} key={`${project.creatorId}-${project.slug}`} />
            ))}
          </div>
        ) : (
          <div className="surface p-8 text-[#6f6a61]">
            No works published in this category yet. Be the first to publish in this medium!
          </div>
        )}
      </section>
    </PageShell>
  );
}

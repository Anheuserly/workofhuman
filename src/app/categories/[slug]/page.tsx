import { PageShell, SectionIntro } from "@/components/shell";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const label = slug.replaceAll("_", " ").replaceAll("-", " ");

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro
          eyebrow="Category"
          title={label}
          body="This route is ready to query the projects collection by type and paginate through Appwrite documents."
        />
        <div className="surface p-8 text-white/66">Category feed wiring: projects where `type` equals `{slug}`.</div>
      </section>
    </PageShell>
  );
}

import { PageShell, SectionIntro } from "@/components/shell";

export default async function ProjectDetailPage({ params }: { params: Promise<{ username: string; projectSlug: string }> }) {
  const { username, projectSlug } = await params;

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro
          eyebrow={username.replace(/^%40/, "@")}
          title={projectSlug.replaceAll("-", " ")}
          body="Project detail pages are ready for media galleries, comments, interactions, related work, and AI metadata."
        />
        <div className="surface p-8 text-white/66">Project wiring: projects.slug equals `{projectSlug}`.</div>
      </section>
    </PageShell>
  );
}

import { PageShell, SectionIntro } from "@/components/shell";

export default async function CommunityDetailPage({ params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params;

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro
          eyebrow="Community"
          title={communityId.replaceAll("-", " ")}
          body="Community detail pages can combine community documents, community_members, discussion threads, and featured projects."
        />
        <div className="surface p-8 text-white/66">Community feed wiring: communities.slug equals `{communityId}`.</div>
      </section>
    </PageShell>
  );
}

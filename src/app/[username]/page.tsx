import { PageShell, SectionIntro } from "@/components/shell";

export default async function CreatorProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro
          eyebrow="Creator profile"
          title={username.replace(/^%40/, "@")}
          body="Profile pages are prepared for Appwrite profile, follower, pinned project, and creator stats queries."
        />
        <div className="surface p-8 text-white/66">Profile wiring: profiles.username equals this route slug.</div>
      </section>
    </PageShell>
  );
}

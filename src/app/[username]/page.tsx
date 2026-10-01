import { PageShell, SectionIntro } from "@/components/shell";
import { ProjectCard } from "@/components/project-card";
import { getProfileByUsername } from "@/lib/home-data";
import { Users, Eye, BadgeCheck } from "lucide-react";

export default async function CreatorProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { profile, projects } = await getProfileByUsername(username);

  const cleanHandle = username.replace(/^[@%40]+/, "");

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-16">
        <SectionIntro
          eyebrow="Creator Profile"
          title={profile?.displayName || `@${cleanHandle}`}
          body={profile?.bio || `Independent portfolio and creative archive of @${cleanHandle}.`}
        />

        {profile && (
          <div className="mb-10 flex flex-wrap items-center gap-6 border-b border-[#ded9cf] pb-6 text-sm text-[#5f5a52]">
            {profile.verified && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f766e]/10 px-3 py-1 font-semibold text-[#0f766e]">
                <BadgeCheck size={16} /> Verified Creator
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Users size={16} className="text-[#6f6a61]" />
              <strong>{profile.followersCount?.toLocaleString() || 0}</strong> followers
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Eye size={16} className="text-[#6f6a61]" />
              <strong>{profile.viewsCount?.toLocaleString() || 0}</strong> views
            </span>
          </div>
        )}

        <div>
          <h3 className="mb-6 text-xl font-bold text-[#151515]">Published Works</h3>
          {projects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {projects.map((project) => (
                <ProjectCard project={project} key={`${project.creatorId}-${project.slug}`} />
              ))}
            </div>
          ) : (
            <div className="surface p-8 text-[#6f6a61]">
              No published projects found for this creator profile yet.
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

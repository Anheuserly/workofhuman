import { getProjectBySlug, getProfileByUsername } from "@/lib/home-data";
import Link from "next/link";
import { PageShell } from "@/components/shell";

export const dynamic = "force-dynamic";

export default async function CreatorProjectShortcutPage({
  params,
}: {
  params: Promise<{ creatorId: string; projectSlug: string }>;
}) {
  const { creatorId, projectSlug } = await params;
  const decodedCreator = decodeURIComponent(creatorId || "").trim().replace(/^[@%40]+/, "");

  const project = await getProjectBySlug(projectSlug);
  const { profile } = await getProfileByUsername(decodedCreator);
  const targetCreator = profile?.shortId || project?.creatorShortId || profile?.username || project?.creatorUsername || decodedCreator;
  const targetSlug = project?.slug || projectSlug;
  const targetUrl = `/@${targetCreator}/${targetSlug}`;

  return (
    <PageShell>
      <div className="mx-auto max-w-md py-20 text-center space-y-4">
        <meta httpEquiv="refresh" content={`0;url=${targetUrl}`} />
        <p className="text-sm text-[#6f6a61]">Connecting to creation...</p>
        <Link href={targetUrl} className="button-primary text-xs font-semibold !px-4 !py-2">
          Open Creation ({project?.title || targetSlug})
        </Link>
      </div>
    </PageShell>
  );
}

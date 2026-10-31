import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/home-data";
import Link from "next/link";
import { PageShell } from "@/components/shell";

export const dynamic = "force-dynamic";

export default async function VideoShortcutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectBySlug(id);
  if (!project) notFound();

  const creator = project.creatorUsername || project.creatorName || "creator";
  const targetUrl = `/@${creator}/${project.slug}`;

  return (
    <PageShell>
      <div className="mx-auto max-w-md py-20 text-center space-y-4">
        <meta httpEquiv="refresh" content={`0;url=${targetUrl}`} />
        <p className="text-sm text-[#6f6a61]">Connecting to creation...</p>
        <Link href={targetUrl} className="button-primary text-xs font-semibold !px-4 !py-2">
          Open Creation ({project.title})
        </Link>
      </div>
    </PageShell>
  );
}

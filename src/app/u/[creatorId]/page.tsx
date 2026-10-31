import { getProfileByUsername } from "@/lib/home-data";
import Link from "next/link";
import { PageShell } from "@/components/shell";

export const dynamic = "force-dynamic";

export default async function CreatorShortcutPage({
  params,
}: {
  params: Promise<{ creatorId: string }>;
}) {
  const { creatorId } = await params;
  const decoded = decodeURIComponent(creatorId || "").trim();
  const cleanId = decoded.replace(/^[@%40]+/, "");

  const { profile } = await getProfileByUsername(cleanId);
  const targetHandle = profile?.shortId || profile?.username || cleanId;
  const targetUrl = `/@${targetHandle}`;

  return (
    <PageShell>
      <div className="mx-auto max-w-md py-20 text-center space-y-4">
        <meta httpEquiv="refresh" content={`0;url=${targetUrl}`} />
        <p className="text-sm text-[#6f6a61]">Connecting to creator profile...</p>
        <Link href={targetUrl} className="button-primary text-xs font-semibold !px-4 !py-2">
          Open Profile (@{targetHandle})
        </Link>
      </div>
    </PageShell>
  );
}

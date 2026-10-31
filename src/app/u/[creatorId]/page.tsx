import { redirect } from "next/navigation";
import { getProfileByUsername } from "@/lib/home-data";

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

  redirect(`/@${targetHandle}`);
}

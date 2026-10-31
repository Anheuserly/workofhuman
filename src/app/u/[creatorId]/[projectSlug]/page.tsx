import { redirect, notFound } from "next/navigation";
import { getProjectBySlug, getProfileByUsername } from "@/lib/home-data";

export const dynamic = "force-dynamic";

export default async function CreatorProjectShortcutPage({
  params,
}: {
  params: Promise<{ creatorId: string; projectSlug: string }>;
}) {
  const { creatorId, projectSlug } = await params;
  const decodedCreator = decodeURIComponent(creatorId || "").trim().replace(/^[@%40]+/, "");

  const project = await getProjectBySlug(projectSlug);
  if (!project) notFound();

  const { profile } = await getProfileByUsername(decodedCreator);
  const targetCreator = profile?.shortId || project.creatorShortId || profile?.username || project.creatorUsername || decodedCreator;

  redirect(`/@${targetCreator}/${project.slug}`);
}

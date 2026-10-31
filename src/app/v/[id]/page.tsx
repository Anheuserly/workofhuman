import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/home-data";
import Link from "next/link";
import { PageShell } from "@/components/shell";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectBySlug(id);

  if (!project) {
    return {
      title: "Creation Not Found | The Work of Human",
      description: "The requested creation could not be located on The Work of Human.",
    };
  }

  const siteOrigin = "https://theworkofhuman.com";
  const creatorDisplay = project.creatorName || project.creatorUsername || "creator";
  const title = `${project.title} • by ${creatorDisplay} | The Work of Human`;
  const rawDescription = project.description?.trim();
  const description = rawDescription
    ? (rawDescription.length > 200 ? rawDescription.slice(0, 197) + "..." : rawDescription)
    : `Experience "${project.title}" by ${creatorDisplay} on The Work of Human.`;

  let ogImage = project.thumbnailUrl;
  if (ogImage && ogImage.startsWith("/")) {
    ogImage = `${siteOrigin}${ogImage}`;
  }

  const videoUrl =
    project.mediaUrls?.find((u) => /\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i.test(u)) ||
    (project.thumbnailUrl && /\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i.test(project.thumbnailUrl)
      ? project.thumbnailUrl
      : undefined);

  const absoluteVideoUrl = videoUrl
    ? (videoUrl.startsWith("/") ? `${siteOrigin}${videoUrl}` : videoUrl)
    : undefined;

  const targetCreator = project.creatorShortId || project.creatorUsername || "creator";
  const pageUrl = `${siteOrigin}/@${targetCreator}/${project.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: absoluteVideoUrl ? "video.other" : "article",
      siteName: "The Work of Human",
      title: project.title,
      description,
      url: pageUrl,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1280,
              height: 720,
              alt: project.title,
            },
          ]
        : [],
      videos: absoluteVideoUrl
        ? [
            {
              url: absoluteVideoUrl,
              secureUrl: absoluteVideoUrl,
              type: "video/mp4",
              width: 1280,
              height: 720,
            },
          ]
        : undefined,
    },
    twitter: {
      card: absoluteVideoUrl ? "player" : "summary_large_image",
      title: project.title,
      description,
      images: ogImage ? [ogImage] : [],
      players: absoluteVideoUrl
        ? [
            {
              playerUrl: pageUrl,
              streamUrl: absoluteVideoUrl,
              width: 1280,
              height: 720,
            },
          ]
        : undefined,
    },
  };
}

export default async function VideoShortcutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectBySlug(id);
  if (!project) notFound();

  const creator = project.creatorShortId || project.creatorUsername || project.creatorName || "creator";
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

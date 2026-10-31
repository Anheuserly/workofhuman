import type { Metadata } from "next";
import { getProjectBySlug, getProfileByUsername } from "@/lib/home-data";
import Link from "next/link";
import { PageShell } from "@/components/shell";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ creatorId: string; projectSlug: string }>;
}): Promise<Metadata> {
  const { creatorId, projectSlug } = await params;
  const decodedCreator = decodeURIComponent(creatorId || "").trim().replace(/^[@%40]+/, "");
  const [project, { profile }] = await Promise.all([
    getProjectBySlug(projectSlug),
    getProfileByUsername(decodedCreator),
  ]);

  if (!project) {
    return {
      title: "Creation Not Found | The Work of Human",
      description: "The requested creation could not be located on The Work of Human.",
    };
  }

  const siteOrigin = "https://theworkofhuman.com";
  const creatorDisplay = profile?.displayName || project.creatorName || profile?.username || project.creatorUsername || "creator";
  const title = `${project.title} • by ${creatorDisplay} | The Work of Human`;
  const rawDescription = (project.description || "").replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
  const description = rawDescription
    ? `by ${creatorDisplay} • ${rawDescription.length > 180 ? rawDescription.slice(0, 177) + "..." : rawDescription}`
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

  const targetCreator = profile?.shortId || project.creatorShortId || profile?.username || project.creatorUsername || decodedCreator;
  const pageUrl = `${siteOrigin}/@${targetCreator}/${project.slug}`;

  return {
    title,
    description,
    authors: [
      {
        name: creatorDisplay,
        url: `${siteOrigin}/@${targetCreator}`,
      },
    ],
    creator: creatorDisplay,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "article",
      siteName: `The Work of Human • ${creatorDisplay}`,
      title: project.title,
      description,
      url: pageUrl,
      authors: [creatorDisplay],
      images: ogImage
        ? [
            {
              url: ogImage,
              secureUrl: ogImage,
              width: 1200,
              height: 675,
              type: "image/jpeg",
              alt: `${project.title} by ${creatorDisplay}`,
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
      card: "summary_large_image",
      site: "@theworkofhuman",
      creator: `@${project.creatorUsername || creatorDisplay}`,
      title: `${project.title} • ${creatorDisplay}`,
      description,
      images: ogImage ? [ogImage] : [],
    },
    other: {
      "author": creatorDisplay,
      "article:author": creatorDisplay,
    },
  };
}

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

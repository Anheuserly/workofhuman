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

  const targetCreator = project.creatorShortId || project.creatorUsername || "creator";
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

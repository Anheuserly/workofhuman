import type { Metadata } from "next";
import { PageShell } from "@/components/shell";
import { getHomeData } from "@/lib/home-data";
import { HomeProjectFeed } from "@/components/home-project-feed";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "The Work of Human — The World's Creative Output",
  },
  description:
    "A permanent, curated archive of serious human creative work and transparent AI-assisted craftsmanship across cinema, fine art, writing, music, architecture, and technology.",
  alternates: {
    canonical: "https://theworkofhuman.com",
  },
  openGraph: {
    title: "The Work of Human — The World's Creative Output",
    description:
      "A permanent, curated archive of serious human creative work and transparent AI-assisted craftsmanship across cinema, fine art, writing, music, architecture, and technology.",
    url: "https://theworkofhuman.com",
    siteName: "The Work of Human",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "The Work of Human - The World's Creative Output",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Work of Human — The World's Creative Output",
    description:
      "A permanent, curated archive of serious human creative work and transparent AI-assisted craftsmanship across cinema, fine art, writing, music, architecture, and technology.",
    images: ["/og.png"],
  },
};

export default async function Home() {
  const homeData = await getHomeData();
  const projects = homeData.status === "ready" ? homeData.projects : [];
  const siteOrigin = "https://theworkofhuman.com";

  // Build ItemList / CollectionPage schema so Google knows every image belongs to a specific artwork entity
  const itemListElements = projects.slice(0, 30).map((project, index) => {
    const creatorHandle = (project.creatorShortId || project.creatorUsername || "creator").replace(/^@+/, "");
    const creatorName = project.creatorName || creatorHandle;
    const projectUrl = `${siteOrigin}/@${creatorHandle}/${project.slug}`;
    let imageUrl = project.thumbnailUrl;
    if (imageUrl && imageUrl.startsWith("/")) {
      imageUrl = `${siteOrigin}${imageUrl}`;
    }

    const isVideo =
      project.type.includes("film") ||
      project.type.includes("movie") ||
      project.type.includes("video") ||
      project.type.includes("animation");

    return {
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": isVideo ? "VideoObject" : "VisualArtwork",
        name: project.title,
        headline: project.title,
        description: project.description || `${project.title} by ${creatorName} on The Work of Human.`,
        url: projectUrl,
        ...(imageUrl
          ? {
              image: {
                "@type": "ImageObject",
                name: `${project.title} • by ${creatorName}`,
                contentUrl: imageUrl,
                thumbnailUrl: imageUrl,
                caption: project.description ? project.description.slice(0, 200) : `${project.title} by ${creatorName}`,
                creditText: `${creatorName} • The Work of Human`,
                copyrightNotice: `© ${new Date().getFullYear()} ${creatorName}. All rights reserved.`,
              },
              thumbnailUrl: imageUrl,
            }
          : {}),
        creator: {
          "@type": "Person",
          name: creatorName,
          url: `${siteOrigin}/@${creatorHandle}`,
        },
        author: {
          "@type": "Person",
          name: creatorName,
          url: `${siteOrigin}/@${creatorHandle}`,
        },
        artform: project.type,
      },
    };
  });

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${siteOrigin}/#collection`,
    name: "The Work of Human Curated Works Archive",
    description: "Curated collection of original creations across cinema, fine art, writing, music, architecture, and technology.",
    url: siteOrigin,
    mainEntity: {
      "@type": "ItemList",
      name: "Featured Creations",
      numberOfItems: itemListElements.length,
      itemListElement: itemListElements,
    },
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <div className="py-2">
        <HomeProjectFeed projects={projects} />
      </div>
    </PageShell>
  );
}

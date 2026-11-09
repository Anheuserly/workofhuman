import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });
const jetBrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://theworkofhuman.com"),
  title: {
    default: "The Work of Human | The World's Creative Output",
    template: "%s | The Work of Human",
  },
  description:
    "A global creative platform for human and AI-made music, films, paintings, literature, architecture, apps, and design.",
  applicationName: "The Work of Human",
  authors: [{ name: "The Work of Human" }],
  generator: "Next.js",
  keywords: [
    "The Work of Human",
    "creative portfolio",
    "paintings and fine art",
    "books and literature",
    "architecture design",
    "cinema and film",
    "AI creations",
    "music and audio",
    "coding projects",
    "independent creators",
    "digital art platform",
    "creative expression",
  ],
  alternates: {
    canonical: "https://theworkofhuman.com",
  },
  openGraph: {
    title: "The Work of Human — The World's Creative Output",
    description:
      "A global creative platform for human and AI-made music, films, paintings, literature, architecture, apps, and design.",
    url: "https://theworkofhuman.com",
    siteName: "The Work of Human",
    locale: "en_US",
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
      "A global creative platform for human and AI-made music, films, paintings, literature, architecture, apps, and design.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
    shortcut: "/favicon.svg",
  },
  other: {
    "geo.region": "US",
    "geo.placename": "Global",
    "rating": "General",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://theworkofhuman.com/#website",
      "url": "https://theworkofhuman.com",
      "name": "The Work of Human",
      "alternateName": [
        "TheWorkOfHuman",
        "Work of Human",
        "TWOH",
        "theworkofhuman.com"
      ],
      "description":
        "The Work of Human (theworkofhuman.com) is an active, live global creative publishing platform and permanent digital archive for original human craftsmanship and transparent AI-assisted creative work across art, music, cinema, literature, architecture, and technology.",
      "disambiguatingDescription":
        "The Work of Human (theworkofhuman.com) is an active, live independent creative publishing platform and permanent digital archive for original human craftsmanship and transparent AI-assisted works across art, literature, music, and design. It is an independent digital archive and platform launched in 2026, not affiliated with any philosophical publication or book.",
      "inLanguage": "en-US",
      "publisher": {
        "@id": "https://theworkofhuman.com/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://theworkofhuman.com/explore?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://theworkofhuman.com/#organization",
      "name": "The Work of Human",
      "alternateName": ["TheWorkOfHuman", "Work of Human"],
      "url": "https://theworkofhuman.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://theworkofhuman.com/icon.svg",
        "width": "512",
        "height": "512",
        "caption": "The Work of Human Emblem"
      },
      "image": "https://theworkofhuman.com/og.png",
      "foundingDate": "2026",
      "slogan": "The World's Creative Output",
      "description":
        "An active independent publishing platform and cultural archive dedicated to preserving serious creative expression across fine art, cinema, writing, music, architecture, and code.",
      "disambiguatingDescription":
        "The Work of Human is a live independent platform and digital archive hosted at theworkofhuman.com for creators, writers, filmmakers, and artists to archive their portfolio with transparent provenance.",
      "publishingPrinciples": "https://theworkofhuman.com/about",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "editorial and support",
        "email": "contact@theworkofhuman.com",
        "url": "https://theworkofhuman.com/about"
      },
      "mainEntityOfPage": "https://theworkofhuman.com",
      "sameAs": [
        "https://x.com/theworkofhuman"
      ],
      "knowsAbout": [
        "Fine Art & Paintings",
        "Cinema, Animation & Films",
        "Literature & Books",
        "Architecture & Spatial Design",
        "Music & Audio Production",
        "Open Source Software & Inventions",
        "Transparent AI Creative Tools"
      ]
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} h-full antialiased`}>
      <head>
        <link rel="alternate" type="application/rss+xml" title="The Work of Human — RSS Feed" href="/feed.xml" />
        <link rel="search" type="application/opensearchdescription+xml" title="The Work of Human" href="/opensearch.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}

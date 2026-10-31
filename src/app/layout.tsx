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
        url: "/api/media/1793308269305-847d0017139c57d757f55ed7-thumb.jpg",
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
    images: ["/api/media/1793308269305-847d0017139c57d757f55ed7-thumb.jpg"],
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
      "description":
        "A global creative platform for human and AI-made music, films, paintings, literature, architecture, apps, and design.",
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
      "url": "https://theworkofhuman.com",
      "logo": "https://theworkofhuman.com/icon.svg",
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}

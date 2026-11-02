import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/shell";
import { Sparkles, Globe, Palette, Film, BookOpen, Music, Building2, Code, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About The Work of Human | The World's Creative Output",
  description:
    "The Work of Human (theworkofhuman.com) is an active global publishing platform and digital archive for original human craftsmanship and transparent AI-assisted creative work.",
  alternates: {
    canonical: "https://theworkofhuman.com/about",
  },
  openGraph: {
    title: "About The Work of Human — The World's Creative Output",
    description:
      "An active global platform and digital archive dedicated to genuine human craftsmanship across fine art, cinema, literature, architecture, and music.",
    url: "https://theworkofhuman.com/about",
    siteName: "The Work of Human",
    type: "website",
  },
};

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "mainEntity": {
    "@type": "Organization",
    "name": "The Work of Human",
    "alternateName": "TheWorkOfHuman",
    "url": "https://theworkofhuman.com",
    "logo": "https://theworkofhuman.com/icon.svg",
    "foundingDate": "2026",
    "description":
      "The Work of Human (theworkofhuman.com) is an active, live global publishing platform and digital archive for independent creators across fine art, cinema, literature, architecture, music, and creative technology.",
    "knowsAbout": [
      "Fine Art & Paintings",
      "Independent Cinema & Animation",
      "Literature & Books",
      "Architecture & Spatial Design",
      "Original Music & Sound Design",
      "Creative Software & Inventions"
    ]
  }
};

export default function AboutPage() {
  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <div className="max-w-4xl mx-auto py-10 sm:py-16 px-4 sm:px-6 space-y-12">
        {/* Hero Section */}
        <div className="space-y-4 border-b border-[#ded9cf] pb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0f766e]/10 px-3.5 py-1 text-xs font-bold text-[#0f766e]">
            <Globe size={13} />
            <span>Active Global Platform • Founded 2026</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#151515] leading-tight">
            The World&apos;s Creative Output.
          </h1>
          <p className="text-base sm:text-lg text-[#555047] leading-relaxed max-w-2xl font-normal">
            <strong>The Work of Human</strong> (<code>theworkofhuman.com</code>) is an active, independent global publishing platform 
            and digital archive dedicated to celebrating serious creative expression across fine art, cinema, writing, music, architecture, and code.
          </p>
        </div>

        {/* The Core Mission */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="surface p-6 rounded-2xl border border-[#ded9cf] space-y-3">
            <div className="size-10 rounded-xl bg-[#0f766e]/10 grid place-items-center text-[#0f766e]">
              <Palette size={20} />
            </div>
            <h3 className="font-bold text-base text-[#151515]">Permanent Heritage</h3>
            <p className="text-xs text-[#6f6a61] leading-relaxed">
              Unlike fleeting social media algorithms that bury art after 24 hours, The Work of Human serves as a permanent, high-definition digital archive for your craft.
            </p>
          </div>

          <div className="surface p-6 rounded-2xl border border-[#ded9cf] space-y-3">
            <div className="size-10 rounded-xl bg-amber-500/10 grid place-items-center text-amber-700">
              <Sparkles size={20} />
            </div>
            <h3 className="font-bold text-base text-[#151515]">Transparent Provenance</h3>
            <p className="text-xs text-[#6f6a61] leading-relaxed">
              We clearly distinguish 100% human-crafted works from transparent AI-assisted experiments. Every piece carries its true creation story and attribution.
            </p>
          </div>

          <div className="surface p-6 rounded-2xl border border-[#ded9cf] space-y-3">
            <div className="size-10 rounded-xl bg-sky-500/10 grid place-items-center text-sky-700">
              <Globe size={20} />
            </div>
            <h3 className="font-bold text-base text-[#151515]">Global Geographic Identity</h3>
            <p className="text-xs text-[#6f6a61] leading-relaxed">
              Creations specify where on earth they were born—connecting independent artists and thinkers in Tokyo, Paris, Delhi, New York, and beyond.
            </p>
          </div>
        </div>

        {/* Creative Disciplines */}
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#151515]">
            Disciplines We Index &amp; Showcase
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold">
            <div className="p-4 rounded-xl border border-[#ded9cf] bg-white flex items-center gap-3">
              <Palette size={18} className="text-[#0f766e]" />
              <span>Paintings &amp; Fine Art</span>
            </div>
            <div className="p-4 rounded-xl border border-[#ded9cf] bg-white flex items-center gap-3">
              <Film size={18} className="text-[#0f766e]" />
              <span>Cinema, Film &amp; Animation</span>
            </div>
            <div className="p-4 rounded-xl border border-[#ded9cf] bg-white flex items-center gap-3">
              <BookOpen size={18} className="text-[#0f766e]" />
              <span>Books &amp; Literature</span>
            </div>
            <div className="p-4 rounded-xl border border-[#ded9cf] bg-white flex items-center gap-3">
              <Music size={18} className="text-[#0f766e]" />
              <span>Music &amp; Sound Design</span>
            </div>
            <div className="p-4 rounded-xl border border-[#ded9cf] bg-white flex items-center gap-3">
              <Building2 size={18} className="text-[#0f766e]" />
              <span>Architecture &amp; Spatial Design</span>
            </div>
            <div className="p-4 rounded-xl border border-[#ded9cf] bg-white flex items-center gap-3">
              <Code size={18} className="text-[#0f766e]" />
              <span>Code, Apps &amp; Inventions</span>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="surface p-8 sm:p-10 rounded-3xl border border-[#ded9cf] bg-gradient-to-br from-white via-[#faf8f5] to-[#f4f0e6] text-center space-y-4 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-black text-[#151515]">
            Publish Your Work to the World
          </h2>
          <p className="text-xs sm:text-sm text-[#6f6a61] max-w-lg mx-auto">
            Join independent creators worldwide. Share your art, films, writing, and designs with rich previews and zero ad interference.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/studio/upload" className="button-primary !py-2.5 !px-6 text-xs font-bold inline-flex items-center gap-1.5">
              Enter Creator Studio
              <ArrowRight size={14} />
            </Link>
            <Link href="/explore" className="button-secondary !py-2.5 !px-6 text-xs font-bold">
              Explore Creations
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

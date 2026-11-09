import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { PageShell, SectionIntro } from "@/components/shell";
import { MarketplaceFeed, type MarketplaceItem } from "@/components/marketplace-feed";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Digital Goods Marketplace | The Work of Human",
  description:
    "Discover, acquire, and download original 3D models, sound kits, digital prints, presets, design templates, and code directly from independent creators on The Work of Human.",
  alternates: {
    canonical: "https://theworkofhuman.com/marketplace",
  },
  openGraph: {
    title: "The Digital Goods Marketplace — The Work of Human",
    description:
      "Original 3D assets, audio sample packs, presets, digital prints, and templates by independent global creators.",
    url: "https://theworkofhuman.com/marketplace",
    siteName: "The Work of Human",
    type: "website",
  },
};

// Curated seed assets in case database table is newly initialized
const CURATED_SEED_LISTINGS: MarketplaceItem[] = [
  {
    id: "seed_3d_studio_pack",
    title: "Brutalist Architectural Form 3D Asset Kit",
    description:
      "A modular pack of 12 brutalist concrete structures, procedural concrete materials, and lighting presets for Blender 4.0+ and Unreal Engine 5. Free for personal & commercial use.",
    category: "3d_models",
    price: 0,
    currency: "USD",
    fileUrl: "https://theworkofhuman.com/icon.svg",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    status: "active",
    createdAt: new Date().toISOString(),
    creatorId: "creator_arch",
    creatorUsername: "humanity",
    creatorName: "The Work of Human Studio",
    creatorAvatar: "https://theworkofhuman.com/icon.svg",
    creatorShortId: "humanity",
    creatorSocialLinks: {
      upi: "creator@upi",
      buymeacoffee: "theworkofhuman",
    },
  },
  {
    id: "seed_analog_luts",
    title: "Cinematic 35mm Film Emulation LUTs",
    description:
      "Hand-tuned .CUBE lookup tables emulating Kodak Vision3 and Fuji 250D film stocks. Optimized for Rec.709, Apple Log, and Sony S-Log3 footage.",
    category: "presets_luts",
    price: 9.99,
    currency: "USD",
    fileUrl: "https://theworkofhuman.com/icon.svg",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80",
    status: "active",
    createdAt: new Date().toISOString(),
    creatorId: "creator_film",
    creatorUsername: "cinema",
    creatorName: "Analog Frames",
    creatorAvatar: "https://theworkofhuman.com/icon.svg",
    creatorShortId: "cinema",
    creatorSocialLinks: {
      kofi: "cinema",
      paypal: "cinema",
    },
  },
  {
    id: "seed_lofi_stems",
    title: "Tape Saturation Lo-Fi Drum & Melody Stems",
    description:
      "24 uncompressed 24-bit 48kHz WAV loops and drum one-shots captured directly onto vintage Reel-to-Reel tape. 100% royalty-free.",
    category: "audio_packs",
    price: 0,
    currency: "USD",
    fileUrl: "https://theworkofhuman.com/icon.svg",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80",
    status: "active",
    createdAt: new Date().toISOString(),
    creatorId: "creator_audio",
    creatorUsername: "soundcraft",
    creatorName: "SoundCraft Collective",
    creatorAvatar: "https://theworkofhuman.com/icon.svg",
    creatorShortId: "soundcraft",
    creatorSocialLinks: {
      upi: "sound@upi",
      buymeacoffee: "soundcraft",
    },
  },
  {
    id: "seed_minimal_editorial",
    title: "Minimal Editorial Publication System (Figma)",
    description:
      "Complete typography scale, grid system, and 40+ publication components designed specifically for independent journals and art monographs.",
    category: "ui_kits",
    price: 18.0,
    currency: "USD",
    fileUrl: "https://theworkofhuman.com/icon.svg",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    status: "active",
    createdAt: new Date().toISOString(),
    creatorId: "creator_design",
    creatorUsername: "editorial",
    creatorName: "Archival Design",
    creatorAvatar: "https://theworkofhuman.com/icon.svg",
    creatorShortId: "editorial",
    creatorSocialLinks: {
      paypal: "editorial",
      kofi: "editorial",
    },
  },
];

async function getMarketplaceListings(): Promise<MarketplaceItem[]> {
  try {
    const res = await query<MarketplaceItem>(
      `SELECT 
        m.id,
        m.title,
        m.description,
        m.category,
        m.price,
        m.currency,
        m.file_url as "fileUrl",
        COALESCE(m.thumbnail_url, p.thumbnail_url) as "thumbnailUrl",
        m.project_id as "projectId",
        m.status,
        m.created_at as "createdAt",
        pr.user_id as "creatorId",
        pr.username as "creatorUsername",
        pr.display_name as "creatorName",
        pr.avatar_url as "creatorAvatar",
        pr.short_id as "creatorShortId",
        pr.social_links as "creatorSocialLinks"
      FROM workofhuman.marketplace_listings m
      LEFT JOIN workofhuman.profiles pr ON m.creator_id = pr.user_id OR m.creator_id = pr.id
      LEFT JOIN workofhuman.projects p ON m.project_id = p.id
      WHERE m.status = 'active' OR m.status IS NULL
      ORDER BY m.created_at DESC
      LIMIT 100`
    );

    if (res.rows.length > 0) {
      return res.rows;
    }
  } catch (err) {
    console.warn("[Marketplace Data Fetch Warning]:", err);
  }

  return CURATED_SEED_LISTINGS;
}

export default async function MarketplacePage() {
  const [listings, currentUser] = await Promise.all([
    getMarketplaceListings(),
    getCurrentUser(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "The Digital Goods Marketplace — The Work of Human",
    description:
      "A curated marketplace of digital assets, 3D models, sound packs, presets, design kits, and literature created by independent artists.",
    url: "https://theworkofhuman.com/marketplace",
    hasPart: listings.map((item) => ({
      "@type": "Product",
      name: item.title,
      description: item.description,
      image: item.thumbnailUrl,
      offers: {
        "@type": "Offer",
        price: item.price || 0,
        priceCurrency: item.currency || "USD",
        availability: "https://schema.org/InStock",
      },
    })),
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto max-w-7xl py-10 sm:py-16 space-y-10 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#ded9cf] pb-8">
          <SectionIntro
            eyebrow="Digital Marketplace"
            title="Digital craft with real human value."
            body="Discover, acquire, and download genuine 3D models, sound packs, digital prints, presets, and design assets directly from independent creators with zero platform middleman fees."
          />

          <div className="flex items-center gap-2 self-start sm:self-auto rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-bold text-emerald-800 shrink-0">
            <Sparkles size={13} className="text-emerald-600" />
            <span>0% Platform Take • 100% Direct to Creator</span>
          </div>
        </div>

        <MarketplaceFeed
          initialListings={listings}
          currentUserId={currentUser?.userId}
        />
      </section>
    </PageShell>
  );
}

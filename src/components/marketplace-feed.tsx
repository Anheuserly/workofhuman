"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BadgeDollarSign,
  Search,
  Plus,
  Download,
  ExternalLink,
  Sparkles,
  Layers,
  Music,
  Image as ImageIcon,
  BookOpen,
  Code,
  SlidersHorizontal,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  Heart,
  QrCode,
} from "lucide-react";

export interface MarketplaceItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  price: number;
  currency: string;
  fileUrl: string;
  thumbnailUrl?: string;
  projectId?: string;
  status: string;
  createdAt: string;
  creatorId: string;
  creatorUsername: string;
  creatorName?: string;
  creatorAvatar?: string;
  creatorShortId?: string;
  creatorSocialLinks?: {
    website?: string;
    twitter?: string;
    github?: string;
    instagram?: string;
    youtube?: string;
    upi?: string;
    buymeacoffee?: string;
    kofi?: string;
    paypal?: string;
  };
}

const CATEGORIES = [
  { id: "all", label: "All Assets", icon: Layers },
  { id: "3d_models", label: "3D Models & Assets", icon: Layers },
  { id: "digital_prints", label: "Digital Prints & Posters", icon: ImageIcon },
  { id: "audio_packs", label: "Sound Packs & Audio", icon: Music },
  { id: "presets_luts", label: "Presets & LUTs", icon: SlidersHorizontal },
  { id: "ui_kits", label: "UI & Design Templates", icon: Sparkles },
  { id: "ebooks", label: "E-Books & Literature", icon: BookOpen },
  { id: "source_code", label: "Code & Shaders", icon: Code },
];

const PRICE_TIERS = [
  { id: "all", label: "All Prices" },
  { id: "free", label: "Free / Open Access" },
  { id: "under10", label: "Under $10" },
  { id: "10to50", label: "$10 – $50" },
  { id: "50plus", label: "$50+" },
];

export function MarketplaceFeed({
  initialListings,
  currentUserId,
}: {
  initialListings: MarketplaceItem[];
  currentUserId?: string | null;
}) {
  const [listings, setListings] = useState<MarketplaceItem[]>(initialListings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceTier, setSelectedPriceTier] = useState("all");

  // Listing creation modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    category: "3d_models",
    price: 0,
    currency: "USD",
    fileUrl: "",
    thumbnailUrl: "",
  });

  // Acquire / Download modal state
  const [activeItem, setActiveItem] = useState<MarketplaceItem | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Price filter
      const price = Number(item.price) || 0;
      if (selectedPriceTier === "free" && price > 0) return false;
      if (selectedPriceTier === "under10" && (price === 0 || price > 10)) return false;
      if (selectedPriceTier === "10to50" && (price <= 10 || price > 50)) return false;
      if (selectedPriceTier === "50plus" && price <= 50) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(q);
        const descMatch = (item.description || "").toLowerCase().includes(q);
        const creatorMatch = (item.creatorUsername || "").toLowerCase().includes(q) ||
          (item.creatorName || "").toLowerCase().includes(q);
        return titleMatch || descMatch || creatorMatch;
      }

      return true;
    });
  }, [listings, selectedCategory, selectedPriceTier, searchQuery]);

  async function handleCreateListing(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newListing,
          price: Number(newListing.price) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to list item.");
      }

      // Optimistically append to local feed
      const createdItem: MarketplaceItem = {
        id: data.listingId,
        title: newListing.title,
        description: newListing.description,
        category: newListing.category,
        price: Number(newListing.price) || 0,
        currency: newListing.currency,
        fileUrl: newListing.fileUrl,
        thumbnailUrl: newListing.thumbnailUrl,
        status: "active",
        createdAt: new Date().toISOString(),
        creatorId: currentUserId || "you",
        creatorUsername: "you",
      };

      setListings([createdItem, ...listings]);
      setCreateOpen(false);
      setNewListing({
        title: "",
        description: "",
        category: "3d_models",
        price: 0,
        currency: "USD",
        fileUrl: "",
        thumbnailUrl: "",
      });
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Failed to create listing.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopyUpi(upiId: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  }

  return (
    <div className="space-y-8">
      {/* Controls Bar: Search & List Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c857b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search digital assets, packs, models, or creators..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#ded9cf] bg-white text-[#151515] placeholder-[#8c857b] focus:border-[#0f766e] focus:outline-none shadow-xs"
          />
        </div>

        <div className="flex items-center gap-3">
          {currentUserId ? (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="button-primary text-xs !px-4 !py-2 font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={14} />
              List Digital Asset
            </button>
          ) : (
            <Link
              href="/signin?next=/marketplace"
              className="button-secondary text-xs !px-4 !py-2 font-semibold inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              Sign In to List
            </Link>
          )}
        </div>
      </div>

      {/* Category Pills & Price Filter */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  active
                    ? "bg-[#0f766e] text-white shadow-xs"
                    : "border border-[#ded9cf] bg-white text-[#6f6a61] hover:border-[#151515] hover:text-[#151515]"
                }`}
              >
                <Icon size={13} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Price Tiers */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#ded9cf]/50">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c857b] mr-2">
            Price:
          </span>
          {PRICE_TIERS.map((tier) => {
            const active = selectedPriceTier === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedPriceTier(tier.id)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                  active
                    ? "bg-[#151515] text-white"
                    : "bg-[#f6f4ef] text-[#6f6a61] hover:bg-[#eae6dc] hover:text-[#151515]"
                }`}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Listings */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((item) => {
            const isFree = !item.price || Number(item.price) === 0;
            const creatorHandle = item.creatorShortId || item.creatorUsername || "creator";
            const creatorName = item.creatorName || item.creatorUsername || "Creator";

            return (
              <article
                key={item.id}
                className="surface group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#ded9cf] transition duration-300 hover:-translate-y-1 hover:border-[#151515] hover:shadow-lg bg-white"
              >
                {/* Visual Thumbnail */}
                <div
                  className="relative aspect-4/3 w-full overflow-hidden bg-[#e9e4da] cursor-pointer"
                  onClick={() => setActiveItem(item)}
                >
                  {item.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-[#8c857b]">
                      <BadgeDollarSign size={36} className="text-[#0f766e]/60" />
                    </div>
                  )}

                  {/* Category Chip */}
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                      {item.category.replaceAll("_", " ")}
                    </span>
                  </div>

                  {/* Price Tag Pill */}
                  <div className="absolute bottom-3 right-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black shadow-md backdrop-blur-md ${
                        isFree
                          ? "bg-emerald-600 text-white"
                          : "bg-[#151515]/90 text-white"
                      }`}
                    >
                      {isFree ? "FREE" : `$${Number(item.price).toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* Content & Creator Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3
                      className="text-base font-bold text-[#151515] line-clamp-1 group-hover:text-[#0f766e] transition cursor-pointer"
                      onClick={() => setActiveItem(item)}
                    >
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-[#6f6a61] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Creator Bar & Acquire Button */}
                  <div className="pt-3 border-t border-[#f0ede6] flex items-center justify-between gap-3">
                    <Link
                      href={`/@${creatorHandle}`}
                      className="flex items-center gap-2 group/creator truncate hover:underline"
                    >
                      {item.creatorAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.creatorAvatar}
                          alt={creatorName}
                          className="size-6 rounded-full object-cover border border-[#ded9cf]"
                        />
                      ) : (
                        <div className="grid size-6 place-items-center rounded-full bg-[#0f766e] text-white text-[10px] font-bold uppercase">
                          {creatorName.slice(0, 1)}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-[#151515] truncate">
                        @{creatorHandle}
                      </span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setActiveItem(item)}
                      className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                        isFree
                          ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                          : "bg-[#151515] text-white hover:bg-[#333]"
                      }`}
                    >
                      {isFree ? <Download size={13} /> : <CreditCard size={13} />}
                      {isFree ? "Download" : "Acquire"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="surface p-12 text-center rounded-2xl border border-[#ded9cf] space-y-4">
          <BadgeDollarSign size={40} className="mx-auto text-[#0f766e]" />
          <h3 className="text-lg font-bold text-[#151515]">No digital assets found</h3>
          <p className="text-xs text-[#6f6a61] max-w-md mx-auto">
            {searchQuery
              ? `No creations match the keyword "${searchQuery}". Try searching for other tags or clear filters.`
              : "Be the first creator to list high-quality 3D assets, audio packs, presets, or templates."}
          </p>
          {currentUserId && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="button-primary text-xs !px-5 !py-2 font-bold cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              List an Asset Now
            </button>
          )}
        </div>
      )}

      {/* Asset Acquisition / Download Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="surface relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#ded9cf] p-6 sm:p-8 bg-white shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#ded9cf] pb-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f766e]">
                  {activeItem.category.replaceAll("_", " ")}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#151515]">
                  {activeItem.title}
                </h2>
                <p className="text-xs text-[#6f6a61]">
                  Published by{" "}
                  <Link
                    href={`/@${activeItem.creatorShortId || activeItem.creatorUsername}`}
                    className="font-bold text-[#151515] hover:underline"
                  >
                    @{activeItem.creatorShortId || activeItem.creatorUsername}
                  </Link>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="grid size-8 place-items-center rounded-full bg-[#f6f4ef] text-[#6f6a61] hover:text-[#151515] transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Thumbnail Preview */}
            {activeItem.thumbnailUrl && (
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#e9e4da] border border-[#ded9cf]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeItem.thumbnailUrl}
                  alt={activeItem.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Description */}
            {activeItem.description && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#151515] uppercase tracking-wider">
                  About this Asset
                </h4>
                <p className="text-xs text-[#555047] leading-relaxed whitespace-pre-line">
                  {activeItem.description}
                </p>
              </div>
            )}

            {/* Pricing & Download Options */}
            <div className="rounded-xl bg-[#f6f4ef] border border-[#ded9cf] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#6f6a61]">Price</span>
                  <p className="text-2xl font-black text-[#151515]">
                    {!activeItem.price || Number(activeItem.price) === 0
                      ? "Free / Open Access"
                      : `$${Number(activeItem.price).toFixed(2)} ${activeItem.currency}`}
                  </p>
                </div>

                <a
                  href={activeItem.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary text-xs !px-5 !py-2.5 font-bold cursor-pointer inline-flex items-center gap-2 shadow-xs"
                >
                  <Download size={14} />
                  Download File
                </a>
              </div>

              {/* Creator Direct Tip / Support prompt */}
              {activeItem.creatorSocialLinks && (
                <div className="pt-4 border-t border-[#ded9cf] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#151515]">
                    <Heart size={14} className="text-rose-600 fill-rose-600" />
                    <span>Support the Creator Directly (0% Platform Fee)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeItem.creatorSocialLinks.upi && (
                      <button
                        type="button"
                        onClick={() => handleCopyUpi(activeItem.creatorSocialLinks!.upi!)}
                        className="p-2.5 bg-white rounded-lg border border-[#ded9cf] text-left hover:border-[#0f766e] transition flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div>
                          <p className="font-bold text-[#151515] text-[11px]">UPI Instant Pay</p>
                          <p className="font-mono text-[10px] text-[#8c857b]">
                            {activeItem.creatorSocialLinks.upi}
                          </p>
                        </div>
                        {copiedUpi ? (
                          <span className="text-[10px] font-bold text-emerald-600">Copied!</span>
                        ) : (
                          <QrCode size={14} className="text-[#0f766e]" />
                        )}
                      </button>
                    )}

                    {activeItem.creatorSocialLinks.buymeacoffee && (
                      <a
                        href={
                          activeItem.creatorSocialLinks.buymeacoffee.startsWith("http")
                            ? activeItem.creatorSocialLinks.buymeacoffee
                            : `https://buymeacoffee.com/${activeItem.creatorSocialLinks.buymeacoffee}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-white rounded-lg border border-[#ded9cf] text-left hover:border-amber-500 transition flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-[#151515] text-[11px]">Buy Me a Coffee</p>
                          <p className="text-[10px] text-[#8c857b]">Tip creator a coffee</p>
                        </div>
                        <ExternalLink size={13} className="text-amber-600" />
                      </a>
                    )}

                    {activeItem.creatorSocialLinks.kofi && (
                      <a
                        href={
                          activeItem.creatorSocialLinks.kofi.startsWith("http")
                            ? activeItem.creatorSocialLinks.kofi
                            : `https://ko-fi.com/${activeItem.creatorSocialLinks.kofi}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-white rounded-lg border border-[#ded9cf] text-left hover:border-sky-500 transition flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-[#151515] text-[11px]">Ko-fi</p>
                          <p className="text-[10px] text-[#8c857b]">Send direct tip</p>
                        </div>
                        <ExternalLink size={13} className="text-sky-600" />
                      </a>
                    )}

                    {activeItem.creatorSocialLinks.paypal && (
                      <a
                        href={
                          activeItem.creatorSocialLinks.paypal.startsWith("http")
                            ? activeItem.creatorSocialLinks.paypal
                            : `https://paypal.me/${activeItem.creatorSocialLinks.paypal}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-white rounded-lg border border-[#ded9cf] text-left hover:border-blue-500 transition flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-[#151515] text-[11px]">PayPal.me</p>
                          <p className="text-[10px] text-[#8c857b]">Send peer transfer</p>
                        </div>
                        <ExternalLink size={13} className="text-blue-600" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* List Digital Asset Creation Modal */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setCreateOpen(false)}
        >
          <div
            className="surface relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[#ded9cf] p-6 sm:p-8 bg-white shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#ded9cf] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#151515]">List a Digital Asset</h2>
                <p className="text-xs text-[#6f6a61] mt-0.5">
                  Publish 3D models, audio kits, digital prints, or presets to the global marketplace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="grid size-8 place-items-center rounded-full bg-[#f6f4ef] text-[#6f6a61] hover:text-[#151515] transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4d4942]">Asset Title *</label>
                <input
                  type="text"
                  required
                  value={newListing.title}
                  onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                  placeholder="e.g. Modern Architecture 3D Blender Kit"
                  className="mt-1 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4d4942]">Category *</label>
                  <select
                    value={newListing.category}
                    onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
                    className="mt-1 w-full rounded-md border border-[#ded9cf] bg-white px-3 py-2 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4d4942]">
                    Price (USD) <span className="text-[10px] text-[#8c857b]">(0 for Free)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newListing.price}
                    onChange={(e) => setNewListing({ ...newListing, price: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4d4942]">Download File URL *</label>
                <input
                  type="url"
                  required
                  value={newListing.fileUrl}
                  onChange={(e) => setNewListing({ ...newListing, fileUrl: e.target.value })}
                  placeholder="Direct link to ZIP, OBJ, FBX, WAV, or PDF file..."
                  className="mt-1 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4d4942]">
                  Preview Thumbnail URL <span className="text-[10px] text-[#8c857b]">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={newListing.thumbnailUrl}
                  onChange={(e) => setNewListing({ ...newListing, thumbnailUrl: e.target.value })}
                  placeholder="https://... image preview"
                  className="mt-1 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4d4942]">
                  Description &amp; License Terms
                </label>
                <textarea
                  rows={3}
                  value={newListing.description}
                  onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                  placeholder="Explain what is included in the package, formats supported, and usage rights..."
                  className="mt-1 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ded9cf]">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="button-secondary text-xs !px-4 !py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="button-primary text-xs !px-5 !py-2 font-bold cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={13} />
                      Publish Asset
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

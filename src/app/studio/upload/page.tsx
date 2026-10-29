"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  UploadCloud,
  UserCheck,
} from "lucide-react";
import { PageShell, SectionIntro } from "@/components/shell";
import { contentTypes } from "@/lib/platform";

interface AuthUser {
  userId: string;
  username: string;
  displayName: string | null;
}

export default function UploadStudioPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<string>("digital_art");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([""]);
  const [tagInput, setTagInput] = useState("");
  const [aiGenerated, setAiGenerated] = useState(false);
  const [aiModel, setAiModel] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user || null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  function handleAddMediaUrl() {
    setMediaUrls([...mediaUrls, ""]);
  }

  function handleMediaUrlChange(index: number, val: string) {
    const updated = [...mediaUrls];
    updated[index] = val;
    setMediaUrls(updated);
  }

  function handleRemoveMediaUrl(index: number) {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please provide a project title.");
      return;
    }

    setSubmitting(true);

    try {
      const cleanMediaUrls = mediaUrls.filter((url) => url.trim().length > 0);
      const cleanTags = tagInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await fetch("/api/projects/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || undefined,
          type,
          description: description.trim() || undefined,
          thumbnailUrl: thumbnailUrl.trim() || undefined,
          mediaUrls: cleanMediaUrls,
          tags: cleanTags,
          aiGenerated,
          aiModel: aiGenerated ? aiModel.trim() || "AI Assisted" : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish project.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/${currentUser?.username || "explore"}`);
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-12">
        <SectionIntro
          eyebrow="Upload Studio"
          title="Publish Across 33 Creative Disciplines"
          body="Visual art, cinema, sound, code, inventions, and transparent AI-assisted experiments in one refined space."
        />

        {authLoading && (
          <div className="surface p-12 text-center max-w-lg mx-auto">
            <Loader2 className="mx-auto animate-spin text-[#0f766e]" size={32} />
            <p className="mt-4 text-xs font-semibold text-[#6f6a61]">Verifying creator credentials...</p>
          </div>
        )}

        {!authLoading && !currentUser && (
          <div className="surface p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#0f766e]/10 text-[#0f766e]">
              <UploadCloud size={28} />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-[#151515]">Creator Sign-In Required</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6f6a61]">
              Publishing is reserved for registered creators on The Work of Human. Sign in or create your creator handle in seconds.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/login?next=/studio/upload" className="button-primary text-xs">
                Sign In to Studio
              </Link>
              <Link href="/register?next=/studio/upload" className="button-secondary text-xs">
                Create Account
              </Link>
            </div>
          </div>
        )}

        {!authLoading && currentUser && (
          <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left Column: Core Metadata */}
            <div className="surface p-6 sm:p-8 space-y-6">
              <div className="border-b border-[#ded9cf] pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#151515]">Project Details</h3>
                  <p className="text-xs text-[#6f6a61] mt-0.5">Author: @{currentUser.username}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#0f766e] font-semibold bg-[#0f766e]/10 px-3 py-1 rounded-full">
                  <UserCheck size={14} /> Ready to Publish
                </span>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  <span>Creation published successfully! Redirecting to your portfolio...</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                  Creation Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slug || slug === title.toLowerCase().replace(/[^\w-]/g, "-")) {
                      setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, ""));
                    }
                  }}
                  placeholder="e.g. Echoes of the Rust Belt, Algorithmic Flora, or Monolith Engine"
                  className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2.5 text-sm text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                    Discipline / Medium <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-sm text-[#151515] focus:border-[#0f766e] focus:outline-none capitalize"
                  >
                    {contentTypes.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                    Custom URL Slug <span className="text-xs font-normal lowercase text-[#8c857b]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="my-creation-slug"
                    className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-sm text-[#151515] font-mono placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                  Description &amp; Project Narrative
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Discuss inspiration, medium techniques, creative methodology, engineering stack, or philosophical underpinnings..."
                  className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2.5 text-sm text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none"
                />
              </div>

              {/* Transparent AI Provenance Box */}
              <div className="rounded-lg border border-[#ded9cf] bg-[#fbfaf7] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-[#0f766e]" size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#151515]">
                      Transparent AI Provenance
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiGenerated}
                      onChange={(e) => setAiGenerated(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f766e]"></div>
                  </label>
                </div>

                <p className="text-xs text-[#6f6a61]">
                  The Work of Human celebrates both unassisted human mastery and transparent AI experimentation. Disclose whether AI models were used in generation or ideation.
                </p>

                {aiGenerated && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-[#4d4942]">
                      Models &amp; Generative Tools Disclosed
                    </label>
                    <input
                      type="text"
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      placeholder="e.g. Midjourney v6.1, Claude 3.7 Sonnet, Suno v3.5, SDXL"
                      className="mt-1 w-full rounded-md border border-[#ded9cf] bg-white px-3 py-1.5 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                  Keyword Tags <span className="text-xs font-normal lowercase text-[#8c857b]">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="ambient, cinematic, rust, modular, brass, typography"
                  className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-sm text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none"
                />
              </div>
            </div>

            {/* Right Column: Media Assets & Preview */}
            <div className="space-y-6">
              <div className="surface p-6 sm:p-8 space-y-4">
                <h3 className="text-lg font-bold text-[#151515]">Media &amp; Assets</h3>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                    Cover Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or https://..."
                    className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-sm text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none"
                  />
                  <p className="text-[11px] text-[#8c857b] mt-1">
                    Image preview shown across discovery grids, search, and home feed.
                  </p>
                </div>

                {thumbnailUrl && (
                  <div className="relative h-44 w-full rounded-lg overflow-hidden border border-[#ded9cf] bg-[#e9e4da]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnailUrl}
                      alt="Thumbnail preview"
                      className="h-full w-full object-cover"
                      onError={() => setError("Could not render thumbnail image from the provided URL.")}
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                      Full-Resolution Media / Audio / Asset URLs
                    </label>
                    <button
                      type="button"
                      onClick={handleAddMediaUrl}
                      className="text-xs font-bold text-[#0f766e] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} /> Add URL
                    </button>
                  </div>

                  <div className="mt-2 space-y-2">
                    {mediaUrls.map((url, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => handleMediaUrlChange(idx, e.target.value)}
                          placeholder="https://... (asset link, SoundCloud, Vimeo, GitHub)"
                          className="flex-1 rounded-md border border-[#ded9cf] bg-white px-3 py-1.5 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none"
                        />
                        {mediaUrls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMediaUrl(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#ded9cf]">
                  <button
                    type="submit"
                    disabled={submitting || success}
                    className="button-primary w-full cursor-pointer justify-center disabled:opacity-60 !py-3"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={17} />
                        Publishing Creation...
                      </>
                    ) : (
                      <>
                        Publish to The Work of Human
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </section>
    </PageShell>
  );
}

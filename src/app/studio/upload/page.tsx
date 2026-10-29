"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileUp,
  Film,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Music,
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
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [aiGenerated, setAiGenerated] = useState(false);
  const [aiModel, setAiModel] = useState("");

  // Thumbnail choice: "upload" or "link"
  const [thumbMode, setThumbMode] = useState<"upload" | "link">("upload");

  // Upload progress state
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Hidden file inputs
  const thumbFileInputRef = useRef<HTMLInputElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user || null);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    function onAuthChange() {
      checkAuth();
    }
    window.addEventListener("woh_auth_change", onAuthChange);
    return () => window.removeEventListener("woh_auth_change", onAuthChange);
  }, [checkAuth]);

  async function handleFileUpload(file: File, target: "thumbnail" | "media") {
    setUploadError(null);
    if (target === "thumbnail") setUploadingThumb(true);
    else setUploadingMedia(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file.");
      }

      if (target === "thumbnail") {
        setThumbnailUrl(data.url);
      } else {
        setMediaUrls((prev) => [...prev, data.url]);
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      if (target === "thumbnail") setUploadingThumb(false);
      else setUploadingMedia(false);
    }
  }

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
      const tagsArray = tagInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        type,
        description: description.trim() || undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        mediaUrls: mediaUrls.filter((u) => u.trim().length > 0),
        tags: tagsArray,
        aiGenerated,
        aiModel: aiGenerated && aiModel.trim() ? aiModel.trim() : undefined,
      };

      const res = await fetch("/api/projects/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish project.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(data.redirectUrl || `/@${currentUser?.username}/${data.slug}`);
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to publish creation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl py-8 sm:py-12">
        <SectionIntro
          eyebrow="Upload Studio"
          title="Publish Across 33 Creative Disciplines"
          body="Visual art, cinema, sound, code, inventions, and transparent AI-assisted experiments in one refined space."
        />

        {authLoading ? (
          <div className="surface p-12 text-center max-w-md mx-auto">
            <Loader2 className="mx-auto animate-spin text-[#0f766e]" size={32} />
            <p className="mt-4 text-xs font-semibold text-[#6f6a61]">Connecting to creator studio...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Core Metadata Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Creator Status Pill */}
              <div className="surface p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#151515]">Publishing Author</p>
                  <p className="text-xs text-[#6f6a61] mt-0.5">
                    {currentUser ? (
                      <>
                        Logged in as{" "}
                        <span className="font-semibold text-[#0f766e]">@{currentUser.username}</span>
                        {currentUser.displayName && ` (${currentUser.displayName})`}
                      </>
                    ) : (
                      <span className="text-amber-700 font-medium">
                        Not signed in. Sign in or register to publish.
                      </span>
                    )}
                  </p>
                </div>
                {currentUser ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f766e]/10 border border-[#0f766e]/20 px-3 py-1 text-xs font-bold text-[#0f766e]">
                    <UserCheck size={14} />
                    Ready to Publish
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login?next=/studio/upload"
                      className="rounded-full px-3 py-1 text-xs font-semibold text-[#151515] border border-[#ded9cf] hover:bg-[#ebe7df]"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register?next=/studio/upload"
                      className="button-primary !px-3.5 !py-1 text-xs"
                    >
                      Join
                    </Link>
                  </div>
                )}
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
                  <span>Creation published successfully! Opening project showcase...</span>
                </div>
              )}

              {/* Title & Slug */}
              <div className="surface p-6 sm:p-8 space-y-5">
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
            </div>

            {/* Right Column: Media Uploads, Files & Preview */}
            <div className="space-y-6">
              <div className="surface p-6 sm:p-8 space-y-6">
                <div className="border-b border-[#ded9cf] pb-3">
                  <h3 className="text-lg font-bold text-[#151515]">Media &amp; Assets</h3>
                  <p className="text-xs text-[#6f6a61] mt-0.5">
                    Upload directly from your device or paste web links.
                  </p>
                </div>

                {uploadError && (
                  <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* 1. Cover Thumbnail: Choice between Direct Upload and Web Link */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                      Cover Thumbnail Image
                    </label>
                    <div className="inline-flex rounded-lg bg-[#ded9cf]/40 p-0.5 text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setThumbMode("upload")}
                        className={`rounded-md px-2.5 py-1 cursor-pointer transition ${
                          thumbMode === "upload"
                            ? "bg-white text-[#151515] shadow-xs"
                            : "text-[#6f6a61] hover:text-[#151515]"
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setThumbMode("link")}
                        className={`rounded-md px-2.5 py-1 cursor-pointer transition ${
                          thumbMode === "link"
                            ? "bg-white text-[#151515] shadow-xs"
                            : "text-[#6f6a61] hover:text-[#151515]"
                        }`}
                      >
                        Paste Link
                      </button>
                    </div>
                  </div>

                  {thumbMode === "upload" ? (
                    <div>
                      <input
                        ref={thumbFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "thumbnail");
                        }}
                      />
                      <div
                        onClick={() => thumbFileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#ded9cf] hover:border-[#0f766e] bg-[#fbfaf7] hover:bg-[#f6f4ef] rounded-lg p-5 text-center cursor-pointer transition group"
                      >
                        {uploadingThumb ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 size={24} className="animate-spin text-[#0f766e]" />
                            <span className="text-xs font-semibold text-[#151515]">
                              Saving image to server...
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5">
                            <UploadCloud
                              size={26}
                              className="text-[#6f6a61] group-hover:text-[#0f766e] transition"
                            />
                            <p className="text-xs font-bold text-[#151515]">
                              Click to choose image file
                            </p>
                            <p className="text-[11px] text-[#8c857b]">
                              JPG, PNG, WebP, GIF up to 250MB
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="url"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or https://..."
                        className="w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-xs text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Thumbnail Preview */}
                  {thumbnailUrl && (
                    <div className="relative rounded-lg overflow-hidden border border-[#ded9cf] bg-[#e9e4da] p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnailUrl}
                        alt="Thumbnail preview"
                        className="h-44 w-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => setThumbnailUrl("")}
                        className="absolute top-3 right-3 rounded-full bg-black/70 hover:bg-black text-white p-1.5 cursor-pointer transition shadow"
                        aria-label="Remove thumbnail"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Full Media Assets Section: Choice between Upload and Link */}
                <div className="pt-4 border-t border-[#ded9cf] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                      Full Media Assets ({mediaUrls.length})
                    </label>

                    {/* Both action buttons side-by-side */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={uploadingMedia}
                        onClick={() => mediaFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#0f766e] text-white px-2.5 py-1 text-xs font-bold hover:bg-[#0d655e] transition cursor-pointer disabled:opacity-60"
                      >
                        {uploadingMedia ? (
                          <>
                            <Loader2 size={12} className="animate-spin" /> Uploading...
                          </>
                        ) : (
                          <>
                            <FileUp size={12} /> Upload File
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleAddMediaUrl}
                        className="inline-flex items-center gap-1 rounded-md border border-[#ded9cf] bg-white px-2.5 py-1 text-xs font-bold text-[#151515] hover:bg-[#f6f4ef] transition cursor-pointer"
                      >
                        <LinkIcon size={12} /> Add Link
                      </button>
                    </div>

                    <input
                      ref={mediaFileInputRef}
                      type="file"
                      accept="image/*,video/*,audio/*,.pdf,.glb,.gltf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "media");
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-[#6f6a61]">
                    Add high-res photos, videos (.mp4/.mov), songs/audio (.mp3/.wav), or links (SoundCloud, Vimeo, GitHub).
                  </p>

                  {mediaUrls.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-[#ded9cf] p-5 text-center bg-[#fbfaf7]">
                      <p className="text-xs text-[#8c857b]">
                        No assets added yet. Click <span className="font-semibold text-[#0f766e]">Upload File</span> to upload from your computer or <span className="font-semibold text-[#151515]">Add Link</span> to paste an external URL.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mediaUrls.map((url, idx) => {
                        const isVid = /\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i.test(url);
                        const isAud = /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(url);
                        const isImg = /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?.*)?$/i.test(url);

                        return (
                          <div
                            key={idx}
                            className="rounded-lg border border-[#ded9cf] bg-[#fcfbfa] p-3 space-y-2 shadow-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f766e] bg-[#0f766e]/10 px-2 py-0.5 rounded">
                                {isVid ? (
                                  <>
                                    <Film size={12} /> Video
                                  </>
                                ) : isAud ? (
                                  <>
                                    <Music size={12} /> Audio
                                  </>
                                ) : isImg ? (
                                  <>
                                    <ImageIcon size={12} /> Photo
                                  </>
                                ) : (
                                  <>
                                    <LinkIcon size={12} /> External Link
                                  </>
                                )}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleRemoveMediaUrl(idx)}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer shrink-0"
                                aria-label="Remove asset"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            <input
                              type="text"
                              value={url}
                              onChange={(e) => handleMediaUrlChange(idx, e.target.value)}
                              placeholder="Media URL or uploaded file location..."
                              className="w-full rounded border border-[#ded9cf] bg-white px-2.5 py-1.5 text-xs text-[#151515] font-mono focus:border-[#0f766e] focus:outline-none"
                            />

                            {/* Inline Media Preview */}
                            {url && (
                              <div className="rounded overflow-hidden bg-black/5 max-h-40 border border-[#ded9cf]/60">
                                {isVid ? (
                                  <video src={url} controls className="w-full max-h-40 bg-black" />
                                ) : isAud ? (
                                  <audio src={url} controls className="w-full p-2" />
                                ) : isImg ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={url}
                                    alt={`Asset ${idx + 1}`}
                                    className="w-full max-h-40 object-contain bg-white"
                                  />
                                ) : null}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#ded9cf]">
                  <button
                    type="submit"
                    disabled={submitting || success}
                    className="button-primary w-full cursor-pointer justify-center disabled:opacity-60 !py-3 font-bold"
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

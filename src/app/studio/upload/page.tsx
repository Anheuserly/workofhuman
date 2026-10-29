"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  FileText,
  FileUp,
  FolderOpen,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Music,
  Sparkles,
  Tag,
  Trash2,
  UploadCloud,
  Video,
} from "lucide-react";
import { PageShell } from "@/components/shell";
import { contentTypes } from "@/lib/platform";
import { RoleBadge } from "@/components/role-badge";

interface AuthUser {
  userId: string;
  username: string;
  displayName: string | null;
  role?: string;
  verified?: boolean;
}

export default function UploadStudioPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("woh_cached_user");
        if (cached) return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    return null;
  });
  const [authLoading, setAuthLoading] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return !localStorage.getItem("woh_cached_user");
      } catch {
        return true;
      }
    }
    return true;
  });

  // Active studio section tab
  const [activeSection, setActiveSection] = useState<"media" | "details" | "ai" | "tags" | "preview">("media");

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

  // Thumbnail mode: "upload" | "link"
  const [thumbMode, setThumbMode] = useState<"upload" | "link">("upload");

  // Drag and Drop States
  const [isDraggingThumb, setIsDraggingThumb] = useState(false);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);

  // Upload progress states
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [thumbProgress, setThumbProgress] = useState<{
    filename: string;
    percent: number;
    loadedFormatted: string;
    totalFormatted: string;
  } | null>(null);

  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaProgress, setMediaProgress] = useState<{
    filename: string;
    percent: number;
    loadedFormatted: string;
    totalFormatted: string;
    index: number;
    totalFiles: number;
  } | null>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);

  // Hidden file inputs
  const thumbFileInputRef = useRef<HTMLInputElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);

  // Submit states
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
        if (data.user) {
          setCurrentUser(data.user);
          try {
            localStorage.setItem("woh_cached_user", JSON.stringify(data.user));
          } catch {
            // ignore
          }
        } else {
          setCurrentUser(null);
          try {
            localStorage.removeItem("woh_cached_user");
          } catch {
            // ignore
          }
        }
      } else if (res.status === 401) {
        setCurrentUser(null);
        try {
          localStorage.removeItem("woh_cached_user");
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.warn("[Upload Studio Auth]: retaining cached session:", err);
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

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
  }

  function uploadFileWithProgress(
    file: File,
    onProgress: (percent: number, loadedFormatted: string, totalFormatted: string) => void
  ): Promise<{ url: string; filename: string }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
          onProgress(percent, formatBytes(event.loaded), formatBytes(event.total));
        }
      };

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data);
          } else {
            reject(new Error(data.error || `Upload failed with status ${xhr.status}`));
          }
        } catch {
          reject(new Error(xhr.responseText || `Server returned status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network connection error during upload. Please check your connection."));
      };

      const vpsBase = (process.env.NEXT_PUBLIC_VPS_MEDIA_URL || "").replace(/\/$/, "");
      const uploadTarget = vpsBase ? `${vpsBase}/upload` : "/api/upload";

      xhr.open("POST", uploadTarget);
      xhr.send(formData);
    });
  }

  // Upload helper for single or multiple files with accurate progress %
  async function handleFileUpload(files: FileList | File[], target: "thumbnail" | "media") {
    setUploadError(null);
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    if (target === "thumbnail") {
      setUploadingThumb(true);
      const file = fileList[0];
      setThumbProgress({
        filename: file.name,
        percent: 0,
        loadedFormatted: "0 B",
        totalFormatted: formatBytes(file.size),
      });

      try {
        const data = await uploadFileWithProgress(file, (percent, loadedFormatted, totalFormatted) => {
          setThumbProgress({
            filename: file.name,
            percent,
            loadedFormatted,
            totalFormatted,
          });
        });
        setThumbnailUrl(data.url);
      } catch (err: unknown) {
        setUploadError(err instanceof Error ? err.message : "Cover upload failed.");
      } finally {
        setUploadingThumb(false);
        setThumbProgress(null);
      }
    } else {
      setUploadingMedia(true);
      try {
        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          setMediaProgress({
            filename: file.name,
            percent: 0,
            loadedFormatted: "0 B",
            totalFormatted: formatBytes(file.size),
            index: i + 1,
            totalFiles: fileList.length,
          });

          const data = await uploadFileWithProgress(file, (percent, loadedFormatted, totalFormatted) => {
            setMediaProgress({
              filename: file.name,
              percent,
              loadedFormatted,
              totalFormatted,
              index: i + 1,
              totalFiles: fileList.length,
            });
          });

          setMediaUrls((prev) => [...prev, data.url]);
        }
      } catch (err: unknown) {
        setUploadError(err instanceof Error ? err.message : "Media upload failed.");
      } finally {
        setUploadingMedia(false);
        setMediaProgress(null);
      }
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
      setActiveSection("details");
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
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to publish creation.");
    } finally {
      setSubmitting(false);
    }
  }

  // Helper media format checkers
  function isVideo(url: string) {
    return /\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i.test(url);
  }
  function isAudio(url: string) {
    return /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(url);
  }
  function isImage(url: string) {
    return /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?.*)?$/i.test(url);
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl py-4 sm:py-6">
        {/* Compact, Refined Studio Header Bar */}
        <header className="surface p-4 sm:p-5 mb-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-[#0f766e] text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f766e] bg-[#0f766e]/10 px-2 py-0.5 rounded">
                  Studio Workspace
                </span>
                <span className="text-xs font-semibold text-[#8c857b]">• 33 Disciplines</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#151515] mt-0.5">
                Creator Upload Studio
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-2 border border-[#ded9cf] rounded-full px-3 py-1 bg-[#fcfbfa] text-xs">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-[#151515]">@{currentUser.username}</span>
                <RoleBadge role={currentUser.role} verified={currentUser.verified} size="sm" />
              </div>
            ) : (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
                Guest Mode (Sign in to publish)
              </span>
            )}

            <button
              type="button"
              onClick={() => setActiveSection(activeSection === "preview" ? "media" : "preview")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                activeSection === "preview"
                  ? "bg-[#151515] text-white"
                  : "border border-[#ded9cf] bg-white text-[#151515] hover:bg-[#f6f4ef]"
              }`}
            >
              <Eye size={13} />
              {activeSection === "preview" ? "Edit Mode" : "Live Preview"}
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || success}
              className="button-primary !px-4 !py-1.5 text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  Publish Work
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>
        </header>

        {/* Alerts */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
            <span>Creation published successfully! Opening your live portfolio showcase...</span>
          </div>
        )}

        {authLoading ? (
          <div className="surface p-12 text-center max-w-md mx-auto">
            <Loader2 className="mx-auto animate-spin text-[#0f766e]" size={28} />
            <p className="mt-3 text-xs font-semibold text-[#6f6a61]">Loading Creative Studio...</p>
          </div>
        ) : activeSection === "preview" ? (
          /* ============================================================ */
          /* LIVE INSPECTOR & SHOWCASE PREVIEW                            */
          /* ============================================================ */
          <div className="surface p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#ded9cf] pb-4">
              <div>
                <span className="text-[11px] font-bold text-[#0f766e] uppercase tracking-wider">
                  Live Showcase Preview
                </span>
                <h2 className="text-xl font-bold text-[#151515] mt-0.5">
                  {title || "Untitled Creation"}
                </h2>
              </div>
              <span className="rounded-full bg-[#151515] px-3 py-1 text-xs font-bold text-white capitalize">
                {type.replaceAll("_", " ")}
              </span>
            </div>

            {/* Primary Media Preview */}
            <div className="overflow-hidden rounded-lg bg-black/5 border border-[#ded9cf]">
              {mediaUrls[0] && isVideo(mediaUrls[0]) ? (
                <video src={mediaUrls[0]} controls className="w-full aspect-video bg-black" />
              ) : mediaUrls[0] && isAudio(mediaUrls[0]) ? (
                <div className="p-8 text-center bg-[#151515] text-white">
                  <Music className="mx-auto text-[#0f766e] mb-3" size={32} />
                  <p className="font-bold">{title || "Audio Track"}</p>
                  <audio src={mediaUrls[0]} controls className="mt-4 mx-auto w-full max-w-md" />
                </div>
              ) : thumbnailUrl || mediaUrls[0] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={thumbnailUrl || mediaUrls[0]}
                  alt="Cover preview"
                  className="w-full max-h-[500px] object-contain bg-[#e9e4da]"
                />
              ) : (
                <div className="p-12 text-center text-[#8c857b] text-xs">
                  No visual media or cover uploaded yet. Switch back to Edit Mode to attach assets.
                </div>
              )}
            </div>

            {/* Description Statement */}
            {description && (
              <div className="bg-[#fcfbfa] p-5 rounded-lg border border-[#ded9cf]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6f6a61] mb-2">
                  Project Narrative &amp; Statement
                </h4>
                <p className="text-xs text-[#151515] leading-relaxed whitespace-pre-wrap">
                  {description}
                </p>
              </div>
            )}

            {/* Additional Media Reel */}
            {mediaUrls.length > 1 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6f6a61]">
                  Additional Media Reel ({mediaUrls.length - 1})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mediaUrls.slice(1).map((url, i) => (
                    <div key={i} className="rounded border border-[#ded9cf] overflow-hidden bg-black/5 p-2">
                      {isVideo(url) ? (
                        <video src={url} controls className="w-full aspect-video bg-black rounded" />
                      ) : isAudio(url) ? (
                        <audio src={url} controls className="w-full p-2" />
                      ) : isImage(url) ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={url} alt={`Asset ${i + 2}`} className="w-full h-40 object-cover rounded" />
                      ) : (
                        <p className="text-xs font-mono text-[#0f766e] truncate p-2">{url}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ============================================================ */
          /* SMART STUDIO WORKSPACE: SIDE NAV + EDITOR PANELS             */
          /* ============================================================ */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Studio Navigation Rail */}
            <aside className="lg:col-span-3">
              <nav className="surface p-3 space-y-1 sticky top-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8c857b] px-3 py-2">
                  Studio Stages
                </p>

                <button
                  type="button"
                  onClick={() => setActiveSection("media")}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition cursor-pointer ${
                    activeSection === "media"
                      ? "bg-[#0f766e] text-white shadow-xs"
                      : "text-[#6f6a61] hover:bg-[#f6f4ef] hover:text-[#151515]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FolderOpen size={14} />
                    Media &amp; Files
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${activeSection === "media" ? "bg-white/20 text-white" : "bg-[#ded9cf]/50 text-[#151515]"}`}>
                    {mediaUrls.length + (thumbnailUrl ? 1 : 0)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("details")}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition cursor-pointer ${
                    activeSection === "details"
                      ? "bg-[#0f766e] text-white shadow-xs"
                      : "text-[#6f6a61] hover:bg-[#f6f4ef] hover:text-[#151515]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText size={14} />
                    Title &amp; Story
                  </span>
                  {title.trim() && <span className="size-1.5 rounded-full bg-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("ai")}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition cursor-pointer ${
                    activeSection === "ai"
                      ? "bg-[#0f766e] text-white shadow-xs"
                      : "text-[#6f6a61] hover:bg-[#f6f4ef] hover:text-[#151515]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} />
                    AI Provenance
                  </span>
                  {aiGenerated && (
                    <span className="text-[10px] font-bold text-emerald-300">
                      Disclosed
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("tags")}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition cursor-pointer ${
                    activeSection === "tags"
                      ? "bg-[#0f766e] text-white shadow-xs"
                      : "text-[#6f6a61] hover:bg-[#f6f4ef] hover:text-[#151515]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Tag size={14} />
                    Medium &amp; Tags
                  </span>
                  <span className="text-[10px] text-right font-mono truncate max-w-[80px]">
                    {type.replaceAll("_", " ")}
                  </span>
                </button>

                <div className="pt-3 border-t border-[#ded9cf] mt-3">
                  <div className="px-3 py-2 text-[11px] text-[#8c857b] space-y-1">
                    <p className="font-semibold text-[#151515]">Self-Hosted Server</p>
                    <p>Files save directly onto your server disk without external buckets.</p>
                  </div>
                </div>
              </nav>
            </aside>

            {/* Right Workstation: Content of Selected Stage */}
            <div className="lg:col-span-9 space-y-6">
              {/* STAGE 1: MEDIA & FILES (DRAG & DROP) */}
              {activeSection === "media" && (
                <div className="surface p-6 sm:p-7 space-y-6 animate-in fade-in">
                  <div className="border-b border-[#ded9cf] pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#151515]">Media Files &amp; Assets</h3>
                      <p className="text-xs text-[#6f6a61] mt-0.5">
                        Drag and drop photos, videos, and music from your device or paste links.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#0f766e] bg-[#0f766e]/10 px-2.5 py-1 rounded-full">
                      Up to 250MB per file
                    </span>
                  </div>

                  {uploadError && (
                    <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* 1. COVER THUMBNAIL DRAG & DROP ZONE */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#4d4942]">
                        1. Cover Artwork / Thumbnail
                      </label>
                      <div className="inline-flex rounded-lg bg-[#ded9cf]/40 p-0.5 text-[11px] font-semibold">
                        <button
                          type="button"
                          onClick={() => setThumbMode("upload")}
                          className={`rounded px-2.5 py-1 cursor-pointer transition ${
                            thumbMode === "upload"
                              ? "bg-white text-[#151515] shadow-xs"
                              : "text-[#6f6a61]"
                          }`}
                        >
                          Drag &amp; Drop
                        </button>
                        <button
                          type="button"
                          onClick={() => setThumbMode("link")}
                          className={`rounded px-2.5 py-1 cursor-pointer transition ${
                            thumbMode === "link"
                              ? "bg-white text-[#151515] shadow-xs"
                              : "text-[#6f6a61]"
                          }`}
                        >
                          Paste Link
                        </button>
                      </div>
                    </div>

                    {thumbMode === "upload" ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingThumb(true);
                        }}
                        onDragLeave={() => setIsDraggingThumb(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingThumb(false);
                          if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files, "thumbnail");
                        }}
                        onClick={() => thumbFileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                          isDraggingThumb
                            ? "border-[#0f766e] bg-[#0f766e]/10 scale-[1.01]"
                            : "border-[#ded9cf] hover:border-[#0f766e] bg-[#fbfaf7] hover:bg-[#f6f4ef]"
                        }`}
                      >
                        <input
                          ref={thumbFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) handleFileUpload(e.target.files, "thumbnail");
                          }}
                        />

                        {uploadingThumb && thumbProgress ? (
                          <div className="w-full max-w-sm mx-auto space-y-2 p-2 animate-in fade-in">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[#151515] truncate max-w-[190px]">
                                {thumbProgress.filename}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#0f766e]/10 px-2.5 py-0.5 text-xs font-mono font-bold text-[#0f766e]">
                                {thumbProgress.percent}%
                              </span>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-[#ded9cf]/50 p-0.5">
                              <div
                                className="h-full bg-gradient-to-r from-[#0f766e] to-teal-400 transition-all duration-150 ease-out rounded-full shadow-xs"
                                style={{ width: `${Math.max(4, thumbProgress.percent)}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-[#8c857b]">
                              <span>{thumbProgress.loadedFormatted} of {thumbProgress.totalFormatted}</span>
                              <span className="font-semibold text-[#0f766e]">
                                {thumbProgress.percent === 100 ? "Processing on VPS..." : "Uploading..."}
                              </span>
                            </div>
                          </div>
                        ) : uploadingThumb ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 size={24} className="animate-spin text-[#0f766e]" />
                            <span className="text-xs font-bold text-[#151515]">
                              Connecting to server storage...
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="grid size-11 place-items-center rounded-full bg-white shadow-xs text-[#0f766e]">
                              <UploadCloud size={22} />
                            </div>
                            <p className="text-xs font-bold text-[#151515]">
                              Drag &amp; drop cover artwork here, or <span className="text-[#0f766e] underline">browse</span>
                            </p>
                            <p className="text-[11px] text-[#8c857b]">
                              JPG, PNG, WebP, GIF • Recommended 16:9 or 4:3 ratio
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="url"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or paste image URL"
                        className="w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-xs text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none"
                      />
                    )}

                    {/* Cover Preview */}
                    {thumbnailUrl && (
                      <div className="relative rounded-lg overflow-hidden border border-[#ded9cf] bg-[#e9e4da] p-1 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumbnailUrl}
                            alt="Cover thumbnail"
                            className="size-16 rounded object-cover border border-[#ded9cf]"
                          />
                          <div>
                            <p className="text-xs font-bold text-[#151515]">Cover Image Attached</p>
                            <p className="text-[11px] font-mono text-[#8c857b] truncate max-w-sm">{thumbnailUrl}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setThumbnailUrl("")}
                          className="rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 p-2 cursor-pointer transition mr-2"
                          aria-label="Remove cover"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2. FULL MEDIA MULTI-DROPZONE (VIDEO, AUDIO, PHOTOS) */}
                  <div className="pt-4 border-t border-[#ded9cf] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#4d4942]">
                          2. Full-Resolution Media Assets ({mediaUrls.length})
                        </label>
                        <p className="text-[11px] text-[#8c857b]">
                          Drag videos (.mp4/.mov), songs (.mp3/.wav), high-res photos, or attach links.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddMediaUrl}
                        className="inline-flex items-center gap-1 rounded-md border border-[#ded9cf] bg-white px-2.5 py-1 text-xs font-bold text-[#151515] hover:bg-[#f6f4ef] cursor-pointer"
                      >
                        <LinkIcon size={12} /> Add Link
                      </button>
                    </div>

                    {/* Drag & Drop Box */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingMedia(true);
                      }}
                      onDragLeave={() => setIsDraggingMedia(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingMedia(false);
                        if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files, "media");
                      }}
                      onClick={() => mediaFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                        isDraggingMedia
                          ? "border-[#0f766e] bg-[#0f766e]/10 scale-[1.01]"
                          : "border-[#ded9cf] hover:border-[#0f766e] bg-[#fbfaf7] hover:bg-[#f6f4ef]"
                      }`}
                    >
                      <input
                        ref={mediaFileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*,audio/*,.pdf,.glb,.gltf"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) handleFileUpload(e.target.files, "media");
                        }}
                      />

                      {uploadingMedia && mediaProgress ? (
                        <div className="w-full max-w-md mx-auto space-y-2.5 p-2 animate-in fade-in">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 truncate max-w-[240px]">
                              <span className="rounded bg-[#0f766e]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#0f766e]">
                                {mediaProgress.index} of {mediaProgress.totalFiles}
                              </span>
                              <span className="font-bold text-[#151515] truncate">
                                {mediaProgress.filename}
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#0f766e]/10 px-2.5 py-0.5 text-xs font-mono font-bold text-[#0f766e]">
                              {mediaProgress.percent}%
                            </span>
                          </div>
                          <div className="h-3 w-full overflow-hidden rounded-full bg-[#ded9cf]/50 p-0.5">
                            <div
                              className="h-full bg-gradient-to-r from-[#0f766e] to-teal-400 transition-all duration-150 ease-out rounded-full shadow-xs"
                              style={{ width: `${Math.max(3, mediaProgress.percent)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-[#8c857b]">
                            <span>{mediaProgress.loadedFormatted} of {mediaProgress.totalFormatted}</span>
                            <span className="font-semibold text-[#0f766e]">
                              {mediaProgress.percent === 100 ? "Processing on VPS..." : "Uploading..."}
                            </span>
                          </div>
                        </div>
                      ) : uploadingMedia ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 size={26} className="animate-spin text-[#0f766e]" />
                          <p className="text-xs font-bold text-[#151515]">
                            Connecting to server storage...
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="grid size-12 place-items-center rounded-full bg-white shadow-xs text-[#0f766e]">
                            <FileUp size={24} />
                          </div>
                          <p className="text-xs font-bold text-[#151515]">
                            Drag &amp; drop video clips, audio tracks, or images here
                          </p>
                          <p className="text-[11px] text-[#8c857b]">
                            Supports multiple files • MP4, WebM, MP3, WAV, FLAC, PNG, GLB up to 250MB
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Media Assets List */}
                    {mediaUrls.length > 0 && (
                      <div className="space-y-3 pt-2">
                        {mediaUrls.map((url, idx) => {
                          const isVid = isVideo(url);
                          const isAud = isAudio(url);
                          const isImg = isImage(url);

                          return (
                            <div
                              key={idx}
                              className="rounded-lg border border-[#ded9cf] bg-[#fcfbfa] p-3 space-y-2 shadow-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0f766e] bg-[#0f766e]/10 px-2.5 py-0.5 rounded-full">
                                  {isVid ? (
                                    <>
                                      <Video size={12} /> Video Asset
                                    </>
                                  ) : isAud ? (
                                    <>
                                      <Music size={12} /> Audio Track
                                    </>
                                  ) : isImg ? (
                                    <>
                                      <ImageIcon size={12} /> Photo Asset
                                    </>
                                  ) : (
                                    <>
                                      <LinkIcon size={12} /> External Embed
                                    </>
                                  )}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveMediaUrl(idx)}
                                  className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                                  aria-label="Remove asset"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              <input
                                type="text"
                                value={url}
                                onChange={(e) => handleMediaUrlChange(idx, e.target.value)}
                                placeholder="Media URL or server path..."
                                className="w-full rounded border border-[#ded9cf] bg-white px-2.5 py-1.5 text-xs text-[#151515] font-mono focus:border-[#0f766e] focus:outline-none"
                              />

                              {/* Embedded Interactive Preview */}
                              {url && (
                                <div className="rounded overflow-hidden bg-black/5 max-h-44 border border-[#ded9cf]/60">
                                  {isVid ? (
                                    <video src={url} controls className="w-full max-h-44 bg-black" />
                                  ) : isAud ? (
                                    <audio src={url} controls className="w-full p-2" />
                                  ) : isImg ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                      src={url}
                                      alt={`Media asset ${idx + 1}`}
                                      className="w-full max-h-44 object-contain bg-white"
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

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveSection("details")}
                      className="button-primary text-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      Next: Title &amp; Story
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 2: DETAILS & STORY */}
              {activeSection === "details" && (
                <div className="surface p-6 sm:p-7 space-y-5 animate-in fade-in">
                  <div className="border-b border-[#ded9cf] pb-3">
                    <h3 className="text-base font-bold text-[#151515]">Title &amp; Creative Narrative</h3>
                    <p className="text-xs text-[#6f6a61] mt-0.5">
                      Define the headline, custom slug, and statement for your creation.
                    </p>
                  </div>

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
                      className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-sm text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                      Custom URL Slug <span className="text-xs font-normal lowercase text-[#8c857b]">(theworkofhuman.com/@username/slug)</span>
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="my-creation-slug"
                      className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-sm text-[#151515] font-mono placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                      Description &amp; Project Narrative
                    </label>
                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Discuss inspiration, creative methodologies, acoustic design, code architectures, or philosophical foundations..."
                      className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-xs text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-[#ded9cf]">
                    <button
                      type="button"
                      onClick={() => setActiveSection("media")}
                      className="button-secondary text-xs cursor-pointer"
                    >
                      Back: Media Files
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("ai")}
                      className="button-primary text-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      Next: AI Provenance
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 3: AI PROVENANCE */}
              {activeSection === "ai" && (
                <div className="surface p-6 sm:p-7 space-y-5 animate-in fade-in">
                  <div className="border-b border-[#ded9cf] pb-3">
                    <h3 className="text-base font-bold text-[#151515]">Transparent AI Provenance</h3>
                    <p className="text-xs text-[#6f6a61] mt-0.5">
                      Maintain integrity across unassisted human craftsmanship and synthetic experimentation.
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#ded9cf] bg-[#fbfaf7] p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="grid size-8 place-items-center rounded-full bg-[#0f766e]/10 text-[#0f766e]">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#151515]">AI-Assisted or Generated Work</p>
                          <p className="text-[11px] text-[#6f6a61]">
                            Declare whether AI models were used in ideation, synthesis, or mastering.
                          </p>
                        </div>
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

                    {aiGenerated ? (
                      <div className="pt-3 border-t border-[#ded9cf] space-y-2">
                        <label className="block text-xs font-semibold text-[#4d4942]">
                          Disclosed AI Models &amp; Generative Stack
                        </label>
                        <input
                          type="text"
                          value={aiModel}
                          onChange={(e) => setAiModel(e.target.value)}
                          placeholder="e.g. Midjourney v6.1, Claude 3.7 Sonnet, Suno v3.5, Stable Diffusion"
                          className="w-full rounded-md border border-[#ded9cf] bg-white px-3 py-2 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none"
                        />
                        <p className="text-[11px] text-[#8c857b]">
                          This disclosure badge will appear on your project page to preserve provenance.
                        </p>
                      </div>
                    ) : (
                      <div className="pt-2 text-[11px] text-emerald-800 bg-emerald-50/70 border border-emerald-200 rounded-md p-3">
                        ✓ Declared as 100% human-crafted without generative AI assistance.
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-[#ded9cf]">
                    <button
                      type="button"
                      onClick={() => setActiveSection("details")}
                      className="button-secondary text-xs cursor-pointer"
                    >
                      Back: Title &amp; Story
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("tags")}
                      className="button-primary text-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      Next: Medium &amp; Tags
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 4: MEDIUM & TAGS */}
              {activeSection === "tags" && (
                <div className="surface p-6 sm:p-7 space-y-6 animate-in fade-in">
                  <div className="border-b border-[#ded9cf] pb-3">
                    <h3 className="text-base font-bold text-[#151515]">Medium &amp; Categorization</h3>
                    <p className="text-xs text-[#6f6a61] mt-0.5">
                      Select your creative discipline across 33 mediums and specify keyword tags.
                    </p>
                  </div>

                  {/* Discipline / Medium Picker */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942] mb-2">
                      Primary Creative Medium <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2.5 text-sm text-[#151515] focus:border-[#0f766e] focus:outline-none capitalize"
                    >
                      {contentTypes.map((ct) => (
                        <option key={ct} value={ct}>
                          {ct.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Keyword Tags */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                      Keyword Tags <span className="text-xs font-normal lowercase text-[#8c857b]">(comma separated)</span>
                    </label>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="ambient, modular, cinematic, rust, typography, open-source"
                      className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-xs text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-[#ded9cf]">
                    <button
                      type="button"
                      onClick={() => setActiveSection("ai")}
                      className="button-secondary text-xs cursor-pointer"
                    >
                      Back: AI Provenance
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("preview")}
                      className="button-primary text-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      Inspect Live Preview
                      <Eye size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

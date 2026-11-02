"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  Image as ImageIcon,
  Loader2,
  Lock,
  Music,
  Sparkles,
  Trash2,
  UploadCloud,
  Palette,
  Film,
  BookOpen,
  Building2,
  Code,
  Share2,
  Layers,
  Check,
  Star,
} from "lucide-react";
import { PageShell } from "@/components/shell";
import { RoleBadge } from "@/components/role-badge";

interface AuthUser {
  userId: string;
  username: string;
  displayName: string | null;
  role?: string;
  verified?: boolean;
}

// Creative Archetypes for smart contextual workflow
interface Archetype {
  id: "visual_art" | "cinema" | "writing" | "music" | "architecture" | "tech";
  title: string;
  subtitle: string;
  icon: typeof Palette;
  defaultType: string;
  subTypes: { value: string; label: string }[];
  suggestedTags: string[];
}

const ARCHETYPES: Archetype[] = [
  {
    id: "visual_art",
    title: "Fine Art & Photography",
    subtitle: "Paintings, drawings, digital art, photography, craft",
    icon: Palette,
    defaultType: "paintings",
    subTypes: [
      { value: "paintings", label: "Oil, Acrylic & Fine Art" },
      { value: "digital_art", label: "Digital Illustration" },
      { value: "photography", label: "Fine Photography" },
      { value: "graphic_design", label: "Graphic & Poster Art" },
      { value: "handmade_crafts", label: "Handmade Crafts & Sculpture" },
    ],
    suggestedTags: ["fineart", "oilpainting", "canvas", "contemporary", "photography", "digitalart", "exhibition"],
  },
  {
    id: "cinema",
    title: "Cinema & Video",
    subtitle: "Films, animations, short movies, cinematic edits",
    icon: Film,
    defaultType: "films",
    subTypes: [
      { value: "films", label: "Independent Film" },
      { value: "short_movies", label: "Short Movie" },
      { value: "animations", label: "3D & 2D Animation" },
      { value: "cinematic_edits", label: "Cinematic Visual Reel" },
      { value: "documentaries", label: "Documentary Study" },
    ],
    suggestedTags: ["cinema", "shortfilm", "veo", "filmmaking", "animation", "4k", "directorcut"],
  },
  {
    id: "writing",
    title: "Books & Literature",
    subtitle: "Books, poetry, articles, essays, short stories",
    icon: BookOpen,
    defaultType: "books",
    subTypes: [
      { value: "books", label: "Book Manuscript / Novel" },
      { value: "stories", label: "Short Fiction & Story" },
      { value: "poetry", label: "Poetry Anthology" },
      { value: "articles", label: "Longform Essay / Article" },
      { value: "blogs", label: "Creative Journal & Blog" },
    ],
    suggestedTags: ["literature", "fiction", "poetry", "storytelling", "author", "philosophy", "essay"],
  },
  {
    id: "music",
    title: "Music & Audio",
    subtitle: "Original tracks, soundscapes, audio art, podcasts",
    icon: Music,
    defaultType: "music",
    subTypes: [
      { value: "music", label: "Original Single / Album" },
      { value: "songs", label: "Vocal Song / Acoustic" },
      { value: "audio_tracks", label: "Ambient Soundscape / Instrumental" },
      { value: "podcasts", label: "Podcast / Spoken Audio" },
      { value: "ai_music", label: "AI Music Experiment" },
    ],
    suggestedTags: ["music", "sounddesign", "ambient", "indie", "composer", "synthwave", "mastering"],
  },
  {
    id: "architecture",
    title: "Architecture & Space",
    subtitle: "Spatial design, 3D architecture models, structures",
    icon: Building2,
    defaultType: "architecture",
    subTypes: [
      { value: "architecture", label: "Architectural Design" },
      { value: "3d_models", label: "3D Spatial Visualization" },
      { value: "inventions", label: "Spatial & Industrial Design" },
      { value: "fashion_design", label: "Structural Fashion" },
    ],
    suggestedTags: ["architecture", "spatialdesign", "3drender", "minimalism", "blueprint", "concrete", "interior"],
  },
  {
    id: "tech",
    title: "Code & Inventions",
    subtitle: "Apps, games, websites, tech innovations",
    icon: Code,
    defaultType: "apps",
    subTypes: [
      { value: "apps", label: "Mobile or Desktop App" },
      { value: "websites", label: "Web Application / Design" },
      { value: "coding_projects", label: "Open Source Code / Engine" },
      { value: "indie_games", label: "Indie Game" },
      { value: "inventions", label: "Physical Hardware Invention" },
    ],
    suggestedTags: ["opensource", "nextjs", "flutter", "creativecoding", "indiedev", "developer", "innovation"],
  },
];

const DRAFT_KEY = "woh_studio_draft_v3";

export default function UploadStudioPage() {
  const router = useRouter();

  // Cached User State
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

  // Archetype selection
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<Archetype["id"]>("visual_art");
  const activeArchetype = ARCHETYPES.find((a) => a.id === selectedArchetypeId) || ARCHETYPES[0];

  // Studio Mode: "edit" | "preview"
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [previewSubTab, setPreviewSubTab] = useState<"feed" | "project" | "share">("feed");

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<string>("paintings");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [aiProvenance, setAiProvenance] = useState<"human" | "assisted" | "generated">("human");
  const [aiModel, setAiModel] = useState("");

  // Drag and Drop States
  const [isDraggingMaster, setIsDraggingMaster] = useState(false);

  // Upload progress states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    filename: string;
    percent: number;
    loadedFormatted: string;
    totalFormatted: string;
    index: number;
    totalFiles: number;
  } | null>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);

  // Hidden file inputs
  const masterFileInputRef = useRef<HTMLInputElement>(null);
  const posterFileInputRef = useRef<HTMLInputElement>(null);

  // Submission States
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Draft indicator
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftSavedTime, setDraftSavedTime] = useState<string | null>(null);

  // Auth Verification
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
          localStorage.removeItem("woh_cached_user");
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem("woh_cached_user");
      }
    } catch {
      // offline or network issue
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Restore Draft on Initial Mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.title || parsed.description || (parsed.mediaUrls && parsed.mediaUrls.length > 0)) {
            setTitle(parsed.title || "");
            setSlug(parsed.slug || "");
            setType(parsed.type || "paintings");
            setDescription(parsed.description || "");
            setThumbnailUrl(parsed.thumbnailUrl || "");
            setMediaUrls(parsed.mediaUrls || []);
            setTagInput(parsed.tagInput || "");
            setAiProvenance(parsed.aiProvenance || "human");
            setAiModel(parsed.aiModel || "");
            if (parsed.selectedArchetypeId) setSelectedArchetypeId(parsed.selectedArchetypeId);
            setDraftRestored(true);
            setDraftSavedTime(parsed.savedAt ? new Date(parsed.savedAt).toLocaleTimeString() : null);
          }
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Auto-Save Draft to LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const timeout = setTimeout(() => {
        if (title || description || mediaUrls.length > 0 || thumbnailUrl) {
          const payload = {
            title,
            slug,
            type,
            description,
            thumbnailUrl,
            mediaUrls,
            tagInput,
            aiProvenance,
            aiModel,
            selectedArchetypeId,
            savedAt: new Date().toISOString(),
          };
          try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
            setDraftSavedTime(new Date().toLocaleTimeString());
          } catch {
            // quota exceeded
          }
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [title, slug, type, description, thumbnailUrl, mediaUrls, tagInput, aiProvenance, aiModel, selectedArchetypeId]);

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setTitle("");
    setSlug("");
    setDescription("");
    setThumbnailUrl("");
    setMediaUrls([]);
    setTagInput("");
    setAiProvenance("human");
    setAiModel("");
    setDraftRestored(false);
    setDraftSavedTime(null);
  }

  // Format Bytes helper
  function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  function isImage(url: string) {
    return /\.(jpe?g|png|webp|gif|svg|avif)($|\?)/i.test(url) || url.includes("-thumb.");
  }

  function isVideo(url: string) {
    return /\.(mp4|webm|mov|mkv)($|\?)/i.test(url);
  }

  function isAudio(url: string) {
    return /\.(mp3|wav|ogg|m4a|aac|flac)($|\?)/i.test(url);
  }

  // XHR file upload with accurate progress percentage
  function uploadFileWithProgress(
    file: File,
    onProgress: (percent: number, loaded: string, total: string) => void
  ): Promise<{ url: string; size: number }> {
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

  // Master Unified File Upload Handler
  async function handleMasterUpload(files: FileList | File[]) {
    setUploadError(null);
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setUploading(true);
    try {
      const newUrls: string[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadProgress({
          filename: file.name,
          percent: 0,
          loadedFormatted: "0 B",
          totalFormatted: formatBytes(file.size),
          index: i + 1,
          totalFiles: fileList.length,
        });

        const data = await uploadFileWithProgress(file, (percent, loadedFormatted, totalFormatted) => {
          setUploadProgress({
            filename: file.name,
            percent,
            loadedFormatted,
            totalFormatted,
            index: i + 1,
            totalFiles: fileList.length,
          });
        });

        newUrls.push(data.url);
      }

      setMediaUrls((prev) => {
        const combined = [...prev, ...newUrls];
        // Auto-assign first image as thumbnail if none set
        if (!thumbnailUrl) {
          const firstImg = combined.find((u) => isImage(u));
          if (firstImg) setThumbnailUrl(firstImg);
        }
        return combined;
      });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "File upload failed.");
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }

  // Dedicated Poster / Cover Upload for Video or Audio
  async function handlePosterUpload(files: FileList | File[]) {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;
    const file = fileList[0];

    setUploading(true);
    try {
      const data = await uploadFileWithProgress(file, (percent, loadedFormatted, totalFormatted) => {
        setUploadProgress({
          filename: file.name,
          percent,
          loadedFormatted,
          totalFormatted,
          index: 1,
          totalFiles: 1,
        });
      });
      setThumbnailUrl(data.url);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Cover poster upload failed.");
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }

  // Set an image as primary cover & thumbnail with one click
  function setAsCover(url: string) {
    setThumbnailUrl(url);
  }

  // Remove asset from deck
  function removeMedia(indexToRemove: number) {
    const removedUrl = mediaUrls[indexToRemove];
    const updated = mediaUrls.filter((_, idx) => idx !== indexToRemove);
    setMediaUrls(updated);

    // If the removed image was the thumbnail, reassign to the next available image
    if (thumbnailUrl === removedUrl) {
      const nextImg = updated.find((u) => isImage(u));
      setThumbnailUrl(nextImg || "");
    }
  }

  // Add Tag Chip
  function addTag(tag: string) {
    const clean = tag.replace(/^#/, "").trim();
    if (!clean) return;
    const currentTags = tagInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    if (!currentTags.includes(clean.toLowerCase())) {
      const newTagString = currentTags.length > 0 ? `${currentTags.join(", ")}, ${clean}` : clean;
      setTagInput(newTagString);
    }
  }

  // Publish Creation
  async function handleSubmit() {
    setError(null);

    if (!currentUser) {
      router.push("/login?redirect=/studio/upload");
      return;
    }

    if (!title.trim()) {
      setError("Please provide a title for your creative work.");
      return;
    }

    if (mediaUrls.length === 0 && !thumbnailUrl) {
      setError("Please attach at least one photo, video, audio file, or artwork.");
      return;
    }

    setSubmitting(true);

    try {
      const tagsArray = tagInput
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter((t) => t.length > 0);

      // Auto-fallback: if thumbnail is still empty, pick the first image or media
      const resolvedThumbnail = thumbnailUrl || mediaUrls.find((u) => isImage(u)) || mediaUrls[0] || "";

      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        type,
        description: description.trim() || undefined,
        thumbnailUrl: resolvedThumbnail.trim() || undefined,
        mediaUrls: mediaUrls.filter((u) => u.trim().length > 0),
        tags: tagsArray,
        aiGenerated: aiProvenance !== "human",
        aiModel: aiProvenance !== "human" && aiModel.trim() ? aiModel.trim() : undefined,
      };

      const res = await fetch("/api/projects/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish creation.");
      }

      setSuccess(true);
      // Clear draft upon successful publication
      localStorage.removeItem(DRAFT_KEY);

      setTimeout(() => {
        const dest = data.url || `/@${currentUser.username}/${data.slug || ""}`;
        router.push(dest);
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected publishing error occurred.");
      setSubmitting(false);
    }
  }

  // Active cover preview asset
  const primaryDisplayAsset = thumbnailUrl || mediaUrls[0] || "";

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        {/* Top Header & Action Bar */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#ded9cf] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f766e]">
                Creation Studio
              </span>
              {draftSavedTime && (
                <span className="text-[11px] text-[#8c857b] font-mono">
                  • Draft saved {draftSavedTime}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#151515]">
              Publish Original Creative Work
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-2 border border-[#ded9cf] rounded-full px-3 py-1 bg-white text-xs shadow-2xs">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-[#151515]">@{currentUser.username}</span>
                <RoleBadge role={currentUser.role} verified={currentUser.verified} size="sm" />
              </div>
            ) : (
              <span className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-semibold">
                Sign in to publish
              </span>
            )}

            {/* Toggle Edit vs Preview */}
            <div className="inline-flex rounded-full bg-[#e8e4db] p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("edit")}
                className={`rounded-full px-3 py-1.5 transition cursor-pointer ${
                  viewMode === "edit"
                    ? "bg-[#151515] text-white shadow-xs"
                    : "text-[#6f6a61] hover:text-[#151515]"
                }`}
              >
                Edit Mode
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`rounded-full px-3 py-1.5 flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "preview"
                    ? "bg-[#0f766e] text-white shadow-xs"
                    : "text-[#6f6a61] hover:text-[#151515]"
                }`}
              >
                <Eye size={13} />
                Live Preview
              </button>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || success}
              className="button-primary !px-5 !py-2 text-xs font-bold cursor-pointer disabled:opacity-60 flex items-center gap-1.5 shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  Publish Work
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </header>

        {/* Draft Restored Banner */}
        {draftRestored && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="text-base">📝</span>
              <span>
                Restored your unsaved draft from {draftSavedTime || "a previous session"}.
              </span>
            </div>
            <button
              type="button"
              onClick={clearDraft}
              className="text-amber-800 underline font-semibold hover:text-amber-950 cursor-pointer"
            >
              Clear Draft
            </button>
          </div>
        )}

        {/* Global Notifications */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
            <span>Your work has been published! Redirecting to your live portfolio showcase...</span>
          </div>
        )}

        {authLoading ? (
          <div className="surface p-12 text-center max-w-md mx-auto rounded-2xl">
            <Loader2 className="mx-auto animate-spin text-[#0f766e]" size={28} />
            <p className="mt-3 text-xs font-semibold text-[#6f6a61]">Verifying creator credentials...</p>
          </div>
        ) : !currentUser ? (
          <div className="surface p-8 sm:p-12 text-center max-w-md mx-auto rounded-2xl border border-[#ded9cf] space-y-5 shadow-xs my-8">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#0f766e]/10 text-[#0f766e]">
              <Lock size={26} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f766e]">
                Creator Studio Access
              </span>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[#151515]">
                Authentication Required
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#6f6a61]">
                Only authenticated creators can publish to The Work of Human. Sign in to your creator account to continue.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                href="/login?redirect=/studio/upload"
                className="button-primary w-full justify-center !py-2.5 text-xs font-bold"
              >
                Sign In to Your Account
              </Link>
              <Link
                href="/register?redirect=/studio/upload"
                className="button-secondary w-full justify-center !py-2.5 text-xs font-bold"
              >
                Create New Profile
              </Link>
            </div>
          </div>
        ) : viewMode === "preview" ? (
          /* ================================================================= */
          /* 3-WAY LIVE PREVIEW MODE (FEED CARD, PROJECT PAGE, WHATSAPP SHARE)  */
          /* ================================================================= */
          <div className="space-y-6 animate-in fade-in">
            {/* Preview Tabs */}
            <div className="flex items-center justify-between border-b border-[#ded9cf] pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewSubTab("feed")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    previewSubTab === "feed"
                      ? "bg-[#151515] text-white"
                      : "text-[#6f6a61] hover:bg-[#f6f4ef]"
                  }`}
                >
                  <Layers size={13} />
                  Home Feed Card
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSubTab("project")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    previewSubTab === "project"
                      ? "bg-[#151515] text-white"
                      : "text-[#6f6a61] hover:bg-[#f6f4ef]"
                  }`}
                >
                  <Eye size={13} />
                  Project Showcase Page
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSubTab("share")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    previewSubTab === "share"
                      ? "bg-[#151515] text-white"
                      : "text-[#6f6a61] hover:bg-[#f6f4ef]"
                  }`}
                >
                  <Share2 size={13} />
                  WhatsApp / Social Share
                </button>
              </div>

              <span className="text-[11px] font-mono text-[#8c857b]">
                {mediaUrls.length} media attached
              </span>
            </div>

            {/* TAB 1: FEED CARD PREVIEW */}
            {previewSubTab === "feed" && (
              <div className="max-w-md mx-auto py-8">
                <p className="text-xs font-bold text-[#8c857b] uppercase tracking-wider mb-3 text-center">
                  How viewers will see your work on the Homepage Feed
                </p>
                <div className="surface rounded-2xl overflow-hidden border border-[#ded9cf] shadow-md group">
                  <div className="relative aspect-[16/9] w-full bg-[#151515] overflow-hidden">
                    {primaryDisplayAsset && isVideo(primaryDisplayAsset) ? (
                      <video src={primaryDisplayAsset} className="w-full h-full object-cover" />
                    ) : primaryDisplayAsset ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={primaryDisplayAsset}
                        alt="Preview card"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-[#8c857b] text-xs">
                        No image uploaded yet
                      </div>
                    )}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="rounded-full bg-white/95 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-[#151515] uppercase tracking-wider shadow-xs capitalize">
                        {type.replaceAll("_", " ")}
                      </span>
                      {aiProvenance !== "human" && (
                        <span className="rounded-full bg-[#0f766e]/90 text-white px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 shadow-xs">
                          <Sparkles size={10} />
                          AI Disclosed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-2 bg-white">
                    <h3 className="font-bold text-[#151515] text-base line-clamp-1">
                      {title || "Untitled Creation"}
                    </h3>
                    <p className="text-xs text-[#6f6a61] line-clamp-2 leading-relaxed">
                      {description || "No description provided yet."}
                    </p>
                    <div className="pt-2 border-t border-[#ded9cf] flex items-center justify-between text-xs text-[#8c857b]">
                      <span className="font-mono font-semibold text-[#151515]">
                        @{currentUser.username}
                      </span>
                      <span className="text-[11px] text-[#0f766e] font-semibold">Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PROJECT SHOWCASE PAGE PREVIEW */}
            {previewSubTab === "project" && (
              <div className="surface p-6 sm:p-8 rounded-2xl border border-[#ded9cf] space-y-6">
                <div className="flex items-center justify-between border-b border-[#ded9cf] pb-4">
                  <div>
                    <span className="text-[11px] font-bold text-[#0f766e] uppercase tracking-wider">
                      {activeArchetype.title}
                    </span>
                    <h2 className="text-2xl font-bold text-[#151515] mt-0.5">
                      {title || "Untitled Creation"}
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#151515] px-3 py-1 text-xs font-bold text-white capitalize">
                    {type.replaceAll("_", " ")}
                  </span>
                </div>

                {/* Primary Media Display */}
                <div className="overflow-hidden rounded-xl bg-black/5 border border-[#ded9cf]">
                  {primaryDisplayAsset && isVideo(primaryDisplayAsset) ? (
                    <video src={primaryDisplayAsset} controls className="w-full aspect-video bg-black" />
                  ) : primaryDisplayAsset && isAudio(primaryDisplayAsset) ? (
                    <div className="p-8 text-center bg-[#151515] text-white">
                      <Music className="mx-auto text-[#0f766e] mb-3" size={36} />
                      <p className="font-bold">{title || "Audio Track"}</p>
                      <audio src={primaryDisplayAsset} controls className="mt-4 mx-auto w-full max-w-md" />
                    </div>
                  ) : primaryDisplayAsset ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={primaryDisplayAsset}
                      alt="Primary showcase"
                      className="w-full max-h-[600px] object-contain bg-[#f0ede6]"
                    />
                  ) : (
                    <div className="p-16 text-center text-[#8c857b] text-xs">
                      No media uploaded yet. Return to Edit Mode to drag &amp; drop photos.
                    </div>
                  )}
                </div>

                {/* Narrative Statement */}
                {description && (
                  <div className="bg-[#fcfbfa] p-5 rounded-xl border border-[#ded9cf]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6f6a61] mb-2">
                      Artist Narrative &amp; Statement
                    </h4>
                    <p className="text-xs sm:text-sm text-[#151515] leading-relaxed whitespace-pre-wrap">
                      {description}
                    </p>
                  </div>
                )}

                {/* Multi-Photo Carousel / Media Reel */}
                {mediaUrls.length > 1 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6f6a61]">
                      Additional Exhibition Reel ({mediaUrls.length - 1} more assets)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {mediaUrls.slice(1).map((url, i) => (
                        <div key={i} className="rounded-lg border border-[#ded9cf] overflow-hidden bg-black/5">
                          {isImage(url) ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={url} alt={`Asset ${i + 2}`} className="w-full h-36 object-cover" />
                          ) : isVideo(url) ? (
                            <video src={url} controls className="w-full h-36 object-cover bg-black" />
                          ) : (
                            <div className="p-4 text-xs font-mono text-center truncate">{url}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: WHATSAPP & SOCIAL SHARE PREVIEW */}
            {previewSubTab === "share" && (
              <div className="max-w-md mx-auto py-8">
                <p className="text-xs font-bold text-[#8c857b] uppercase tracking-wider mb-3 text-center">
                  WhatsApp &amp; Social Message Link Preview
                </p>
                {/* WhatsApp Chat Bubble */}
                <div className="bg-[#1f2c34] text-white p-3.5 rounded-2xl rounded-tl-sm shadow-xl space-y-2 border border-[#2a3942]">
                  <div className="rounded-xl overflow-hidden bg-black border border-white/10 aspect-[16/9] relative">
                    {primaryDisplayAsset ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={primaryDisplayAsset}
                        alt="Share thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-xs text-white/50">
                        Artwork Thumbnail
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5 px-1">
                    <p className="font-bold text-sm text-white line-clamp-1">
                      {title || "Untitled Creation"}
                    </p>
                    <p className="text-xs text-white/70 line-clamp-2">
                      {description || "Explore original human & AI creations on The Work of Human."}
                    </p>
                    <p className="text-[11px] font-mono text-[#53bdeb] pt-1">
                      theworkofhuman.com
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================================================================= */
          /* SMART STUDIO EDIT WORKSPACE                                       */
          /* ================================================================= */
          <div className="space-y-8 animate-in fade-in">
            {/* 1. CREATIVE ARCHETYPE SELECTOR CARDS */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#4d4942]">
                1. Select Creative Discipline
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {ARCHETYPES.map((arch) => {
                  const Icon = arch.icon;
                  const isSelected = selectedArchetypeId === arch.id;
                  return (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => {
                        setSelectedArchetypeId(arch.id);
                        setType(arch.defaultType);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between h-32 ${
                        isSelected
                          ? "border-[#0f766e] bg-[#0f766e]/8 ring-2 ring-[#0f766e]/20 shadow-xs"
                          : "border-[#ded9cf] bg-white hover:border-[#0f766e]/60 hover:bg-[#fcfbfa]"
                      }`}
                    >
                      <div
                        className={`size-9 rounded-xl grid place-items-center ${
                          isSelected ? "bg-[#0f766e] text-white" : "bg-[#ded9cf]/40 text-[#6f6a61]"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[#151515] line-clamp-1">{arch.title}</p>
                        <p className="text-[10px] text-[#8c857b] line-clamp-1 mt-0.5">
                          {arch.subTypes[0].label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Sub-Medium Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-[#8c857b] mr-1">Specific Medium:</span>
                {activeArchetype.subTypes.map((sub) => (
                  <button
                    key={sub.value}
                    type="button"
                    onClick={() => setType(sub.value)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                      type === sub.value
                        ? "bg-[#151515] text-white shadow-2xs"
                        : "border border-[#ded9cf] bg-white text-[#555047] hover:bg-[#f6f4ef]"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. UNIFIED MASTER MEDIA DECK (SMART AUTO-THUMBNAIL) */}
            <div className="surface p-6 sm:p-7 rounded-2xl border border-[#ded9cf] space-y-6">
              <div className="flex items-center justify-between border-b border-[#ded9cf] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#151515]">
                    2. Media Assets &amp; Gallery
                  </h3>
                  <p className="text-xs text-[#6f6a61] mt-0.5">
                    {selectedArchetypeId === "visual_art"
                      ? "Drop your artwork, painting, or photos. Your first photo automatically becomes the showcase cover and thumbnail!"
                      : selectedArchetypeId === "cinema"
                      ? "Drop your high-resolution film or animation video file."
                      : selectedArchetypeId === "music"
                      ? "Drop your original music track (WAV, MP3, FLAC)."
                      : "Drag & drop your creative assets."}
                  </p>
                </div>
                <span className="text-xs font-bold text-[#0f766e] bg-[#0f766e]/10 px-3 py-1 rounded-full">
                  Up to 250MB per file
                </span>
              </div>

              {uploadError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Master Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingMaster(true);
                }}
                onDragLeave={() => setIsDraggingMaster(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingMaster(false);
                  if (e.dataTransfer.files) handleMasterUpload(e.dataTransfer.files);
                }}
                onClick={() => masterFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                  isDraggingMaster
                    ? "border-[#0f766e] bg-[#0f766e]/10 scale-[1.01]"
                    : "border-[#ded9cf] hover:border-[#0f766e] bg-[#fbfaf7] hover:bg-[#f6f4ef]"
                }`}
              >
                <input
                  ref={masterFileInputRef}
                  type="file"
                  multiple
                  accept={
                    selectedArchetypeId === "cinema"
                      ? "video/*,image/*"
                      : selectedArchetypeId === "music"
                      ? "audio/*,image/*"
                      : "image/*,video/*,audio/*"
                  }
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleMasterUpload(e.target.files);
                  }}
                />

                {uploading && uploadProgress ? (
                  <div className="w-full max-w-sm mx-auto space-y-2 p-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#151515] truncate max-w-[200px]">
                        {uploadProgress.filename}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#0f766e]/10 px-2.5 py-0.5 text-xs font-mono font-bold text-[#0f766e]">
                        {uploadProgress.percent}%
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-[#ded9cf]/50 p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-[#0f766e] to-teal-400 transition-all duration-150 ease-out rounded-full shadow-xs"
                        style={{ width: `${Math.max(4, uploadProgress.percent)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#8c857b]">
                      <span>
                        File {uploadProgress.index} of {uploadProgress.totalFiles} ({uploadProgress.loadedFormatted} / {uploadProgress.totalFormatted})
                      </span>
                      <span className="font-semibold text-[#0f766e]">
                        {uploadProgress.percent === 100 ? "Processing on VPS..." : "Uploading..."}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="grid size-12 place-items-center rounded-2xl bg-white shadow-xs text-[#0f766e] border border-[#ded9cf]">
                      <UploadCloud size={24} />
                    </div>
                    <p className="text-sm font-bold text-[#151515]">
                      Drag &amp; drop files here, or <span className="text-[#0f766e] underline">browse your device</span>
                    </p>
                    <p className="text-xs text-[#8c857b]">
                      Supports high-resolution PNG, JPG, WebP, MP4, MOV, MP3, WAV
                    </p>
                  </div>
                )}
              </div>

              {/* UPLOADED PHOTO / MEDIA GALLERY DECK */}
              {mediaUrls.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#4d4942]">
                      Uploaded Deck ({mediaUrls.length})
                    </h4>
                    <span className="text-[11px] text-[#8c857b]">
                      Click <strong className="text-amber-800">Set as Cover</strong> on any photo to choose the thumbnail
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {mediaUrls.map((url, idx) => {
                      const isCover = thumbnailUrl === url || (!thumbnailUrl && idx === 0);
                      return (
                        <div
                          key={idx}
                          className={`relative rounded-xl overflow-hidden border p-1 bg-white shadow-2xs group transition ${
                            isCover
                              ? "border-amber-400 ring-2 ring-amber-400/30"
                              : "border-[#ded9cf] hover:border-[#0f766e]"
                          }`}
                        >
                          <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#e9e4da]">
                            {isImage(url) ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={url} alt={`Media ${idx + 1}`} className="size-full object-cover" />
                            ) : isVideo(url) ? (
                              <video src={url} className="size-full object-cover bg-black" />
                            ) : (
                              <div className="grid size-full place-items-center bg-[#151515] text-white">
                                <Music size={28} className="text-[#0f766e]" />
                              </div>
                            )}

                            {/* Cover Badge */}
                            {isCover && (
                              <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-bold shadow-xs">
                                <Star size={10} className="fill-current" />
                                Main Cover
                              </div>
                            )}

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => removeMedia(idx)}
                              className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-black/60 text-white hover:bg-rose-600 transition cursor-pointer shadow-xs"
                              title="Delete file"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          {/* Footer Action */}
                          <div className="p-2 flex items-center justify-between text-xs">
                            <span className="text-[10px] font-mono text-[#8c857b] truncate max-w-[100px]">
                              Asset {idx + 1}
                            </span>
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => setAsCover(url)}
                                className="text-[11px] font-bold text-[#0f766e] hover:underline cursor-pointer"
                              >
                                Set as Cover
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Optional Custom Cover Poster for Video or Audio */}
              {(selectedArchetypeId === "cinema" || selectedArchetypeId === "music") && (
                <div className="pt-4 border-t border-[#ded9cf] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#4d4942]">
                      {selectedArchetypeId === "cinema" ? "Custom Video Poster Cover" : "Album Artwork / Cover"}
                    </label>
                    {thumbnailUrl && (
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check size={12} /> Attached
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {thumbnailUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={thumbnailUrl}
                        alt="Custom cover"
                        className="size-16 rounded-xl object-cover border border-[#ded9cf]"
                      />
                    ) : (
                      <div className="size-16 rounded-xl border border-dashed border-[#ded9cf] grid place-items-center text-[#8c857b]">
                        <ImageIcon size={20} />
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <button
                        type="button"
                        onClick={() => posterFileInputRef.current?.click()}
                        className="button-secondary !py-1.5 !px-3 text-xs font-bold cursor-pointer"
                      >
                        {thumbnailUrl ? "Replace Poster Artwork" : "Upload Custom Poster Image"}
                      </button>
                      <input
                        ref={posterFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) handlePosterUpload(e.target.files);
                        }}
                      />
                      <p className="text-[11px] text-[#8c857b]">
                        Recommended 16:9 for cinema posters, 1:1 for music albums.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. TITLE, STORY & ARTIST STATEMENT */}
            <div className="surface p-6 sm:p-7 rounded-2xl border border-[#ded9cf] space-y-5">
              <h3 className="text-base font-bold text-[#151515] border-b border-[#ded9cf] pb-3">
                3. Title, Narrative &amp; Artist Statement
              </h3>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#4d4942]">
                    Creation Title <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-[#8c857b] font-mono">{title.length}/100</span>
                </div>
                <input
                  type="text"
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Whispers of the Valley, Urban Echoes #04, Neon Solitude..."
                  className="w-full rounded-xl border border-[#ded9cf] bg-white px-4 py-2.5 text-sm text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none shadow-2xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#4d4942]">
                  Artist Narrative &amp; Story Statement
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share the inspiration, medium, creative process, or story behind this piece..."
                  className="w-full rounded-xl border border-[#ded9cf] bg-white px-4 py-3 text-xs leading-relaxed text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none shadow-2xs resize-y"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#4d4942]">
                  Custom URL Slug <span className="text-[10px] text-[#8c857b] font-normal">(Optional)</span>
                </label>
                <div className="flex items-center rounded-xl border border-[#ded9cf] bg-white px-3 py-2 text-xs text-[#6f6a61] shadow-2xs">
                  <span className="font-mono text-[#8c857b]">theworkofhuman.com/@{currentUser.username}/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                    placeholder="my-creation-title"
                    className="flex-1 bg-transparent px-1 font-mono font-bold text-[#151515] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. TRANSPARENT AI PROVENANCE & DISCLOSURE */}
            <div className="surface p-6 sm:p-7 rounded-2xl border border-[#ded9cf] space-y-4">
              <div className="border-b border-[#ded9cf] pb-3">
                <h3 className="text-base font-bold text-[#151515]">
                  4. Transparent Creation Provenance
                </h3>
                <p className="text-xs text-[#6f6a61] mt-0.5">
                  The Work of Human celebrates both traditional craftsmanship and modern AI tooling. We believe in transparent labeling.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setAiProvenance("human")}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    aiProvenance === "human"
                      ? "border-[#0f766e] bg-[#0f766e]/10 ring-2 ring-[#0f766e]/20"
                      : "border-[#ded9cf] bg-white hover:border-[#ded9cf]/80"
                  }`}
                >
                  <span className="text-lg">🌿</span>
                  <div className="mt-2">
                    <p className="font-bold text-xs text-[#151515]">100% Human-Crafted</p>
                    <p className="text-[10px] text-[#8c857b] mt-0.5">
                      Handmade, painted, filmed, or performed without generative AI.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAiProvenance("assisted")}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    aiProvenance === "assisted"
                      ? "border-[#0f766e] bg-[#0f766e]/10 ring-2 ring-[#0f766e]/20"
                      : "border-[#ded9cf] bg-white hover:border-[#ded9cf]/80"
                  }`}
                >
                  <span className="text-lg">✨</span>
                  <div className="mt-2">
                    <p className="font-bold text-xs text-[#151515]">AI-Assisted Hybrid</p>
                    <p className="text-[10px] text-[#8c857b] mt-0.5">
                      Human concept, editing, or composition enhanced with AI tools.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAiProvenance("generated")}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    aiProvenance === "generated"
                      ? "border-[#0f766e] bg-[#0f766e]/10 ring-2 ring-[#0f766e]/20"
                      : "border-[#ded9cf] bg-white hover:border-[#ded9cf]/80"
                  }`}
                >
                  <span className="text-lg">🤖</span>
                  <div className="mt-2">
                    <p className="font-bold text-xs text-[#151515]">AI-Generated</p>
                    <p className="text-[10px] text-[#8c857b] mt-0.5">
                      Created primarily via prompt-to-media generative synthesis.
                    </p>
                  </div>
                </button>
              </div>

              {aiProvenance !== "human" && (
                <div className="pt-2 animate-in fade-in space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#4d4942]">
                    AI Tool / Model Attribution
                  </label>
                  <input
                    type="text"
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    placeholder="e.g. Google Veo, Midjourney v6, Runway Gen-3, Suno v3.5, ChatGPT..."
                    className="w-full rounded-xl border border-[#ded9cf] bg-white px-4 py-2 text-xs text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none shadow-2xs font-mono"
                  />
                </div>
              )}
            </div>

            {/* 5. SMART TAGS & DISCOVERY */}
            <div className="surface p-6 sm:p-7 rounded-2xl border border-[#ded9cf] space-y-4">
              <div className="border-b border-[#ded9cf] pb-3">
                <h3 className="text-base font-bold text-[#151515]">
                  5. Tags &amp; Discovery Keywords
                </h3>
                <p className="text-xs text-[#6f6a61] mt-0.5">
                  Click suggested tags to add them instantly, or type custom tags separated by commas.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#8c857b] mr-1">One-Click Suggestions:</span>
                  {activeArchetype.suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="rounded-full px-2.5 py-1 text-xs font-semibold bg-[#ded9cf]/40 text-[#444] hover:bg-[#0f766e] hover:text-white transition cursor-pointer"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="oilpainting, surrealism, fineart, 4k, portrait (comma-separated)"
                  className="w-full rounded-xl border border-[#ded9cf] bg-white px-4 py-2.5 text-xs text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none shadow-2xs"
                />
              </div>
            </div>

            {/* Bottom Final Action Bar */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className="button-secondary !py-2.5 !px-5 text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Eye size={14} />
                Preview Before Publishing
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || success}
                className="button-primary !py-2.5 !px-8 text-xs font-bold cursor-pointer disabled:opacity-60 flex items-center gap-2 shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Publishing Creation...
                  </>
                ) : (
                  <>
                    Publish to The Work of Human
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Loader2,
  Lock,
  Music,
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
  MapPin,
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

// Creative Archetypes
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
    subtitle: "Paintings, drawings, photos, digital craft",
    icon: Palette,
    defaultType: "paintings",
    subTypes: [
      { value: "paintings", label: "Oil, Acrylic & Fine Art" },
      { value: "digital_art", label: "Digital Illustration" },
      { value: "photography", label: "Fine Photography" },
      { value: "graphic_design", label: "Graphic & Poster Art" },
      { value: "handmade_crafts", label: "Handmade Crafts" },
    ],
    suggestedTags: ["fineart", "oilpainting", "canvas", "contemporary", "photography", "digitalart"],
  },
  {
    id: "cinema",
    title: "Cinema & Video",
    subtitle: "Films, animations, short movies, reels",
    icon: Film,
    defaultType: "films",
    subTypes: [
      { value: "films", label: "Independent Film" },
      { value: "short_movies", label: "Short Movie" },
      { value: "animations", label: "3D & 2D Animation" },
      { value: "cinematic_edits", label: "Cinematic Visual Reel" },
      { value: "documentaries", label: "Documentary Study" },
    ],
    suggestedTags: ["cinema", "shortfilm", "veo", "filmmaking", "animation", "4k"],
  },
  {
    id: "writing",
    title: "Books & Literature",
    subtitle: "Books, poetry, articles, stories, essays",
    icon: BookOpen,
    defaultType: "books",
    subTypes: [
      { value: "books", label: "Book Manuscript / Novel" },
      { value: "stories", label: "Short Story" },
      { value: "poetry", label: "Poetry Anthology" },
      { value: "articles", label: "Longform Essay" },
    ],
    suggestedTags: ["literature", "fiction", "poetry", "storytelling", "author", "philosophy"],
  },
  {
    id: "music",
    title: "Music & Audio",
    subtitle: "Original tracks, soundscapes, audio art",
    icon: Music,
    defaultType: "music",
    subTypes: [
      { value: "music", label: "Original Single / Album" },
      { value: "audio_tracks", label: "Ambient Soundscape" },
      { value: "songs", label: "Vocal Track" },
      { value: "podcasts", label: "Podcast / Spoken" },
    ],
    suggestedTags: ["music", "sounddesign", "ambient", "indie", "composer", "synthwave"],
  },
  {
    id: "architecture",
    title: "Architecture & Space",
    subtitle: "Spatial design, 3D architecture, blueprints",
    icon: Building2,
    defaultType: "architecture",
    subTypes: [
      { value: "architecture", label: "Architectural Design" },
      { value: "3d_models", label: "3D Spatial Visualization" },
      { value: "inventions", label: "Spatial Invention" },
    ],
    suggestedTags: ["architecture", "spatialdesign", "3drender", "minimalism", "blueprint"],
  },
  {
    id: "tech",
    title: "Code & Inventions",
    subtitle: "Apps, games, websites, tech innovations",
    icon: Code,
    defaultType: "apps",
    subTypes: [
      { value: "apps", label: "Mobile or Desktop App" },
      { value: "websites", label: "Web Platform" },
      { value: "coding_projects", label: "Open Source Code" },
      { value: "indie_games", label: "Indie Game" },
    ],
    suggestedTags: ["opensource", "nextjs", "flutter", "creativecoding", "indiedev"],
  },
];

const POPULAR_LOCATIONS = [
  "New York, USA",
  "London, UK",
  "Paris, France",
  "Tokyo, Japan",
  "Berlin, Germany",
  "Delhi, India",
  "Seoul, South Korea",
  "Toronto, Canada",
  "Amsterdam, Netherlands",
  "Sydney, Australia",
];

const DRAFT_KEY = "woh_studio_draft_v4";

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

  // Step state: 1 = Media & Discipline, 2 = Story & Studio Location, 3 = Provenance & Discovery
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Archetype selection (default is Fine Art & Photography)
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<Archetype["id"]>("visual_art");
  const activeArchetype = ARCHETYPES.find((a) => a.id === selectedArchetypeId) || ARCHETYPES[0];

  // Studio Mode: "wizard" | "preview"
  const [viewMode, setViewMode] = useState<"wizard" | "preview">("wizard");
  const [previewSubTab, setPreviewSubTab] = useState<"feed" | "project" | "share">("feed");

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<string>("paintings");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [aiProvenance, setAiProvenance] = useState<"human" | "assisted" | "generated">("human");
  const [aiModel, setAiModel] = useState("");

  // Drag and Drop
  const [isDraggingMaster, setIsDraggingMaster] = useState(false);

  // Upload progress
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
      // offline
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
            setLocation(parsed.location || "");
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
            location,
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
            // quota
          }
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [title, slug, type, description, location, thumbnailUrl, mediaUrls, tagInput, aiProvenance, aiModel, selectedArchetypeId]);

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setTitle("");
    setSlug("");
    setDescription("");
    setLocation("");
    setThumbnailUrl("");
    setMediaUrls([]);
    setTagInput("");
    setAiProvenance("human");
    setAiModel("");
    setDraftRestored(false);
    setDraftSavedTime(null);
  }

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

  // Master Unified Upload Handler
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

  function setAsCover(url: string) {
    setThumbnailUrl(url);
  }

  function removeMedia(indexToRemove: number) {
    const removedUrl = mediaUrls[indexToRemove];
    const updated = mediaUrls.filter((_, idx) => idx !== indexToRemove);
    setMediaUrls(updated);

    if (thumbnailUrl === removedUrl) {
      const nextImg = updated.find((u) => isImage(u));
      setThumbnailUrl(nextImg || "");
    }
  }

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

  // Submit to API
  async function handleSubmit() {
    setError(null);

    if (!currentUser) {
      router.push("/login?redirect=/studio/upload");
      return;
    }

    if (!title.trim()) {
      setError("Please provide a title for your creative work in Step 2.");
      setCurrentStep(2);
      return;
    }

    if (mediaUrls.length === 0 && !thumbnailUrl) {
      setError("Please upload at least one photo, artwork, or video in Step 1.");
      setCurrentStep(1);
      return;
    }

    setSubmitting(true);

    try {
      const tagsArray = tagInput
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter((t) => t.length > 0);

      const resolvedThumbnail = thumbnailUrl || mediaUrls.find((u) => isImage(u)) || mediaUrls[0] || "";

      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        type,
        description: description.trim() || undefined,
        location: location.trim() || undefined,
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

  const primaryDisplayAsset = thumbnailUrl || mediaUrls[0] || "";

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        {/* Top Header */}
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#ded9cf] pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f766e]">
                Creative Studio
              </span>
              {draftSavedTime && (
                <span className="text-[10px] text-[#8c857b] font-mono">
                  • Draft saved {draftSavedTime}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#151515]">
              Publish Original Work
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 border border-[#ded9cf] rounded-full px-3 py-1 bg-white text-xs shadow-2xs">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-[#151515]">@{currentUser.username}</span>
                <RoleBadge role={currentUser.role} verified={currentUser.verified} size="sm" />
              </div>
            )}

            <button
              type="button"
              onClick={() => setViewMode(viewMode === "preview" ? "wizard" : "preview")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === "preview"
                  ? "bg-[#0f766e] text-white shadow-xs"
                  : "border border-[#ded9cf] bg-white text-[#151515] hover:bg-[#f6f4ef]"
              }`}
            >
              <Eye size={13} />
              {viewMode === "preview" ? "Edit Steps" : "Live Preview"}
            </button>
          </div>
        </header>

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
            <span>Published successfully! Redirecting to your portfolio showcase...</span>
          </div>
        )}

        {draftRestored && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
            <span>📝 Restored your unsaved draft from {draftSavedTime || "earlier"}.</span>
            <button
              type="button"
              onClick={clearDraft}
              className="text-amber-800 underline font-semibold hover:text-amber-950 cursor-pointer"
            >
              Clear
            </button>
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
                Only authenticated creators can publish to The Work of Human.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                href="/login?redirect=/studio/upload"
                className="button-primary w-full justify-center !py-2.5 text-xs font-bold"
              >
                Sign In to Your Account
              </Link>
            </div>
          </div>
        ) : viewMode === "preview" ? (
          /* ================================================================= */
          /* 3-WAY LIVE PREVIEW MODE                                           */
          /* ================================================================= */
          <div className="space-y-6 animate-in fade-in">
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
                  Project Page
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
                  WhatsApp Share Card
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewMode("wizard")}
                className="text-xs font-bold text-[#0f766e] hover:underline cursor-pointer"
              >
                ← Back to Editing
              </button>
            </div>

            {previewSubTab === "feed" && (
              <div className="max-w-md mx-auto py-6">
                <div className="surface rounded-2xl overflow-hidden border border-[#ded9cf] shadow-md">
                  <div className="relative aspect-[16/9] w-full bg-[#151515] overflow-hidden">
                    {primaryDisplayAsset ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={primaryDisplayAsset} alt="Preview card" className="w-full h-full object-cover" />
                    ) : (
                      <div className="grid size-full place-items-center text-white/50 text-xs">
                        No image uploaded
                      </div>
                    )}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="rounded-full bg-white/95 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-[#151515] uppercase tracking-wider shadow-xs capitalize">
                        {type.replaceAll("_", " ")}
                      </span>
                      {location && (
                        <span className="rounded-full bg-black/70 backdrop-blur-md text-white px-2.5 py-0.5 text-[10px] font-semibold flex items-center gap-1 border border-white/20">
                          <MapPin size={10} className="text-amber-400" />
                          {location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-2 bg-white">
                    <h3 className="font-bold text-[#151515] text-base line-clamp-1">
                      {title || "Untitled Creation"}
                    </h3>
                    <p className="text-xs text-[#6f6a61] line-clamp-2 leading-relaxed">
                      {description || "Original work created by @" + currentUser.username}
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

            {previewSubTab === "project" && (
              <div className="surface p-6 sm:p-8 rounded-2xl border border-[#ded9cf] space-y-5">
                <div className="flex items-center justify-between border-b border-[#ded9cf] pb-4">
                  <div>
                    {location && (
                      <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1 uppercase tracking-wider mb-1">
                        <MapPin size={12} /> Origin: {location}
                      </p>
                    )}
                    <h2 className="text-2xl font-bold text-[#151515]">
                      {title || "Untitled Creation"}
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#151515] px-3 py-1 text-xs font-bold text-white capitalize">
                    {type.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="overflow-hidden rounded-xl bg-black/5 border border-[#ded9cf]">
                  {primaryDisplayAsset ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={primaryDisplayAsset}
                      alt="Primary showcase"
                      className="w-full max-h-[500px] object-contain bg-[#f0ede6]"
                    />
                  ) : (
                    <div className="p-16 text-center text-[#8c857b] text-xs">No media uploaded yet.</div>
                  )}
                </div>

                {description && (
                  <div className="bg-[#fcfbfa] p-5 rounded-xl border border-[#ded9cf]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6f6a61] mb-2">
                      Artist Narrative
                    </h4>
                    <p className="text-xs sm:text-sm text-[#151515] leading-relaxed whitespace-pre-wrap">
                      {description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {previewSubTab === "share" && (
              <div className="max-w-md mx-auto py-6">
                <div className="bg-[#1f2c34] text-white p-3.5 rounded-2xl rounded-tl-sm shadow-xl space-y-2 border border-[#2a3942]">
                  <div className="rounded-xl overflow-hidden bg-black border border-white/10 aspect-[16/9] relative">
                    {primaryDisplayAsset && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={primaryDisplayAsset} alt="Share thumbnail" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="space-y-0.5 px-1">
                    <p className="font-bold text-sm text-white line-clamp-1">{title || "Untitled Creation"}</p>
                    <p className="text-xs text-white/70 line-clamp-2">
                      {location ? `[${location}] ` : ""}
                      {description || "Explore original human creations on The Work of Human."}
                    </p>
                    <p className="text-[11px] font-mono text-[#53bdeb] pt-1">theworkofhuman.com</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================================================================= */
          /* GUIDED STEPPER WIZARD (CLEAN 3-STEP FLOW)                         */
          /* ================================================================= */
          <div className="space-y-6 animate-in fade-in">
            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-3 gap-2 bg-[#e9e4da]/60 p-1.5 rounded-2xl border border-[#ded9cf]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  currentStep === 1
                    ? "bg-white text-[#151515] shadow-xs"
                    : currentStep > 1
                    ? "text-[#0f766e] hover:bg-white/50"
                    : "text-[#8c857b]"
                }`}
              >
                <span className={`size-5 rounded-full grid place-items-center text-[10px] ${
                  currentStep > 1 ? "bg-[#0f766e] text-white" : currentStep === 1 ? "bg-[#151515] text-white" : "bg-[#ded9cf] text-[#6f6a61]"
                }`}>
                  {currentStep > 1 ? <Check size={11} /> : "1"}
                </span>
                <span className="hidden sm:inline">1. Media &amp; Art</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  currentStep === 2
                    ? "bg-white text-[#151515] shadow-xs"
                    : currentStep > 2
                    ? "text-[#0f766e] hover:bg-white/50"
                    : "text-[#8c857b]"
                }`}
              >
                <span className={`size-5 rounded-full grid place-items-center text-[10px] ${
                  currentStep > 2 ? "bg-[#0f766e] text-white" : currentStep === 2 ? "bg-[#151515] text-white" : "bg-[#ded9cf] text-[#6f6a61]"
                }`}>
                  {currentStep > 2 ? <Check size={11} /> : "2"}
                </span>
                <span className="hidden sm:inline">2. Story &amp; Location</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  currentStep === 3
                    ? "bg-white text-[#151515] shadow-xs"
                    : "text-[#8c857b]"
                }`}
              >
                <span className={`size-5 rounded-full grid place-items-center text-[10px] ${
                  currentStep === 3 ? "bg-[#151515] text-white" : "bg-[#ded9cf] text-[#6f6a61]"
                }`}>
                  3
                </span>
                <span className="hidden sm:inline">3. Review &amp; Publish</span>
              </button>
            </div>

            {/* STEP 1: MEDIA & DISCIPLINE (SIMPLIFIED & CLEAN) */}
            {currentStep === 1 && (
              <div className="surface p-6 sm:p-7 rounded-2xl border border-[#ded9cf] space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#151515]">Step 1: Upload Your Creative Work</h2>
                  <p className="text-xs text-[#6f6a61] mt-0.5">
                    Drag and drop your photos, paintings, video, or audio. Your first photo automatically becomes the showcase cover and thumbnail!
                  </p>
                </div>

                {/* Simplified Discipline Chips */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#4d4942]">
                    Discipline / Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
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
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? "border-[#0f766e] bg-[#0f766e]/10 text-[#0f766e] font-bold"
                              : "border-[#ded9cf] bg-white text-[#6f6a61] hover:bg-[#fcfbfa]"
                          }`}
                        >
                          <Icon size={16} />
                          <span className="text-[11px] leading-tight">{arch.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {uploadError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Unified Master Dropzone */}
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
                    accept="image/*,video/*,audio/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleMasterUpload(e.target.files);
                    }}
                  />

                  {uploading && uploadProgress ? (
                    <div className="w-full max-w-sm mx-auto space-y-2 p-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#151515] truncate max-w-[200px]">
                          {uploadProgress.filename}
                        </span>
                        <span className="font-mono font-bold text-[#0f766e]">
                          {uploadProgress.percent}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#ded9cf]/50">
                        <div
                          className="h-full bg-[#0f766e] transition-all duration-150 ease-out rounded-full"
                          style={{ width: `${Math.max(4, uploadProgress.percent)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-[#8c857b]">
                        Uploading file {uploadProgress.index} of {uploadProgress.totalFiles}...
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="grid size-12 place-items-center rounded-2xl bg-white shadow-xs text-[#0f766e] border border-[#ded9cf]">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-sm font-bold text-[#151515]">
                        Drag &amp; drop your artwork, photo, or video here
                      </p>
                      <p className="text-xs text-[#8c857b]">
                        Supports PNG, JPG, WebP, MP4, MOV, MP3 (Up to 250MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Uploaded Gallery Deck */}
                {mediaUrls.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#4d4942]">
                        Attached Media ({mediaUrls.length})
                      </h4>
                      <span className="text-[11px] text-[#8c857b]">
                        Click <strong className="text-amber-800">Set as Cover</strong> to change the thumbnail
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {mediaUrls.map((url, idx) => {
                        const isCover = thumbnailUrl === url || (!thumbnailUrl && idx === 0);
                        return (
                          <div
                            key={idx}
                            className={`relative rounded-xl overflow-hidden border p-1 bg-white transition ${
                              isCover ? "border-amber-400 ring-2 ring-amber-400/30" : "border-[#ded9cf]"
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
                                  <Music size={24} className="text-[#0f766e]" />
                                </div>
                              )}

                              {isCover && (
                                <div className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-amber-500 text-white px-2 py-0.5 text-[9px] font-bold shadow-xs">
                                  <Star size={9} className="fill-current" /> Cover
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => removeMedia(idx)}
                                className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-black/60 text-white hover:bg-rose-600 transition cursor-pointer"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>

                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => setAsCover(url)}
                                className="w-full text-center text-[10px] font-bold text-[#0f766e] hover:underline pt-1.5 cursor-pointer"
                              >
                                Set as Cover
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Next Step Button */}
                <div className="pt-4 border-t border-[#ded9cf] flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (mediaUrls.length === 0 && !thumbnailUrl) {
                        setError("Please drop or browse at least one photo or media file.");
                        return;
                      }
                      setError(null);
                      setCurrentStep(2);
                    }}
                    className="button-primary !py-2.5 !px-6 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    Next: Story &amp; Studio Location
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: STORY, TITLE & LOCATION (WHERE YOU ARE POSTING FROM) */}
            {currentStep === 2 && (
              <div className="surface p-6 sm:p-7 rounded-2xl border border-[#ded9cf] space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#151515]">Step 2: Story &amp; Studio Location</h2>
                  <p className="text-xs text-[#6f6a61] mt-0.5">
                    Give your creation a title, narrative, and specify where this work was created.
                  </p>
                </div>

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
                    placeholder="e.g. Whispers of the Valley, Morning Light #03, Architectural Study..."
                    className="w-full rounded-xl border border-[#ded9cf] bg-white px-4 py-2.5 text-sm text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none shadow-2xs font-semibold"
                  />
                </div>

                {/* WHERE ARE YOU POSTING FROM? */}
                <div className="space-y-2 pt-2 border-t border-[#ded9cf]/60">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#4d4942] flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#0f766e]" />
                      Where are you creating / posting from?
                    </label>
                    <span className="text-[11px] text-[#8c857b]">Studio Location</span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Paris, France • Tokyo, Japan • New York, USA • Delhi, India..."
                      className="w-full rounded-xl border border-[#ded9cf] bg-white pl-9 pr-4 py-2.5 text-xs text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none shadow-2xs"
                    />
                    <MapPin size={14} className="absolute left-3 top-3 text-[#8c857b]" />
                  </div>

                  {/* Quick City Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-[#8c857b]">Quick presets:</span>
                    {POPULAR_LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocation(loc)}
                        className={`text-[11px] px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                          location === loc
                            ? "border-[#0f766e] bg-[#0f766e]/10 text-[#0f766e] font-bold"
                            : "border-[#ded9cf] bg-white text-[#6f6a61] hover:bg-[#f6f4ef]"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#8c857b]">
                    Specifying your studio city/country gives global viewers and collectors geographic identity for your work.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#ded9cf]/60">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#4d4942]">
                    Artist Narrative &amp; Statement
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your inspiration, materials used, technique, or the meaning behind this piece..."
                    className="w-full rounded-xl border border-[#ded9cf] bg-white px-4 py-2.5 text-xs text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none shadow-2xs resize-y leading-relaxed"
                  />
                </div>

                <div className="pt-4 border-t border-[#ded9cf] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="button-secondary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    Back to Media
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!title.trim()) {
                        setError("Please enter a title for your creation.");
                        return;
                      }
                      setError(null);
                      setCurrentStep(3);
                    }}
                    className="button-primary !py-2.5 !px-6 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    Next: Provenance &amp; Discovery
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PROVENANCE, DISCOVERY & PUBLISH */}
            {currentStep === 3 && (
              <div className="surface p-6 sm:p-7 rounded-2xl border border-[#ded9cf] space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#151515]">Step 3: Provenance &amp; Final Review</h2>
                  <p className="text-xs text-[#6f6a61] mt-0.5">
                    Transparent creation disclosure, searchable tags, and 1-click publishing.
                  </p>
                </div>

                {/* 3-State Provenance */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#4d4942]">
                    Creation Provenance
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setAiProvenance("human")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        aiProvenance === "human"
                          ? "border-[#0f766e] bg-[#0f766e]/10 ring-2 ring-[#0f766e]/20"
                          : "border-[#ded9cf] bg-white hover:bg-[#fcfbfa]"
                      }`}
                    >
                      <span className="text-lg">🌿</span>
                      <div className="mt-1">
                        <p className="font-bold text-xs text-[#151515]">100% Human-Made</p>
                        <p className="text-[10px] text-[#8c857b]">Made by hand, brush, camera, or mind.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAiProvenance("assisted")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        aiProvenance === "assisted"
                          ? "border-[#0f766e] bg-[#0f766e]/10 ring-2 ring-[#0f766e]/20"
                          : "border-[#ded9cf] bg-white hover:bg-[#fcfbfa]"
                      }`}
                    >
                      <span className="text-lg">✨</span>
                      <div className="mt-1">
                        <p className="font-bold text-xs text-[#151515]">AI-Assisted</p>
                        <p className="text-[10px] text-[#8c857b]">Human idea refined with AI tools.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAiProvenance("generated")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        aiProvenance === "generated"
                          ? "border-[#0f766e] bg-[#0f766e]/10 ring-2 ring-[#0f766e]/20"
                          : "border-[#ded9cf] bg-white hover:bg-[#fcfbfa]"
                      }`}
                    >
                      <span className="text-lg">🤖</span>
                      <div className="mt-1">
                        <p className="font-bold text-xs text-[#151515]">AI-Generated</p>
                        <p className="text-[10px] text-[#8c857b]">Prompt synthesis output.</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2 pt-2 border-t border-[#ded9cf]/60">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#4d4942]">
                      Search Tags &amp; Keywords
                    </label>
                    <span className="text-[10px] text-[#8c857b]">Comma separated</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pb-1">
                    {activeArchetype.suggestedTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#ded9cf]/40 text-[#444] hover:bg-[#0f766e] hover:text-white transition cursor-pointer"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="oilpainting, portrait, exhibition, contemporary (comma-separated)"
                    className="w-full rounded-xl border border-[#ded9cf] bg-white px-4 py-2.5 text-xs text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none shadow-2xs"
                  />
                </div>

                {/* Final Summary Card Mini-Preview */}
                <div className="bg-[#fcfbfa] p-4 rounded-xl border border-[#ded9cf] flex items-center gap-4">
                  <div className="size-16 rounded-lg overflow-hidden bg-black shrink-0 border border-[#ded9cf]">
                    {primaryDisplayAsset ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={primaryDisplayAsset} alt="Cover preview" className="size-full object-cover" />
                    ) : (
                      <div className="size-full grid place-items-center text-[10px] text-white/50">No art</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-xs font-bold text-[#151515] truncate">{title || "Untitled Creation"}</p>
                    <p className="text-[11px] text-[#6f6a61] capitalize">
                      {type.replaceAll("_", " ")} • {aiProvenance === "human" ? "100% Human" : "AI"}
                    </p>
                    {location && (
                      <p className="text-[10px] font-semibold text-amber-800 flex items-center gap-1">
                        <MapPin size={10} /> {location}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewMode("preview")}
                    className="text-xs font-bold text-[#0f766e] hover:underline shrink-0"
                  >
                    Full Preview
                  </button>
                </div>

                {/* Final Action Bar */}
                <div className="pt-4 border-t border-[#ded9cf] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="button-secondary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    Back to Story
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
        )}
      </div>
    </PageShell>
  );
}

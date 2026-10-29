"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  FileUp,
  Loader2,
  Save,
  Settings,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { PageShell, SectionIntro } from "@/components/shell";
import { contentTypes } from "@/lib/platform";
import { RoleBadge } from "@/components/role-badge";

interface SocialLinks {
  website?: string;
  twitter?: string;
  github?: string;
  instagram?: string;
  youtube?: string;
}

interface ProfileSettingsData {
  id: string;
  username: string;
  email: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  verified: boolean;
  role: string;
  categories: string[];
  socialLinks: SocialLinks;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("creator");
  const [verified, setVerified] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [socials, setSocials] = useState<SocialLinks>({
    website: "",
    twitter: "",
    github: "",
    instagram: "",
    youtube: "",
  });

  // Upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState<{ percent: number; loaded: string; total: string } | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerProgress, setBannerProgress] = useState<{ percent: number; loaded: string; total: string } | null>(null);
  const [avatarMode, setAvatarMode] = useState<"upload" | "link">("upload");
  const [bannerMode, setBannerMode] = useState<"upload" | "link">("upload");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await fetch("/api/user/profile", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (!res.ok) {
          if (res.status === 401) {
            setUnauthenticated(true);
            return;
          }
          throw new Error("Failed to load profile.");
        }
        const data: { profile: ProfileSettingsData } = await res.json();
        const p = data.profile;
        setUsername(p.username);
        setEmail(p.email || "");
        setRole(p.role || "creator");
        setVerified(p.verified);
        setDisplayName(p.displayName || "");
        setBio(p.bio || "");
        setAvatarUrl(p.avatarUrl || "");
        setBannerUrl(p.bannerUrl || "");
        setSelectedCategories(p.categories || []);
        setSocials({
          website: p.socialLinks?.website || "",
          twitter: p.socialLinks?.twitter || "",
          github: p.socialLinks?.github || "",
          instagram: p.socialLinks?.instagram || "",
          youtube: p.socialLinks?.youtube || "",
        });
      } catch (err) {
        console.error("Failed to load profile settings:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleFileUpload(file: File, target: "avatar" | "banner") {
    if (target === "avatar") {
      setUploadingAvatar(true);
      setAvatarProgress({ percent: 0, loaded: "0 B", total: formatBytes(file.size) });
    } else {
      setUploadingBanner(true);
      setBannerProgress({ percent: 0, loaded: "0 B", total: formatBytes(file.size) });
    }

    try {
      const data = await uploadFileWithProgress(file, (percent, loadedFormatted, totalFormatted) => {
        if (target === "avatar") {
          setAvatarProgress({ percent, loaded: loadedFormatted, total: totalFormatted });
        } else {
          setBannerProgress({ percent, loaded: loadedFormatted, total: totalFormatted });
        }
      });

      if (target === "avatar") {
        setAvatarUrl(data.url);
      } else {
        setBannerUrl(data.url);
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to upload file.",
      });
    } finally {
      if (target === "avatar") {
        setUploadingAvatar(false);
        setAvatarProgress(null);
      } else {
        setUploadingBanner(false);
        setBannerProgress(null);
      }
    }
  }

  function toggleCategory(cat: string) {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim() || undefined,
          bio: bio.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
          bannerUrl: bannerUrl.trim() || undefined,
          categories: selectedCategories,
          socialLinks: socials,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update profile.");
      }

      setFeedback({ type: "success", text: "Studio profile updated successfully!" });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("woh_auth_change"));
      }
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-4xl py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <SectionIntro
            eyebrow="Creator Settings"
            title="Studio &amp; Identity Control"
            body="Customize how your work, discipline specializations, bio, and social channels appear to viewers."
          />
          {username && (
            <Link
              href={`/${username}`}
              target="_blank"
              className="button-secondary text-xs w-fit shrink-0 mb-8 inline-flex items-center gap-1.5"
            >
              View Public Portfolio
              <ExternalLink size={13} />
            </Link>
          )}
        </div>

        {loading && (
          <div className="surface p-12 text-center max-w-md mx-auto">
            <Loader2 className="mx-auto animate-spin text-[#0f766e]" size={32} />
            <p className="mt-4 text-xs font-semibold text-[#6f6a61]">Loading your studio preferences...</p>
          </div>
        )}

        {!loading && unauthenticated && (
          <div className="surface p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#0f766e]/10 text-[#0f766e]">
              <Settings size={28} />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-[#151515]">Sign In to Manage Settings</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6f6a61]">
              You need to be logged into your creator account to edit studio preferences.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/login?next=/settings" className="button-primary text-xs">
                Sign In
              </Link>
              <Link href="/register?next=/settings" className="button-secondary text-xs">
                Create Account
              </Link>
            </div>
          </div>
        )}

        {!loading && !unauthenticated && (
          <form onSubmit={handleSave} className="space-y-8">
            {feedback && (
              <div
                className={`flex items-start gap-2.5 rounded-md p-4 text-xs ${
                  feedback.type === "success"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* Profile Identity */}
            <div className="surface p-6 sm:p-8 space-y-6">
              <div className="border-b border-[#ded9cf] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#151515]">Identity &amp; Presence</h3>
                  <p className="text-xs text-[#6f6a61] mt-0.5">
                    Your handle is <span className="font-mono font-semibold text-[#151515]">@{username}</span>
                  </p>
                </div>
                <RoleBadge role={role} verified={verified} size="md" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                    Display Name or Studio Title
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Elena Rostova or Monolith Lab"
                    className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2.5 text-sm text-[#151515] focus:border-[#0f766e] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-gray-50 px-3.5 py-2.5 text-sm text-[#8c857b] cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                  Creator Biography &amp; Studio Statement
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your story, artistic disciplines, creative trajectory, and design philosophies..."
                  className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2.5 text-sm text-[#151515] focus:border-[#0f766e] focus:outline-none"
                />
              </div>

              {/* Avatar & Banner Upload Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-[#ded9cf]">
                {/* 1. Avatar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                      Profile Avatar
                    </label>
                    <div className="inline-flex rounded-lg bg-[#ded9cf]/40 p-0.5 text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setAvatarMode("upload")}
                        className={`rounded px-2 py-0.5 cursor-pointer ${
                          avatarMode === "upload" ? "bg-white text-[#151515] shadow-xs" : "text-[#6f6a61]"
                        }`}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvatarMode("link")}
                        className={`rounded px-2 py-0.5 cursor-pointer ${
                          avatarMode === "link" ? "bg-white text-[#151515] shadow-xs" : "text-[#6f6a61]"
                        }`}
                      >
                        Link
                      </button>
                    </div>
                  </div>

                  {avatarMode === "upload" ? (
                    <div>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "avatar");
                        }}
                      />
                      {uploadingAvatar && avatarProgress ? (
                        <div className="w-full border border-[#0f766e] bg-[#0f766e]/5 rounded-md p-2.5 space-y-1.5 animate-in fade-in">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-[#151515]">Uploading Avatar...</span>
                            <span className="font-mono font-bold text-[#0f766e]">{avatarProgress.percent}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-[#ded9cf]/50">
                            <div
                              className="h-full bg-gradient-to-r from-[#0f766e] to-teal-400 transition-all duration-150 rounded-full"
                              style={{ width: `${Math.max(5, avatarProgress.percent)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-[#8c857b]">
                            <span>{avatarProgress.loaded} of {avatarProgress.total}</span>
                            <span>{avatarProgress.percent === 100 ? "Saving..." : "Uploading"}</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={uploadingAvatar}
                          onClick={() => avatarInputRef.current?.click()}
                          className="w-full border border-dashed border-[#ded9cf] hover:border-[#0f766e] bg-[#fbfaf7] rounded-md p-3 text-center cursor-pointer transition text-xs font-semibold text-[#151515] flex items-center justify-center gap-1.5"
                        >
                          <FileUp size={13} /> Choose Avatar Image
                        </button>
                      )}
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="Paste avatar URL..."
                      className="w-full rounded-md border border-[#ded9cf] bg-white px-3 py-1.5 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none"
                    />
                  )}

                  {avatarUrl && (
                    <div className="mt-2 flex items-center justify-between p-2 rounded bg-[#f6f4ef]">
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={avatarUrl}
                          alt="Avatar preview"
                          className="size-9 rounded-full object-cover border border-[#ded9cf]"
                        />
                        <span className="text-[11px] text-[#6f6a61]">Avatar preview</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAvatarUrl("")}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        aria-label="Remove avatar"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Banner */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                      Studio Banner
                    </label>
                    <div className="inline-flex rounded-lg bg-[#ded9cf]/40 p-0.5 text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setBannerMode("upload")}
                        className={`rounded px-2 py-0.5 cursor-pointer ${
                          bannerMode === "upload" ? "bg-white text-[#151515] shadow-xs" : "text-[#6f6a61]"
                        }`}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerMode("link")}
                        className={`rounded px-2 py-0.5 cursor-pointer ${
                          bannerMode === "link" ? "bg-white text-[#151515] shadow-xs" : "text-[#6f6a61]"
                        }`}
                      >
                        Link
                      </button>
                    </div>
                  </div>

                  {bannerMode === "upload" ? (
                    <div>
                      <input
                        ref={bannerInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "banner");
                        }}
                      />
                      {uploadingBanner && bannerProgress ? (
                        <div className="w-full border border-[#0f766e] bg-[#0f766e]/5 rounded-md p-2.5 space-y-1.5 animate-in fade-in">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-[#151515]">Uploading Banner...</span>
                            <span className="font-mono font-bold text-[#0f766e]">{bannerProgress.percent}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-[#ded9cf]/50">
                            <div
                              className="h-full bg-gradient-to-r from-[#0f766e] to-teal-400 transition-all duration-150 rounded-full"
                              style={{ width: `${Math.max(5, bannerProgress.percent)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-[#8c857b]">
                            <span>{bannerProgress.loaded} of {bannerProgress.total}</span>
                            <span>{bannerProgress.percent === 100 ? "Saving..." : "Uploading"}</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={uploadingBanner}
                          onClick={() => bannerInputRef.current?.click()}
                          className="w-full border border-dashed border-[#ded9cf] hover:border-[#0f766e] bg-[#fbfaf7] rounded-md p-3 text-center cursor-pointer transition text-xs font-semibold text-[#151515] flex items-center justify-center gap-1.5"
                        >
                          <FileUp size={13} /> Choose Banner Image
                        </button>
                      )}
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      placeholder="Paste banner URL..."
                      className="w-full rounded-md border border-[#ded9cf] bg-white px-3 py-1.5 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none"
                    />
                  )}

                  {bannerUrl && (
                    <div className="mt-2 relative rounded overflow-hidden border border-[#ded9cf] h-12">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bannerUrl} alt="Banner preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setBannerUrl("")}
                        className="absolute top-1 right-1 rounded-full bg-black/70 hover:bg-black text-white p-1 cursor-pointer transition"
                        aria-label="Remove banner"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Discipline Specializations */}
            <div className="surface p-6 sm:p-8 space-y-4">
              <div className="border-b border-[#ded9cf] pb-3">
                <h3 className="text-lg font-bold text-[#151515]">Discipline Specializations</h3>
                <p className="text-xs text-[#6f6a61] mt-0.5">
                  Select the creative mediums you specialize in to highlight them on your portfolio.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {contentTypes.map((cat) => {
                  const active = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`rounded-full px-3.5 py-1 text-xs font-semibold transition cursor-pointer capitalize ${
                        active
                          ? "bg-[#0f766e] text-white shadow-xs"
                          : "border border-[#ded9cf] bg-white text-[#6f6a61] hover:border-[#a09a90] hover:text-[#151515]"
                      }`}
                    >
                      {cat.replaceAll("_", " ")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Social Links */}
            <div className="surface p-6 sm:p-8 space-y-4">
              <div className="border-b border-[#ded9cf] pb-3">
                <h3 className="text-lg font-bold text-[#151515]">External Links &amp; Profiles</h3>
                <p className="text-xs text-[#6f6a61] mt-0.5">
                  Connect your web presence across networks and repositories.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#4d4942]">Personal Website / Domain</label>
                  <input
                    type="url"
                    value={socials.website || ""}
                    onChange={(e) => setSocials({ ...socials, website: e.target.value })}
                    placeholder="https://yourdomain.com"
                    className="mt-1 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4d4942]">X / Twitter</label>
                  <input
                    type="text"
                    value={socials.twitter || ""}
                    onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                    placeholder="https://x.com/username or @handle"
                    className="mt-1 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4d4942]">GitHub / GitLab</label>
                  <input
                    type="text"
                    value={socials.github || ""}
                    onChange={(e) => setSocials({ ...socials, github: e.target.value })}
                    placeholder="https://github.com/username"
                    className="mt-1 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4d4942]">Instagram</label>
                  <input
                    type="text"
                    value={socials.instagram || ""}
                    onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                    placeholder="https://instagram.com/username"
                    className="mt-1 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4d4942]">YouTube / Vimeo</label>
                  <input
                    type="text"
                    value={socials.youtube || ""}
                    onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                    placeholder="https://youtube.com/@channel"
                    className="mt-1 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href={`/${username}`} className="button-secondary text-xs">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="button-primary text-xs cursor-pointer !px-6 !py-2.5 disabled:opacity-60 font-bold"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving Preferences...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </section>
    </PageShell>
  );
}

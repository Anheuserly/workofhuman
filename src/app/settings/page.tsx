"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  Settings,
  ExternalLink,
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

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await fetch("/api/user/profile");
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
      <section className="mx-auto max-w-4xl py-12">
        <SectionIntro
          eyebrow="Creator Settings"
          title="Studio &amp; Identity Control"
          body="Customize how your work, discipline specializations, bio, and social channels appear to viewers."
        />

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

            {/* Profile Overview Card */}
            <div className="surface p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ded9cf] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#151515]">Profile Details</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-xs text-[#6f6a61]">@{username}</span>
                    <RoleBadge role={role} verified={verified} size="sm" />
                  </div>
                </div>
                <Link
                  href={`/${username}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f766e] hover:underline"
                >
                  View Public Portfolio
                  <ExternalLink size={12} />
                </Link>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or https://..."
                    className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-sm text-[#151515] focus:border-[#0f766e] focus:outline-none"
                  />
                  {avatarUrl && (
                    <div className="mt-3 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarUrl}
                        alt="Avatar preview"
                        className="size-12 rounded-full object-cover border border-[#ded9cf]"
                      />
                      <span className="text-xs text-[#8c857b]">Avatar preview</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                    Cover Banner Image URL
                  </label>
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or https://..."
                    className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-sm text-[#151515] focus:border-[#0f766e] focus:outline-none"
                  />
                  {bannerUrl && (
                    <div className="mt-3 h-12 w-full rounded-md overflow-hidden border border-[#ded9cf]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bannerUrl} alt="Banner preview" className="h-full w-full object-cover" />
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
                      type="button"
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                        active
                          ? "bg-[#0f766e] text-white border border-[#0f766e]"
                          : "bg-white text-[#6f6a61] border border-[#ded9cf] hover:border-[#151515]"
                      }`}
                    >
                      {cat.replaceAll("_", " ")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Social Channels */}
            <div className="surface p-6 sm:p-8 space-y-4">
              <div className="border-b border-[#ded9cf] pb-3">
                <h3 className="text-lg font-bold text-[#151515]">Connected Channels</h3>
                <p className="text-xs text-[#6f6a61] mt-0.5">
                  Link your primary studio websites, social handles, or code repositories.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#4d4942]">Website / Studio Portfolio</label>
                  <input
                    type="url"
                    value={socials.website || ""}
                    onChange={(e) => setSocials({ ...socials, website: e.target.value })}
                    placeholder="https://yourstudio.com"
                    className="mt-1 w-full rounded-md border border-[#ded9cf] bg-white px-3 py-2 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4d4942]">X / Twitter Handle</label>
                  <input
                    type="text"
                    value={socials.twitter || ""}
                    onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                    placeholder="@handle"
                    className="mt-1 w-full rounded-md border border-[#ded9cf] bg-white px-3 py-2 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4d4942]">GitHub / Code Repo</label>
                  <input
                    type="text"
                    value={socials.github || ""}
                    onChange={(e) => setSocials({ ...socials, github: e.target.value })}
                    placeholder="https://github.com/..."
                    className="mt-1 w-full rounded-md border border-[#ded9cf] bg-white px-3 py-2 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4d4942]">Instagram</label>
                  <input
                    type="text"
                    value={socials.instagram || ""}
                    onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                    placeholder="@handle"
                    className="mt-1 w-full rounded-md border border-[#ded9cf] bg-white px-3 py-2 text-xs text-[#151515] focus:border-[#0f766e] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Action */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="button-primary cursor-pointer disabled:opacity-60 !px-8"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Preferences
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

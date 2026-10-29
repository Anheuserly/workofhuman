"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  FolderGit2,
  Heart,
  Loader2,
  Save,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
  ExternalLink,
} from "lucide-react";
import { PageShell, SectionIntro } from "@/components/shell";
import { RoleBadge } from "@/components/role-badge";

interface AdminProfile {
  id: string;
  userId: string;
  username: string;
  email: string | null;
  role: string;
  displayName: string | null;
  avatarUrl: string | null;
  verified: boolean;
  followersCount: number;
  viewsCount: number;
  createdAt: string;
}

interface AdminSettings {
  eyebrow: string;
  heading: string;
  subheading: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  footerText: string;
}

interface AdminProject {
  id: string;
  title: string;
  slug: string;
  type: string;
  creatorId: string;
  creatorName: string | null;
  aiGenerated: boolean;
  aiModel: string | null;
  views: number;
  publishedAt: string;
}

interface AdminData {
  stats: {
    totalUsers: number;
    verifiedUsers: number;
    totalProjects: number;
    totalInteractions: number;
  };
  profiles: AdminProfile[];
  settings: AdminSettings | null;
  projects: AdminProject[];
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "settings" | "projects">("users");

  // User search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<AdminSettings>({
    eyebrow: "",
    heading: "",
    subheading: "",
    primaryCtaLabel: "",
    primaryCtaHref: "",
    secondaryCtaLabel: "",
    secondaryCtaHref: "",
    footerText: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Updating user state
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/admin/overview");
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          const errData = await res.json();
          throw new Error(errData.error || "Administrator privileges required.");
        }
        throw new Error("Failed to load admin panel data.");
      }
      const json: AdminData = await res.json();
      setData(json);
      if (json.settings) {
        setSettingsForm(json.settings);
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Failed to load admin panel.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleVerified(profile: AdminProfile) {
    setUpdatingUserId(profile.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          verified: !profile.verified,
        }),
      });

      if (!res.ok) throw new Error("Failed to toggle verification");

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          profiles: prev.profiles.map((p) =>
            p.id === profile.id ? { ...p, verified: !p.verified } : p
          ),
          stats: {
            ...prev.stats,
            verifiedUsers: profile.verified
              ? prev.stats.verifiedUsers - 1
              : prev.stats.verifiedUsers + 1,
          },
        };
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update verified status.");
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function handleRoleChange(profileId: string, newRole: "creator" | "admin" | "moderator") {
    setUpdatingUserId(profileId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          role: newRole,
        }),
      });

      if (!res.ok) throw new Error("Failed to change role");

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          profiles: prev.profiles.map((p) =>
            p.id === profileId ? { ...p, role: newRole } : p
          ),
        };
      });
    } catch (err) {
      console.error(err);
      alert("Failed to change user role.");
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsFeedback(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update platform settings");
      }

      setSettingsFeedback({ type: "success", text: "Homepage settings successfully published!" });
      setTimeout(() => setSettingsFeedback(null), 4000);
    } catch (err) {
      setSettingsFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update platform settings.",
      });
    } finally {
      setSavingSettings(false);
    }
  }

  // Filtered profiles
  const filteredProfiles = data?.profiles.filter((p) => {
    const matchesSearch =
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.displayName && p.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === "all" || p.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-12">
        <SectionIntro
          eyebrow="Admin Dashboard"
          title="Platform Governance & Control"
          body="Manage verified badges, roles, creator profiles, content moderation, and global homepage copy."
        />

        {loading && (
          <div className="surface flex min-h-[300px] flex-col items-center justify-center p-12 text-center">
            <Loader2 className="animate-spin text-[#0f766e]" size={36} />
            <p className="mt-4 text-sm font-semibold text-[#6f6a61]">Verifying credentials &amp; loading metrics...</p>
          </div>
        )}

        {!loading && authError && (
          <div className="surface p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-amber-100 text-amber-700">
              <ShieldAlert size={28} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-[#151515]">Administrator Privileges Required</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6f6a61]">{authError}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/login?next=/admin" className="button-primary text-xs">
                Sign In as Administrator
              </Link>
              <Link href="/" className="button-secondary text-xs">
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {!loading && data && (
          <div>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
              <div className="surface p-5">
                <div className="flex items-center justify-between text-[#6f6a61]">
                  <span className="text-xs font-semibold uppercase tracking-wider">Creators</span>
                  <Users size={18} className="text-[#0f766e]" />
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight text-[#151515]">
                  {data.stats.totalUsers.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-[#6f6a61]">Registered profiles</p>
              </div>

              <div className="surface p-5">
                <div className="flex items-center justify-between text-[#6f6a61]">
                  <span className="text-xs font-semibold uppercase tracking-wider">Verified</span>
                  <BadgeCheck size={18} className="text-[#0f766e]" />
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight text-[#151515]">
                  {data.stats.verifiedUsers.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-[#6f6a61]">Editorial badges</p>
              </div>

              <div className="surface p-5">
                <div className="flex items-center justify-between text-[#6f6a61]">
                  <span className="text-xs font-semibold uppercase tracking-wider">Projects</span>
                  <FolderGit2 size={18} className="text-amber-600" />
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight text-[#151515]">
                  {data.stats.totalProjects.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-[#6f6a61]">Published works</p>
              </div>

              <div className="surface p-5">
                <div className="flex items-center justify-between text-[#6f6a61]">
                  <span className="text-xs font-semibold uppercase tracking-wider">Engagement</span>
                  <Heart size={18} className="text-rose-500" />
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight text-[#151515]">
                  {data.stats.totalInteractions.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-[#6f6a61]">Likes &amp; bookmarks</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-[#ded9cf] pb-4 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === "users"
                    ? "bg-[#151515] text-white"
                    : "bg-white text-[#6f6a61] hover:text-[#151515] border border-[#ded9cf]"
                }`}
              >
                Creators &amp; Roles ({data.profiles.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-[#151515] text-white"
                    : "bg-white text-[#6f6a61] hover:text-[#151515] border border-[#ded9cf]"
                }`}
              >
                Homepage Settings
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("projects")}
                className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === "projects"
                    ? "bg-[#151515] text-white"
                    : "bg-white text-[#6f6a61] hover:text-[#151515] border border-[#ded9cf]"
                }`}
              >
                Recent Projects ({data.projects.length})
              </button>
            </div>

            {/* Tab 1: Creators Directory & Roles */}
            {activeTab === "users" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search by username, name, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 pl-9 text-xs text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 text-[#a09a90]" size={14} />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6f6a61] font-semibold">Filter:</span>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="rounded-md border border-[#ded9cf] bg-white px-3 py-1.5 text-xs text-[#151515] focus:outline-none"
                    >
                      <option value="all">All Roles</option>
                      <option value="creator">Creators Only</option>
                      <option value="admin">Admins Only</option>
                      <option value="moderator">Moderators Only</option>
                    </select>
                  </div>
                </div>

                <div className="surface overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#ded9cf] bg-[#f6f4ef]/60 text-[#6f6a61] font-semibold uppercase tracking-wider">
                          <th className="py-3 px-4">Creator</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Role &amp; Badge</th>
                          <th className="py-3 px-4">Verified Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ded9cf]">
                        {filteredProfiles && filteredProfiles.length > 0 ? (
                          filteredProfiles.map((p) => (
                            <tr key={p.id} className="hover:bg-[#fcfbf9] transition">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  {p.avatarUrl ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                      src={p.avatarUrl}
                                      alt={p.username}
                                      className="size-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="grid size-8 place-items-center rounded-full bg-[#0f766e] font-bold text-white text-[11px]">
                                      {(p.displayName || p.username).slice(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-bold text-[#151515] flex items-center gap-1.5">
                                      {p.displayName || p.username}
                                      <RoleBadge role={p.role} verified={p.verified} size="sm" />
                                    </div>
                                    <Link
                                      href={`/${p.username}`}
                                      target="_blank"
                                      className="text-[#6f6a61] hover:text-[#0f766e] font-mono flex items-center gap-1 mt-0.5"
                                    >
                                      @{p.username}
                                      <ExternalLink size={10} />
                                    </Link>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-[#6f6a61]">
                                {p.email || <span className="italic text-[#a09a90]">No email</span>}
                              </td>

                              <td className="py-3 px-4">
                                <select
                                  disabled={updatingUserId === p.id}
                                  value={p.role}
                                  onChange={(e) =>
                                    handleRoleChange(
                                      p.id,
                                      e.target.value as "creator" | "admin" | "moderator"
                                    )
                                  }
                                  className="rounded border border-[#ded9cf] bg-white px-2 py-1 text-xs font-semibold focus:outline-none"
                                >
                                  <option value="creator">Creator</option>
                                  <option value="moderator">Moderator</option>
                                  <option value="admin">Administrator</option>
                                </select>
                              </td>

                              <td className="py-3 px-4">
                                <button
                                  type="button"
                                  disabled={updatingUserId === p.id}
                                  onClick={() => handleToggleVerified(p)}
                                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-xs transition cursor-pointer ${
                                    p.verified
                                      ? "bg-[#0f766e]/10 text-[#0f766e] hover:bg-[#0f766e]/20"
                                      : "bg-gray-100 text-[#6f6a61] hover:bg-gray-200"
                                  }`}
                                >
                                  <BadgeCheck size={14} className={p.verified ? "text-[#0f766e]" : "text-gray-400"} />
                                  {p.verified ? "Verified" : "Unverified"}
                                </button>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <Link
                                  href={`/${p.username}`}
                                  target="_blank"
                                  className="text-xs font-semibold text-[#0f766e] hover:underline"
                                >
                                  View Portfolio
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-[#6f6a61]">
                              No creators match the search query.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Homepage Settings Editor */}
            {activeTab === "settings" && (
              <div className="surface p-6 sm:p-8 shadow-xs max-w-3xl">
                <div className="mb-6 border-b border-[#ded9cf] pb-4">
                  <h3 className="text-lg font-bold text-[#151515]">Homepage Editorial Copy</h3>
                  <p className="text-xs text-[#6f6a61] mt-1">
                    Update the high-impact headline, subheadings, and action buttons displayed on the front page.
                  </p>
                </div>

                {settingsFeedback && (
                  <div
                    className={`mb-6 flex items-start gap-2.5 rounded-md p-3.5 text-xs ${
                      settingsFeedback.type === "success"
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border border-red-200 bg-red-50 text-red-800"
                    }`}
                  >
                    {settingsFeedback.type === "success" ? (
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    )}
                    <span>{settingsFeedback.text}</span>
                  </div>
                )}

                <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#4d4942]">
                      Hero Eyebrow
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.eyebrow}
                      onChange={(e) => setSettingsForm({ ...settingsForm, eyebrow: e.target.value })}
                      className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2.5 text-sm text-[#151515] focus:border-[#0f766e] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#4d4942]">
                      Main Headline
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.heading}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heading: e.target.value })}
                      className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2.5 text-sm text-[#151515] focus:border-[#0f766e] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#4d4942]">
                      Hero Subheading Narrative
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={settingsForm.subheading}
                      onChange={(e) => setSettingsForm({ ...settingsForm, subheading: e.target.value })}
                      className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2.5 text-sm text-[#151515] focus:border-[#0f766e] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#4d4942]">
                        Primary CTA Button Label
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsForm.primaryCtaLabel}
                        onChange={(e) => setSettingsForm({ ...settingsForm, primaryCtaLabel: e.target.value })}
                        className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-sm text-[#151515] focus:border-[#0f766e] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#4d4942]">
                        Primary CTA Destination Href
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsForm.primaryCtaHref}
                        onChange={(e) => setSettingsForm({ ...settingsForm, primaryCtaHref: e.target.value })}
                        className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-sm text-[#151515] focus:border-[#0f766e] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#4d4942]">
                        Secondary CTA Button Label
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsForm.secondaryCtaLabel}
                        onChange={(e) => setSettingsForm({ ...settingsForm, secondaryCtaLabel: e.target.value })}
                        className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-sm text-[#151515] focus:border-[#0f766e] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#4d4942]">
                        Secondary CTA Destination Href
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsForm.secondaryCtaHref}
                        onChange={(e) => setSettingsForm({ ...settingsForm, secondaryCtaHref: e.target.value })}
                        className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-sm text-[#151515] focus:border-[#0f766e] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#4d4942]">
                      Global Platform Footer Tagline
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.footerText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerText: e.target.value })}
                      className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2.5 text-sm text-[#151515] focus:border-[#0f766e] focus:outline-none"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="button-primary cursor-pointer disabled:opacity-60"
                    >
                      {savingSettings ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Saving Platform Settings...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Homepage Settings
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 3: Recent Projects */}
            {activeTab === "projects" && (
              <div className="surface overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#ded9cf] bg-[#f6f4ef]/60 text-[#6f6a61] font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Title &amp; Slug</th>
                        <th className="py-3 px-4">Discipline</th>
                        <th className="py-3 px-4">Creator</th>
                        <th className="py-3 px-4">AI Disclosure</th>
                        <th className="py-3 px-4">Views</th>
                        <th className="py-3 px-4">Published</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ded9cf]">
                      {data.projects.map((proj) => (
                        <tr key={proj.id} className="hover:bg-[#fcfbf9] transition">
                          <td className="py-3 px-4 font-bold text-[#151515]">
                            {proj.title}
                            <p className="font-mono text-[10px] text-[#6f6a61] font-normal">{proj.slug}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="rounded-full bg-[#f6f4ef] px-2 py-0.5 border border-[#ded9cf] text-[11px] font-medium">
                              {proj.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#6f6a61]">{proj.creatorName || proj.creatorId}</td>
                          <td className="py-3 px-4">
                            {proj.aiGenerated ? (
                              <span className="inline-flex items-center gap-1 text-[#0f766e] font-semibold text-[11px]">
                                <Sparkles size={12} />
                                AI ({proj.aiModel || "Assisted"})
                              </span>
                            ) : (
                              <span className="text-[#6f6a61] text-[11px]">Human-crafted</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-[#6f6a61]">{proj.views.toLocaleString()}</td>
                          <td className="py-3 px-4 text-[#6f6a61]">
                            {new Date(proj.publishedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </PageShell>
  );
}

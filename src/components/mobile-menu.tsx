"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  ArrowRight,
  UserPlus,
  LogIn,
  Sparkles,
  User,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { platformRoutes } from "@/lib/platform";
import { Logo } from "@/components/logo";
import { RoleBadge } from "@/components/role-badge";

interface MobileUser {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  verified: boolean;
}

export function MobileMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<MobileUser | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    function onAuthChange() {
      fetchUser();
    }
    window.addEventListener("woh_auth_change", onAuthChange);
    return () => window.removeEventListener("woh_auth_change", onAuthChange);
  }, [fetchUser]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setOpen(false);
      window.dispatchEvent(new Event("woh_auth_change"));
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <>
      <button
        className="icon-button lg:hidden cursor-pointer"
        type="button"
        aria-label="Toggle navigation menu"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div className="fixed inset-0 top-[72px] z-50 bg-black/40 backdrop-blur-xs lg:hidden animate-in fade-in">
          <div className="surface mx-4 mt-2 max-h-[calc(100vh-90px)] overflow-y-auto p-6 shadow-2xl animate-in slide-in-from-top-4">
            <div className="flex items-center justify-between border-b border-[#ded9cf] pb-4">
              <Logo size="sm" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[#6f6a61] hover:text-[#151515] p-1 cursor-pointer"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Profile Header or Auth Actions */}
            {user ? (
              <div className="mt-4 border-b border-[#ded9cf] pb-4 space-y-3">
                <div className="flex items-center gap-3">
                  {user.avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="size-10 rounded-full object-cover border border-[#ded9cf]"
                    />
                  ) : (
                    <div className="grid size-10 place-items-center rounded-full bg-[#0f766e] text-white font-bold text-xs">
                      {(user.displayName || user.username).slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-[#151515] truncate">
                        {user.displayName || `@${user.username}`}
                      </p>
                      <RoleBadge role={user.role} verified={user.verified} size="sm" />
                    </div>
                    <p className="text-xs text-[#8c857b] font-mono">@{user.username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/studio/upload"
                    onClick={() => setOpen(false)}
                    className="button-primary !min-h-[2.25rem] !px-3 text-xs justify-center"
                  >
                    <Sparkles size={13} />
                    Upload Work
                  </Link>
                  <Link
                    href={`/${user.username}`}
                    onClick={() => setOpen(false)}
                    className="button-secondary !min-h-[2.25rem] !px-3 text-xs justify-center"
                  >
                    <User size={13} />
                    My Portfolio
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2 border-b border-[#ded9cf] pb-5">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="button-secondary !min-h-[2.5rem] !px-3 text-xs w-full justify-center"
                >
                  <LogIn size={14} />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="button-primary !min-h-[2.5rem] !px-3 text-xs w-full justify-center"
                >
                  <UserPlus size={14} />
                  Join Free
                </Link>
              </div>
            )}

            {/* Platform Navigation */}
            <div className="mt-4 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c857b] px-3 py-1">
                Discover
              </p>
              {platformRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-[#151515] transition hover:bg-[#f6f4ef]"
                >
                  <span>{route.label}</span>
                  <ArrowRight size={14} className="text-[#8c857b]" />
                </Link>
              ))}

              <Link
                href="/categories"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-[#151515] transition hover:bg-[#f6f4ef]"
              >
                <span>All 33 Mediums</span>
                <ArrowRight size={14} className="text-[#8c857b]" />
              </Link>
            </div>

            {/* User Specific Settings / Logout */}
            {user && (
              <div className="mt-4 pt-4 border-t border-[#ded9cf] space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c857b] px-3 py-1">
                  Account
                </p>

                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50/70 hover:bg-amber-100"
                  >
                    <span className="flex items-center gap-2">
                      <Shield size={14} className="text-amber-600" />
                      Admin Control Center
                    </span>
                    <ArrowRight size={13} className="text-amber-700" />
                  </Link>
                )}

                <Link
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-[#151515] hover:bg-[#f6f4ef]"
                >
                  <span className="flex items-center gap-2">
                    <Settings size={14} className="text-[#6f6a61]" />
                    Profile Settings
                  </span>
                  <ArrowRight size={13} className="text-[#8c857b]" />
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer"
                >
                  <LogOut size={14} />
                  Sign Out (@{user.username})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Plus, Settings, Sparkles, User, ChevronDown, Shield } from "lucide-react";
import { RoleBadge } from "@/components/role-badge";

export interface ClientUser {
  userId: string;
  profileId: string;
  username: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  verified: boolean;
}

export function HeaderUserNav() {
  const router = useRouter();
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || null);
        }
      } catch (err) {
        console.error("Failed to check auth status:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setDropdownOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-20 rounded-full bg-[#ebe7df] animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#151515] transition hover:bg-[#ebe7df]"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="button-primary !min-h-[2.25rem] !px-3.5 !py-1 text-xs"
        >
          Join
        </Link>
      </div>
    );
  }

  const initials = (user.displayName || user.username || "U")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative flex items-center gap-2" ref={dropdownRef}>
      <Link
        href="/studio/upload"
        className="button-primary hidden !min-h-[2.25rem] !px-3.5 !py-1 text-xs sm:inline-flex"
      >
        <Plus size={14} />
        Create
      </Link>

      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 rounded-full border border-[#ded9cf] bg-white p-1 pl-1.5 pr-2.5 transition hover:border-[#bdb5a7]"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        {user.avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="size-7 rounded-full object-cover"
          />
        ) : (
          <span className="grid size-7 place-items-center rounded-full bg-[#0f766e] text-xs font-bold text-white">
            {initials}
          </span>
        )}
        <span className="hidden text-xs font-semibold text-[#151515] md:inline">
          @{user.username}
        </span>
        <ChevronDown size={14} className="text-[#6f6a61]" />
      </button>

      {dropdownOpen && (
        <div className="surface absolute right-0 top-12 z-50 w-56 p-1.5 shadow-xl animate-in fade-in zoom-in-95">
          <div className="border-b border-[#ded9cf] px-3 py-2.5">
            <div className="flex items-center justify-between gap-1">
              <p className="text-xs font-bold text-[#151515] truncate">
                {user.displayName || user.username}
              </p>
              <RoleBadge role={user.role} verified={user.verified} size="sm" />
            </div>
            <p className="text-[11px] text-[#6f6a61] font-mono">@{user.username}</p>
          </div>

          <div className="py-1">
            {user.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50/70 hover:bg-amber-100/70 transition"
              >
                <Shield size={15} className="text-amber-600" />
                Admin Dashboard
              </Link>
            )}

            <Link
              href={`/${user.username}`}
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs text-[#151515] transition hover:bg-[#f6f4ef]"
            >
              <User size={15} className="text-[#6f6a61]" />
              Your Portfolio
            </Link>

            <Link
              href="/studio/upload"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs text-[#151515] transition hover:bg-[#f6f4ef]"
            >
              <Sparkles size={15} className="text-[#0f766e]" />
              Upload Creation
            </Link>

            <Link
              href="/settings"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs text-[#151515] transition hover:bg-[#f6f4ef]"
            >
              <Settings size={15} className="text-[#6f6a61]" />
              Settings
            </Link>
          </div>

          <div className="border-t border-[#ded9cf] pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs text-rose-700 transition hover:bg-rose-50"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

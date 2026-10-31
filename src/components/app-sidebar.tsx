"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Flame,
  Video,
  Sparkles,
  Users,
} from "lucide-react";
import { Logo } from "@/components/logo";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const mainNavItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/trending", label: "Trending", icon: Flame },
  { href: "/explore?tag=ai%20video", label: "Cinema & Video", icon: Video },
  { href: "/ai", label: "AI Creations", icon: Sparkles },
  { href: "/communities", label: "Communities", icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/explore") {
      return pathname === "/explore";
    }
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r border-[#ded9cf] bg-white sticky top-0 h-screen select-none">
      <div>
        {/* Brand App Header */}
        <div className="h-16 flex items-center px-5 border-b border-[#ded9cf]/60">
          <Logo size="sm" />
        </div>

        {/* Primary Navigation Links */}
        <div className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8c857b]">
            Discovery
          </div>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition ${
                  active
                    ? "bg-[#151515] text-white shadow-xs font-bold"
                    : "text-[#555047] hover:bg-[#f6f4ef] hover:text-[#151515] font-semibold"
                }`}
              >
                <Icon size={16} className={active ? "text-[#0f766e]" : "text-[#8c857b]"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="p-4 border-t border-[#ded9cf]/60 text-center">
        <p className="text-[10px] text-[#8c857b] font-medium tracking-wide">
          The Work of Human &copy; 2026
        </p>
      </div>
    </aside>
  );
}

export function MobileBottomBar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/explore") {
      return pathname === "/explore";
    }
    return pathname.startsWith(href);
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 backdrop-blur-md border-t border-[#ded9cf] flex items-center justify-around px-2 select-none">
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold transition ${
          isActive("/") ? "text-[#0f766e]" : "text-[#8c857b]"
        }`}
      >
        <Home size={18} />
        <span>Home</span>
      </Link>

      <Link
        href="/explore"
        className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold transition ${
          isActive("/explore") ? "text-[#0f766e]" : "text-[#8c857b]"
        }`}
      >
        <Compass size={18} />
        <span>Explore</span>
      </Link>

      <Link
        href="/trending"
        className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold transition ${
          isActive("/trending") ? "text-[#0f766e]" : "text-[#8c857b]"
        }`}
      >
        <Flame size={18} />
        <span>Trending</span>
      </Link>

      <Link
        href="/explore?tag=ai%20video"
        className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold transition ${
          pathname.includes("ai%20video") || pathname.includes("ai video") ? "text-[#0f766e]" : "text-[#8c857b]"
        }`}
      >
        <Video size={18} />
        <span>Video</span>
      </Link>

      <Link
        href="/ai"
        className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold transition ${
          isActive("/ai") ? "text-[#0f766e]" : "text-[#8c857b]"
        }`}
      >
        <Sparkles size={18} />
        <span>AI</span>
      </Link>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Flame,
  Video,
  Sparkles,
  Users,
  ShoppingBag,
  Plus,
  Bell,
  MessageSquare,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/logo";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tag?: string;
}

const mainNavItems: NavItem[] = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/trending", label: "Trending", icon: Flame },
  { href: "/explore?tag=ai%20video", label: "Cinema & Video", icon: Video },
  { href: "/ai", label: "AI Creations", icon: Sparkles },
  { href: "/communities", label: "Communities", icon: Users },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
];

export function AppSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/explore") {
      return pathname === "/explore" || pathname === "/";
    }
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r border-[#ded9cf] bg-white sticky top-0 h-screen select-none">
      <div>
        {/* Brand App Header */}
        <div className="h-16 flex items-center px-5 border-b border-[#ded9cf]/60">
          <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-85">
            <Logo size="sm" />
            <span className="text-xs font-black tracking-[0.16em] text-[#151515]">
              WORK OF HUMAN
            </span>
          </Link>
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
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  active
                    ? "bg-[#151515] text-white shadow-xs"
                    : "text-[#555047] hover:bg-[#f6f4ef] hover:text-[#151515]"
                }`}
              >
                <Icon size={16} className={active ? "text-[#0f766e]" : "text-[#8c857b]"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Studio Workspace Section */}
        <div className="p-3 pt-1">
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8c857b]">
            Studio Workspace
          </div>
          <Link
            href="/studio/upload"
            className="flex items-center justify-center gap-2 w-full bg-[#0f766e] text-white rounded-xl py-2.5 px-3 text-xs font-bold shadow-xs hover:bg-[#0d655e] transition"
          >
            <Plus size={16} />
            <span>Create New Work</span>
          </Link>
        </div>
      </div>

      {/* Bottom Shortcuts */}
      <div className="p-3 border-t border-[#ded9cf]/60 space-y-1">
        <Link
          href="/notifications"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#555047] hover:bg-[#f6f4ef] hover:text-[#151515] transition"
        >
          <Bell size={16} className="text-[#8c857b]" />
          <span>Notifications</span>
        </Link>
        <Link
          href="/messages"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#555047] hover:bg-[#f6f4ef] hover:text-[#151515] transition"
        >
          <MessageSquare size={16} className="text-[#8c857b]" />
          <span>Messages</span>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#555047] hover:bg-[#f6f4ef] hover:text-[#151515] transition"
        >
          <Settings size={16} className="text-[#8c857b]" />
          <span>Account Settings</span>
        </Link>
      </div>
    </aside>
  );
}

export function MobileBottomBar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/explore") {
      return pathname === "/explore" || pathname === "/";
    }
    return pathname.startsWith(href);
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 backdrop-blur-md border-t border-[#ded9cf] flex items-center justify-around px-2 select-none">
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

      {/* Floating Create Icon */}
      <Link
        href="/studio/upload"
        className="grid size-10 place-items-center rounded-full bg-[#0f766e] text-white shadow-md -mt-5 transition hover:scale-105"
        title="Create in Studio"
      >
        <Plus size={20} />
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

      <Link
        href="/settings"
        className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold transition ${
          isActive("/settings") ? "text-[#0f766e]" : "text-[#8c857b]"
        }`}
      >
        <Settings size={18} />
        <span>Account</span>
      </Link>
    </nav>
  );
}

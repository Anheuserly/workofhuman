"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Flame,
  Video,
  Sparkles,
  Palette,
  Music,
  BookOpen,
  Code,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { useSidebar } from "@/components/shell";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const discoveryItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/trending", label: "Trending", icon: Flame },
];

const disciplineItems: NavItem[] = [
  { href: "/explore?tag=ai%20video", label: "Cinema & Video", icon: Video },
  { href: "/ai", label: "AI Creations", icon: Sparkles },
  { href: "/categories/digital_art", label: "Digital Art", icon: Palette },
  { href: "/categories/music", label: "Music & Audio", icon: Music },
  { href: "/categories/stories", label: "Stories & Writing", icon: BookOpen },
  { href: "/categories/apps", label: "Code & Apps", icon: Code },
];

const communityItems: NavItem[] = [
  { href: "/communities", label: "Communities", icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useSidebar();

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/explore") {
      return pathname === "/explore";
    }
    return pathname.startsWith(href);
  }

  function renderNavSection(items: NavItem[], title?: string) {
    return (
      <div className="space-y-0.5">
        {!collapsed && title && (
          <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#8c857b]">
            {title}
          </div>
        )}
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center rounded-xl text-xs transition ${
                collapsed
                  ? "justify-center size-10 mx-auto"
                  : "gap-3 px-3 py-2"
              } ${
                active
                  ? "bg-[#151515] text-white shadow-xs font-bold"
                  : "text-[#555047] hover:bg-[#f6f4ef] hover:text-[#151515] font-semibold"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                size={17}
                className={active ? "text-[#0f766e]" : "text-[#8c857b] group-hover:text-[#151515]"}
              />
              {!collapsed ? (
                <span>{item.label}</span>
              ) : (
                /* Floating Tooltip */
                <span className="pointer-events-none absolute left-full ml-3 hidden group-hover:block z-50 rounded-lg bg-[#151515] px-2.5 py-1 text-xs font-semibold text-white shadow-lg whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <aside
      className={`hidden lg:flex shrink-0 flex-col justify-between border-r border-[#ded9cf] bg-white sticky top-0 h-screen select-none transition-all duration-200 z-20 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
        {/* Brand App Header */}
        <div
          className={`h-16 flex items-center border-b border-[#ded9cf]/60 sticky top-0 bg-white z-10 ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          <Logo size="sm" showWordmark={!collapsed} />

          {!collapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="grid size-8 place-items-center rounded-lg text-[#8c857b] hover:bg-[#f6f4ef] hover:text-[#151515] transition"
              title="Minimize sidebar"
              aria-label="Minimize sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* Primary Navigation Links */}
        <div className={`space-y-3 ${collapsed ? "p-2" : "p-3"}`}>
          {renderNavSection(discoveryItems, "Discovery")}
          {renderNavSection(disciplineItems, "Disciplines")}
          {renderNavSection(communityItems, "Community")}
        </div>
      </div>

      {/* Footer / Expand Rail button */}
      <div className={`border-t border-[#ded9cf]/60 ${collapsed ? "p-2 text-center" : "p-3 text-center"}`}>
        {collapsed ? (
          <button
            type="button"
            onClick={toggleSidebar}
            className="grid size-9 mx-auto place-items-center rounded-lg text-[#8c857b] hover:bg-[#f6f4ef] hover:text-[#151515] transition"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen size={16} />
          </button>
        ) : (
          <p className="text-[10px] text-[#8c857b] font-medium tracking-wide">
            The Work of Human &copy; 2026
          </p>
        )}
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

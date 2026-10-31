"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Flame,
  Video,
  Sparkles,
  Palette,
  BookOpen,
  Building2,
  Music,
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

interface CreatorItem {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  short_id: string | null;
  followers_count?: number;
  verified?: boolean;
}

const discoveryItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/trending", label: "Trending", icon: Flame },
];

const disciplineItems: NavItem[] = [
  { href: "/explore?tag=ai%20video", label: "Cinema & Video", icon: Video },
  { href: "/categories/paintings", label: "Paintings & Fine Art", icon: Palette },
  { href: "/categories/books", label: "Books & Literature", icon: BookOpen },
  { href: "/categories/architecture", label: "Architecture & Design", icon: Building2 },
  { href: "/categories/digital_art", label: "Digital Art", icon: Sparkles },
  { href: "/categories/music", label: "Music & Audio", icon: Music },
  { href: "/ai", label: "AI Creations", icon: Sparkles },
  { href: "/categories/apps", label: "Code & Apps", icon: Code },
];

const communityItems: NavItem[] = [
  { href: "/communities", label: "Communities", icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useSidebar();
  const [creators, setCreators] = useState<CreatorItem[]>([]);

  useEffect(() => {
    fetch("/api/creators")
      .then((res) => (res.ok ? res.json() : { creators: [] }))
      .then((data) => {
        if (Array.isArray(data.creators)) {
          setCreators(data.creators);
        }
      })
      .catch(() => {});
  }, []);

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
                <span className="truncate">{item.label}</span>
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
              className="grid size-8 place-items-center rounded-lg text-[#8c857b] hover:bg-[#f6f4ef] hover:text-[#151515] transition cursor-pointer"
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

          {/* Top Creators Section */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="px-3 pt-3 pb-1 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c857b]">
                  Top Creators
                </span>
                <Link
                  href="/explore"
                  className="text-[10px] font-semibold text-[#0f766e] hover:underline"
                >
                  View all
                </Link>
              </div>
            )}
            {creators.map((c) => {
              const handle = c.username || c.short_id || "creator";
              const displayName = c.display_name || c.username;
              const initials = displayName.slice(0, 2).toUpperCase();
              const creatorUrl = `/@${c.short_id || c.username}`;
              const active = pathname.startsWith(creatorUrl);

              return (
                <Link
                  key={c.user_id}
                  href={creatorUrl}
                  className={`group relative flex items-center rounded-xl text-xs transition ${
                    collapsed
                      ? "justify-center size-10 mx-auto"
                      : "gap-2.5 px-3 py-1.5"
                  } ${
                    active
                      ? "bg-[#151515] text-white font-bold"
                      : "text-[#555047] hover:bg-[#f6f4ef] hover:text-[#151515] font-semibold"
                  }`}
                  title={collapsed ? `${displayName} (@${handle})` : undefined}
                >
                  {c.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.avatar_url}
                      alt={displayName}
                      className="size-6 rounded-full object-cover shrink-0 border border-[#ded9cf]"
                    />
                  ) : (
                    <div className="grid size-6 place-items-center rounded-full bg-[#0f766e] text-white text-[10px] font-bold uppercase shrink-0">
                      {initials}
                    </div>
                  )}

                  {!collapsed ? (
                    <div className="min-w-0 flex-1 truncate">
                      <p className="truncate text-xs font-semibold">{displayName}</p>
                      <p className="truncate text-[10px] text-[#8c857b] font-mono">@{handle}</p>
                    </div>
                  ) : (
                    <span className="pointer-events-none absolute left-full ml-3 hidden group-hover:block z-50 rounded-lg bg-[#151515] px-2.5 py-1 text-xs font-semibold text-white shadow-lg whitespace-nowrap">
                      {displayName} (@{handle})
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {renderNavSection(communityItems, "Community")}
        </div>
      </div>

      {/* Footer / Expand Rail button */}
      <div className={`border-t border-[#ded9cf]/60 ${collapsed ? "p-2 text-center" : "p-3 text-center"}`}>
        {collapsed ? (
          <button
            type="button"
            onClick={toggleSidebar}
            className="grid size-9 mx-auto place-items-center rounded-lg text-[#8c857b] hover:bg-[#f6f4ef] hover:text-[#151515] transition cursor-pointer"
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
    if (href === "/") return pathname === "/";
    if (href === "/explore") return pathname === "/explore";
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

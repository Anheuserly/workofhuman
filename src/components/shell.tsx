"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ArrowRight, Bell, Search, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { HeaderUserNav } from "@/components/user-nav";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";
import { AppSidebar, MobileBottomBar } from "@/components/app-sidebar";

interface SidebarContextType {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggleSidebar: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function AppTopBar() {
  const { collapsed, toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-[#ded9cf] bg-white/95 px-4 sm:px-6 backdrop-blur-md flex items-center justify-between gap-3 sm:gap-4">
      {/* Left: Mobile Logo & Desktop Sidebar Toggle (Only when sidebar is collapsed) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center lg:hidden">
          <Logo size="sm" />
        </div>

        {collapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden lg:grid size-8 place-items-center rounded-lg text-[#6f6a61] hover:bg-[#f6f4ef] hover:text-[#151515] transition cursor-pointer"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}
      </div>

      {/* Global App Search Input */}
      <div className="flex-1 max-w-md hidden sm:block">
        <form action="/explore" method="GET" className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c857b]" />
          <input
            type="text"
            name="q"
            placeholder="Search creations, films, art, creators..."
            className="w-full rounded-full border border-[#ded9cf] bg-[#f6f4ef] py-1.5 pl-9 pr-4 text-xs text-[#151515] placeholder:text-[#8c857b] focus:border-[#0f766e] focus:bg-white focus:outline-none transition shadow-2xs"
          />
        </form>
      </div>

      {/* Right Controls: Notifications & User Nav */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          className="icon-button sm:hidden"
          href="/explore"
          aria-label="Search"
        >
          <Search size={16} />
        </Link>

        <Link
          className="icon-button"
          href="/notifications"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </Link>

        <HeaderUserNav />

        <div className="ml-1 sm:ml-1.5 md:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

// Backwards-compatible export
export function SiteHeader() {
  return <AppTopBar />;
}

export function PageShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("woh_sidebar_minimized");
      if (saved === "true") setCollapsed(true);
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("woh_sidebar_minimized", next ? "true" : "false");
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar }}>
      <div className="min-h-screen bg-[#faf8f5] text-[#151515] flex antialiased">
        {/* Desktop App Sidebar Rail */}
        <AppSidebar />

        {/* Main Application Area */}
        <div className="flex-1 min-w-0 flex flex-col">
          <AppTopBar />
          <main className="flex-1 min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-7xl w-full mx-auto pb-20 lg:pb-12">
            {children}
          </main>
        </div>

        {/* Mobile Bottom App Navigation */}
        <MobileBottomBar />
      </div>
    </SidebarContext.Provider>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  body,
  href,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  href?: string;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="max-w-3xl">
        <p className="section-eyebrow text-[#0f766e]">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
        {body ? <p className="mt-4 max-w-2xl text-base leading-7 text-[#6f6a61] sm:text-lg">{body}</p> : null}
      </div>
      {href ? (
        <Link className="button-secondary w-fit px-4 text-xs font-semibold" href={href}>
          View all
          <ArrowRight size={15} />
        </Link>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  href = "/studio/upload",
  actionLabel = "Publish a Creation",
}: {
  title: string;
  body: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <section className="mx-auto mt-12 max-w-xl surface p-8 sm:p-12 text-center rounded-2xl border border-[#ded9cf]">
      <h3 className="text-2xl font-bold tracking-tight text-[#151515]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#6f6a61]">{body}</p>
      {href && actionLabel && (
        <div className="mt-6">
          <Link href={href} className="button-primary text-xs font-semibold">
            {actionLabel}
            <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </section>
  );
}

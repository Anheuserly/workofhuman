"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, UploadCloud, UserPlus, LogIn, Sparkles } from "lucide-react";
import { platformRoutes } from "@/lib/platform";
import { Logo } from "@/components/logo";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

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
                className="text-[#6f6a61] hover:text-[#151515] p-1"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Auth Actions */}
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

            {/* Creator Studio & Publishing */}
            <div className="mt-4 border-t border-[#ded9cf] pt-4 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c857b] px-3 py-1">
                Creator Tools
              </p>
              <Link
                href="/studio/upload"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#0f766e] bg-[#0f766e]/5 hover:bg-[#0f766e]/10 transition"
              >
                <UploadCloud size={16} />
                <span>Upload Project</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[#151515] hover:bg-[#f6f4ef] transition"
              >
                <Sparkles size={16} className="text-[#6f6a61]" />
                <span>Studio Settings</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

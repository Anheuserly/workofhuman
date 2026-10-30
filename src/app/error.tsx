"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { PageShell } from "@/components/shell";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global error boundary]:", error);
  }, [error]);

  return (
    <PageShell>
      <section className="mx-auto max-w-lg py-20 text-center">
        <div className="surface p-8 sm:p-12 space-y-4 rounded-2xl border border-[#ded9cf] shadow-sm">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-amber-50 text-amber-600 border border-amber-200">
            <AlertCircle size={22} />
          </div>

          <h1 className="text-xl font-bold text-[#151515]">Something went wrong</h1>
          <p className="text-xs text-[#6f6a61] leading-relaxed">
            An unexpected error occurred while loading this view. You can reload the page or return to the home showcase.
          </p>

          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="button-primary text-xs font-semibold !px-4 !py-2 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} />
              Reload View
            </button>
            <Link
              href="/"
              className="button-secondary text-xs font-semibold !px-4 !py-2 inline-flex items-center gap-1.5"
            >
              <Home size={13} />
              Return Home
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

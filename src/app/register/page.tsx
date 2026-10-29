"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PageShell } from "@/components/shell";
import { AuthCard } from "@/components/auth-card";

export default function RegisterPage() {
  return (
    <PageShell>
      <section className="mx-auto flex min-h-[calc(100vh-140px)] items-center justify-center py-8">
        <Suspense
          fallback={
            <div className="surface p-12 text-center max-w-md mx-auto">
              <Loader2 className="mx-auto animate-spin text-[#0f766e]" size={32} />
              <p className="mt-4 text-xs font-semibold text-[#6f6a61]">Loading registration studio...</p>
            </div>
          }
        >
          <AuthCard initialMode="register" />
        </Suspense>
      </section>
    </PageShell>
  );
}

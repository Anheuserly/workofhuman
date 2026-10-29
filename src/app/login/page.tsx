"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { PageShell } from "@/components/shell";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/studio/upload";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!identifier || !password) {
      setError("Please enter your email/username and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(nextUrl);
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="surface p-8 sm:p-10 shadow-sm">
      <div className="text-center">
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-[#151515] text-base font-black text-white">
          W
        </span>
        <p className="section-eyebrow mt-4 text-[#0f766e]">Welcome Back</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#151515] sm:text-3xl">
          Sign in to Work of Human
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#6f6a61]">
          Access your studio, publish creations, and manage your portfolio.
        </p>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-md border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-800">
          <AlertCircle className="mt-0.5 shrink-0" size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-6 flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800">
          <CheckCircle2 className="mt-0.5 shrink-0" size={16} />
          <span>Signed in successfully! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
            Email or Username <span className="text-rose-500">*</span>
          </label>
          <div className="relative mt-1.5">
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="creator@theworkofhuman.com or handle"
              className="w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2.5 pl-10 text-sm text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none focus:ring-1 focus:ring-[#0f766e]"
            />
            <User className="absolute left-3 top-3 text-[#a09a90]" size={16} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
              Password <span className="text-rose-500">*</span>
            </label>
          </div>
          <div className="relative mt-1.5">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2.5 pl-10 pr-10 text-sm text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none focus:ring-1 focus:ring-[#0f766e]"
            />
            <Lock className="absolute left-3 top-3 text-[#a09a90]" size={16} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-[#a09a90] hover:text-[#151515]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="button-primary mt-6 w-full cursor-pointer justify-center disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={17} />
              Authenticating...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 border-t border-[#ded9cf] pt-6 text-center text-xs text-[#6f6a61]">
        New to The Work of Human?{" "}
        <Link
          href={nextUrl !== "/studio/upload" ? `/register?next=${encodeURIComponent(nextUrl)}` : "/register"}
          className="font-semibold text-[#0f766e] hover:underline"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <PageShell>
      <section className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md flex-col justify-center py-12">
        <Suspense
          fallback={
            <div className="surface p-8 sm:p-10 shadow-sm text-center">
              <Loader2 className="mx-auto animate-spin text-[#0f766e]" size={28} />
              <p className="mt-4 text-xs text-[#6f6a61]">Loading login studio...</p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </section>
    </PageShell>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Film,
  Lightbulb,
  Loader2,
  Lock,
  Mail,
  Music,
  Palette,
  Sparkles,
  Terminal,
  User,
} from "lucide-react";
import { Logo } from "@/components/logo";

interface AuthCardProps {
  initialMode?: "login" | "register";
}

export function AuthCard({ initialMode = "register" }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTarget = searchParams.get("next") || searchParams.get("redirect") || "/explore";
  let nextUrl = "/explore";
  if (rawTarget && typeof rawTarget === "string" && !rawTarget.includes("undefined")) {
    if (rawTarget.startsWith("/") && !rawTarget.startsWith("//")) {
      nextUrl = rawTarget;
    }
  }

  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Common fields
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Login specific
  const [loginIdentifier, setLoginIdentifier] = useState("");

  // Register specific
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [usernameEditedByUser, setUsernameEditedByUser] = useState(false);

  // Auto-generate clean handle from email or display name if user hasn't typed one
  useEffect(() => {
    if (!usernameEditedByUser && mode === "register") {
      let candidate = "";
      if (displayName.trim()) {
        candidate = displayName
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "")
          .slice(0, 24);
      } else if (email.trim() && email.includes("@")) {
        candidate = email
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "")
          .slice(0, 24);
      }
      if (candidate.length >= 3) {
        setUsername(candidate);
      }
    }
  }, [email, displayName, usernameEditedByUser, mode]);

  const cleanHandle = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

  // Password strength calculation
  const isLengthOk = password.length >= 8;
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumbersOrSpecial = /[0-9!@#$%^&*]/.test(password);
  let passwordStrength = 0;
  if (isLengthOk) passwordStrength++;
  if (hasMixedCase) passwordStrength++;
  if (hasNumbersOrSpecial) passwordStrength++;

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!loginIdentifier || !password) {
      setError("Please enter your email/username and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid email/username or password.");
      }

      setSuccess("Signed in successfully! Redirecting...");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("woh_auth_change"));
      }
      setTimeout(() => {
        router.push(nextUrl);
        router.refresh();
      }, 500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !username.trim() || !password) {
      setError("Please fill in email, username, and password.");
      return;
    }

    if (cleanHandle.length < 3) {
      setError("Username handle must be at least 3 characters.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          username: cleanHandle,
          displayName: displayName.trim() || undefined,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      setSuccess("Creator account registered! Redirecting to studio...");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("woh_auth_change"));
      }
      setTimeout(() => {
        router.push(nextUrl);
        router.refresh();
      }, 500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to register.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl py-8">
      <div className="surface overflow-hidden shadow-sm grid lg:grid-cols-[1fr_1.1fr]">
        {/* Left Side: Brand Showcase Panel (Editorial Manifesto) */}
        <div className="bg-[#151515] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <Logo size="md" showWordmark={true} className="[&_span:last-child]:text-white" />

            <div className="mt-12 space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#0f766e]">
                <Sparkles size={14} /> The World&apos;s Creative Output
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                A refined home for serious creative work.
              </h2>

              <p className="text-sm leading-relaxed text-white/70 max-w-md">
                Publish portfolios, cinema, music, writing, software, and physical crafts — with complete transparency for AI-assisted experimentation.
              </p>
            </div>

            {/* Medium badges */}
            <div className="mt-8 flex flex-wrap gap-2 text-xs text-white/80">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1">
                <Palette size={12} className="text-[#0f766e]" /> Fine Art &amp; Design
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1">
                <Film size={12} className="text-amber-400" /> Cinema &amp; Shorts
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1">
                <Music size={12} className="text-rose-400" /> Sound &amp; Music
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1">
                <Terminal size={12} className="text-cyan-400" /> Code &amp; Apps
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1">
                <Lightbulb size={12} className="text-emerald-400" /> Inventions
              </span>
            </div>
          </div>

          <div className="relative z-10 pt-10 border-t border-white/10 text-xs text-white/50 flex items-center justify-between">
            <span>theworkofhuman.com</span>
            <span>33 Disciplines</span>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute -bottom-20 -right-20 size-80 rounded-full bg-[#0f766e]/20 blur-3xl pointer-events-none" />
        </div>

        {/* Right Side: Smart Interactive Auth Card */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
          {/* Segmented Switcher Tabs */}
          <div className="flex rounded-full bg-[#f6f4ef] p-1 border border-[#ded9cf] mb-8">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 rounded-full py-2 text-xs font-bold transition cursor-pointer ${
                mode === "login"
                  ? "bg-[#151515] text-white shadow-xs"
                  : "text-[#6f6a61] hover:text-[#151515]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 rounded-full py-2 text-xs font-bold transition cursor-pointer ${
                mode === "register"
                  ? "bg-[#151515] text-white shadow-xs"
                  : "text-[#6f6a61] hover:text-[#151515]"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 animate-in fade-in">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* MODE 1: LOGIN FORM */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                  Email or Username Handle
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="creator@theworkofhuman.com or handle"
                    className="w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2.5 pl-10 text-sm text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none"
                  />
                  <User className="absolute left-3 top-3 text-[#a09a90]" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2.5 pl-10 pr-10 text-sm text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none"
                  />
                  <Lock className="absolute left-3 top-3 text-[#a09a90]" size={16} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#a09a90] hover:text-[#151515] cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || Boolean(success)}
                className="button-primary mt-6 w-full cursor-pointer justify-center disabled:opacity-60 !py-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={17} />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to Studio
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: REGISTER FORM */}
          {mode === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@theworkofhuman.com"
                    className="w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2.5 pl-10 text-sm text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none"
                  />
                  <Mail className="absolute left-3 top-3 text-[#a09a90]" size={16} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                    Username Handle <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => {
                        setUsernameEditedByUser(true);
                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                      }}
                      placeholder="handle"
                      className="w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 pl-9 text-sm text-[#151515] font-mono placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none"
                    />
                    <User className="absolute left-3 top-2.5 text-[#a09a90]" size={15} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                    Display Name <span className="text-xs font-normal lowercase text-[#8c857b]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Sofia Elena"
                    className="mt-1.5 w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2 text-sm text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Portfolio URL preview */}
              <div className="rounded-md bg-[#f6f4ef] px-3.5 py-2 border border-[#ded9cf] text-xs flex items-center justify-between">
                <span className="text-[#6f6a61]">Portfolio URL:</span>
                <span className="font-mono font-bold text-[#0f766e] truncate max-w-[240px]">
                  theworkofhuman.com/@{cleanHandle || "handle"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d4942]">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-md border border-[#ded9cf] bg-white px-3.5 py-2.5 pl-10 pr-10 text-sm text-[#151515] placeholder:text-[#a09a90] focus:border-[#0f766e] focus:outline-none"
                  />
                  <Lock className="absolute left-3 top-3 text-[#a09a90]" size={16} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#a09a90] hover:text-[#151515] cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password strength bar */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden flex gap-1">
                      <div
                        className={`h-full flex-1 rounded-full ${
                          passwordStrength >= 1 ? "bg-amber-500" : "bg-transparent"
                        }`}
                      />
                      <div
                        className={`h-full flex-1 rounded-full ${
                          passwordStrength >= 2 ? "bg-emerald-500" : "bg-transparent"
                        }`}
                      />
                      <div
                        className={`h-full flex-1 rounded-full ${
                          passwordStrength >= 3 ? "bg-[#0f766e]" : "bg-transparent"
                        }`}
                      />
                    </div>
                    <p className="text-[10px] text-[#8c857b]">
                      {passwordStrength < 2 ? "Weak password" : passwordStrength === 2 ? "Good password" : "Strong password"}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || Boolean(success)}
                className="button-primary mt-6 w-full cursor-pointer justify-center disabled:opacity-60 !py-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={17} />
                    Creating Creator Account...
                  </>
                ) : (
                  <>
                    Create Creator Account
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 border-t border-[#ded9cf] pt-6 text-center text-xs text-[#6f6a61]">
            By continuing, you join an independent creative directory honoring authentic human craftsmanship and transparent AI provenance.
          </div>
        </div>
      </div>
    </div>
  );
}

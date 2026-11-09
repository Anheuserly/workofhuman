"use client";

import { useState } from "react";
import {
  Heart,
  Briefcase,
  Send,
  X,
  Check,
  Copy,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface CreatorSupportProps {
  creatorId: string;
  creatorUsername: string;
  creatorName?: string;
  creatorAvatar?: string | null;
  socialLinks?: Record<string, string> | null;
}

export function CreatorSupportModal({
  creatorId,
  creatorUsername,
  creatorName,
  creatorAvatar,
  socialLinks,
}: CreatorSupportProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"tip" | "commission">("tip");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Commission Form State
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectType, setProjectType] = useState("Fine Art & Illustration");
  const [budgetRange, setBudgetRange] = useState("$250 – $500");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = creatorName || `@${creatorUsername}`;

  // Tip links or defaults
  const tipOptions = [
    {
      label: "Buy Me a Coffee",
      url: socialLinks?.buymeacoffee || `https://buymeacoffee.com/${creatorUsername}`,
      icon: "☕",
      color: "bg-amber-500/10 text-amber-700 border-amber-200",
    },
    {
      label: "Ko-fi",
      url: socialLinks?.kofi || `https://ko-fi.com/${creatorUsername}`,
      icon: "❤️",
      color: "bg-rose-500/10 text-rose-700 border-rose-200",
    },
    {
      label: "PayPal",
      url: socialLinks?.paypal || `https://paypal.me/${creatorUsername}`,
      icon: "💳",
      color: "bg-sky-500/10 text-sky-700 border-sky-200",
    },
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCommissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);

    try {
      const inquiryMessage = `[COMMISSION INQUIRY]\nFrom: ${clientName} (${clientEmail})\nProject: ${projectType}\nBudget: ${budgetRange}\n\nProject Scope:\n${details}`;

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: creatorId,
          content: inquiryMessage,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to deliver inquiry message");
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setOpen(false);
        setDetails("");
      }, 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send inquiry";
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setTab("tip");
            setOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition cursor-pointer"
        >
          <Heart size={13} className="fill-rose-500 text-rose-500" />
          <span>Tip Creator</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("commission");
            setOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-[#f6f4ef] text-[#151515] border border-[#ded9cf] px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition cursor-pointer"
        >
          <Briefcase size={13} className="text-[#0f766e]" />
          <span>Commission Work</span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in select-none">
          <div
            className="surface relative w-full max-w-lg rounded-2xl border border-[#ded9cf] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#ded9cf] px-5 py-4 bg-[#faf8f5]">
              <div className="flex items-center gap-3">
                {creatorAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={creatorAvatar}
                    alt={displayName}
                    className="size-9 rounded-full object-cover border border-[#ded9cf]"
                  />
                ) : (
                  <div className="grid size-9 place-items-center rounded-full bg-[#0f766e] text-white text-xs font-bold uppercase">
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-[#151515]">{displayName}</h3>
                  <p className="text-[11px] text-[#6f6a61]">Direct Patronage &amp; Commissions</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-8 place-items-center rounded-full hover:bg-[#ded9cf]/50 text-[#6f6a61] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="grid grid-cols-2 border-b border-[#ded9cf] bg-white text-xs font-bold">
              <button
                type="button"
                onClick={() => setTab("tip")}
                className={`py-3 flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
                  tab === "tip"
                    ? "border-[#0f766e] text-[#0f766e] bg-[#0f766e]/5"
                    : "border-transparent text-[#6f6a61] hover:text-[#151515]"
                }`}
              >
                <Heart size={14} className={tab === "tip" ? "fill-current" : ""} />
                Tip &amp; Micro-Patronage
              </button>
              <button
                type="button"
                onClick={() => setTab("commission")}
                className={`py-3 flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
                  tab === "commission"
                    ? "border-[#0f766e] text-[#0f766e] bg-[#0f766e]/5"
                    : "border-transparent text-[#6f6a61] hover:text-[#151515]"
                }`}
              >
                <Briefcase size={14} />
                Commission Inquiry
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {tab === "tip" ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-[#f6f4ef] border border-[#ded9cf] p-4 text-xs text-[#555047] leading-relaxed">
                    <p className="font-semibold text-[#151515] mb-1">
                      100% Direct to the Creator
                    </p>
                    <p>
                      The Work of Human takes 0% fee on creator tips. Choose your preferred service
                      below to send support directly to {displayName}.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {tipOptions.map((opt) => (
                      <a
                        key={opt.label}
                        href={opt.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition hover:scale-[1.01] ${opt.color}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{opt.icon}</span>
                          <span className="font-bold text-xs">{opt.label}</span>
                        </div>
                        <ExternalLink size={14} className="opacity-70" />
                      </a>
                    ))}
                  </div>

                  {socialLinks?.upi && (
                    <div className="p-3.5 rounded-xl border border-[#ded9cf] bg-white flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8c857b]">
                          UPI ID (Instant Transfer)
                        </p>
                        <p className="font-mono text-xs font-bold text-[#151515]">
                          {socialLinks.upi}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(socialLinks.upi, "upi")}
                        className="button-secondary !py-1 !px-2.5 text-[11px]"
                      >
                        {copiedKey === "upi" ? <Check size={12} /> : <Copy size={12} />}
                        {copiedKey === "upi" ? "Copied" : "Copy"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleCommissionSubmit} className="space-y-4">
                  {submitted ? (
                    <div className="py-8 text-center space-y-2">
                      <div className="grid size-12 mx-auto place-items-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check size={24} />
                      </div>
                      <h4 className="font-bold text-base text-[#151515]">Inquiry Sent!</h4>
                      <p className="text-xs text-[#6f6a61]">
                        Your commission proposal has been delivered to {displayName}&apos;s inbox.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-[#6f6a61] block mb-1">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="e.g. Jane Doe"
                            className="input-field text-xs w-full"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-[#6f6a61] block mb-1">
                            Contact Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            placeholder="jane@example.com"
                            className="input-field text-xs w-full"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-[#6f6a61] block mb-1">
                            Medium / Discipline
                          </label>
                          <select
                            value={projectType}
                            onChange={(e) => setProjectType(e.target.value)}
                            className="input-field text-xs w-full"
                          >
                            <option>Fine Art &amp; Illustration</option>
                            <option>Cinema &amp; Animation</option>
                            <option>Original Music &amp; Audio</option>
                            <option>Architecture &amp; 3D</option>
                            <option>Branding &amp; UI Design</option>
                            <option>Writing &amp; Literature</option>
                            <option>Custom Code &amp; AI</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-[#6f6a61] block mb-1">
                            Budget Range
                          </label>
                          <select
                            value={budgetRange}
                            onChange={(e) => setBudgetRange(e.target.value)}
                            className="input-field text-xs w-full"
                          >
                            <option>&lt; $250</option>
                            <option>$250 – $500</option>
                            <option>$500 – $1,500</option>
                            <option>$1,500 – $5,000</option>
                            <option>$5,000+</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-[#6f6a61] block mb-1">
                          Brief Scope &amp; Vision *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                          placeholder="Describe the desired creation, timeline, style references, or specific deliverables..."
                          className="input-field text-xs w-full resize-none"
                        />
                      </div>

                      {error && (
                        <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={sending}
                        className="button-primary w-full justify-center !py-2.5 text-xs font-bold cursor-pointer"
                      >
                        {sending ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Send size={15} />
                        )}
                        Send Commission Brief
                      </button>
                    </>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Share2,
  Copy,
  Check,
  Trash2,
  Edit3,
  MoreVertical,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";

export function CreationActionsMenu({
  projectSlug,
  projectTitle,
  creatorUsername,
  creatorShortId,
  isOwner = false,
  onDeleted,
}: {
  projectId?: string;
  projectSlug: string;
  projectTitle: string;
  creatorUsername: string;
  creatorShortId?: string;
  isOwner?: boolean;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedShort, setCopiedShort] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "https://theworkofhuman.com";
  const creatorRef = creatorShortId || creatorUsername;
  const canonicalUrl = `${siteOrigin}/@${creatorRef}/${projectSlug}`;
  const shortUrl = `${siteOrigin}/v/${projectSlug}`;

  async function handleCopy(url: string, isShort = false) {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      if (isShort) {
        setCopiedShort(true);
        setTimeout(() => setCopiedShort(false), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // fallback
    }
  }

  async function handleNativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: projectTitle,
          text: `Check out "${projectTitle}" on The Work of Human`,
          url: canonicalUrl,
        });
        setOpen(false);
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    // Fallback: copy canonical url
    handleCopy(canonicalUrl);
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectSlug}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error || `Delete failed with status ${res.status}`);
      }

      setConfirmDelete(false);
      setOpen(false);

      if (onDeleted) {
        onDeleted();
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete creation.");
      setDeleting(false);
    }
  }

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Creation options"
        className="grid size-8 place-items-center rounded-full bg-white/90 text-[#4d4942] backdrop-blur-sm border border-[#ded9cf] shadow-xs hover:bg-white hover:text-[#151515] hover:border-[#151515] transition cursor-pointer"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="surface absolute right-0 top-10 z-50 w-56 rounded-xl border border-[#ded9cf] p-1.5 shadow-xl animate-in fade-in zoom-in-95">
            {/* Share / Copy Options */}
            <div className="px-2 py-1.5 border-b border-[#ded9cf]/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c857b]">
                Share &amp; Connect
              </span>
            </div>

            <button
              type="button"
              onClick={handleNativeShare}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#151515] hover:bg-[#f6f4ef] transition cursor-pointer"
            >
              <Share2 size={14} className="text-[#0f766e]" />
              Share Creation
            </button>

            <button
              type="button"
              onClick={() => handleCopy(canonicalUrl)}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold text-[#151515] hover:bg-[#f6f4ef] transition cursor-pointer"
            >
              <span className="inline-flex items-center gap-2.5">
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-[#6f6a61]" />}
                {copied ? "Link Copied!" : "Copy Full Link"}
              </span>
              <span className="text-[10px] font-mono text-[#8c857b]">/@{creatorRef}</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopy(shortUrl, true)}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold text-[#151515] hover:bg-[#f6f4ef] transition cursor-pointer"
            >
              <span className="inline-flex items-center gap-2.5">
                {copiedShort ? <Check size={14} className="text-emerald-600" /> : <ExternalLink size={14} className="text-[#0f766e]" />}
                {copiedShort ? "Short Link Copied!" : "Copy Short ID URL"}
              </span>
              <span className="text-[10px] font-mono text-[#0f766e] font-bold">/v/{projectSlug.slice(0, 8)}</span>
            </button>

            {/* Owner controls */}
            {isOwner && (
              <>
                <div className="my-1 border-t border-[#ded9cf]/60" />
                <div className="px-2 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c857b]">
                    Creator Tools
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/@${creatorRef}/${projectSlug}`);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#151515] hover:bg-[#f6f4ef] transition cursor-pointer"
                >
                  <Edit3 size={14} className="text-[#6f6a61]" />
                  Open Full Studio View
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <Trash2 size={14} className="text-rose-500" />
                  Delete Creation
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="surface max-w-sm w-full p-6 rounded-2xl border border-[#ded9cf] shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid size-11 place-items-center rounded-full bg-rose-50 text-rose-600 border border-rose-200">
              <Trash2 size={20} />
            </div>

            <div>
              <h4 className="text-base font-bold text-[#151515]">Delete this creation?</h4>
              <p className="mt-1 text-xs text-[#6f6a61] leading-relaxed">
                Are you sure you want to delete &ldquo;{projectTitle}&rdquo;? This action cannot be undone.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="button-secondary text-xs !px-3.5 !py-1.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Forever"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

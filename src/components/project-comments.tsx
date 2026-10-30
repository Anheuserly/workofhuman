"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Send, Loader2, Heart } from "lucide-react";

interface CommentItem {
  id: string;
  content: string;
  likes_count: number;
  created_at: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
}

interface CommentUser {
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export function ProjectComments({
  projectSlug,
  currentUser,
}: {
  projectSlug: string;
  currentUser?: CommentUser | null;
}) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchComments() {
      try {
        const res = await fetch(`/api/projects/${projectSlug}/comments`);
        if (res.ok) {
          const data = (await res.json()) as { comments?: CommentItem[] };
          if (mounted && data.comments) {
            setComments(data.comments);
          }
        }
      } catch (err) {
        console.warn("Failed to load comments:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchComments();
    return () => {
      mounted = false;
    };
  }, [projectSlug]);

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (res.status === 401) {
        const currentPath = typeof window !== "undefined" ? window.location.pathname : `/explore`;
        window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
        return;
      }

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        comment?: CommentItem;
      };

      if (!res.ok) {
        throw new Error(data.error || "Failed to post comment.");
      }

      if (data.comment) {
        setComments((prev) => [data.comment!, ...prev]);
        setNewComment("");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="surface p-6 sm:p-8 rounded-xl border border-[#ded9cf] space-y-6">
      <div className="flex items-center justify-between border-b border-[#ded9cf] pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-[#0f766e]" />
          <h3 className="text-base font-bold text-[#151515]">
            Creator Discussion &amp; Feedback ({comments.length})
          </h3>
        </div>
      </div>

      {/* Comment submission form or guest prompt */}
      {!currentUser ? (
        <div className="rounded-xl border border-dashed border-[#0f766e]/30 bg-[#0f766e]/5 p-5 text-center space-y-2.5">
          <p className="text-xs font-bold text-[#151515]">
            Join the Discussion &amp; Leave Feedback
          </p>
          <p className="text-[11px] text-[#6f6a61] max-w-md mx-auto">
            Sign in to share notes with the creator, appreciate creations, and connect with creative peers.
          </p>
          <div className="pt-1">
            <Link
              href={`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/explore")}`}
              className="button-primary inline-flex items-center gap-2 !px-4 !py-1.5 text-xs font-semibold"
            >
              Sign In to Comment
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleAddComment} className="space-y-3">
          {error && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-md border border-red-200">
              {error}
            </p>
          )}
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts, ask a question, or leave feedback for the creator..."
              rows={3}
              className="w-full rounded-lg border border-[#ded9cf] bg-[#fcfbfa] p-3 text-xs text-[#151515] placeholder:text-[#8c857b] focus:border-[#0f766e] focus:bg-white focus:outline-none transition resize-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#8c857b]">
              Posting as <span className="font-semibold text-[#151515]">@{currentUser.username}</span>. Be respectful and constructive.
            </p>
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="button-primary !px-4 !py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  Post Feedback
                  <Send size={12} />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="py-8 text-center text-xs text-[#8c857b]">
          <Loader2 size={18} className="animate-spin mx-auto text-[#0f766e] mb-2" />
          Loading conversation...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-6 text-center text-xs text-[#8c857b] bg-[#fcfbfa] rounded-lg border border-dashed border-[#ded9cf]">
          No comments yet. Be the first to start the conversation with the creator!
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          {comments.map((cm) => (
            <div
              key={cm.id}
              className="flex items-start gap-3 rounded-lg border border-[#f0ede6] bg-[#fdfcfb] p-4 transition hover:border-[#ded9cf]"
            >
              {cm.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cm.avatar_url}
                  alt={cm.display_name}
                  className="size-8 rounded-full object-cover shrink-0 border border-[#ded9cf]"
                />
              ) : (
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#0f766e] text-white font-bold text-xs uppercase">
                  {(cm.username || "M").slice(0, 2)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/@${cm.username}`}
                      className="font-bold text-xs text-[#151515] hover:text-[#0f766e] hover:underline"
                    >
                      {cm.display_name}
                    </Link>
                    <span className="font-mono text-[11px] text-[#8c857b]">
                      @{cm.username}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8c857b]" suppressHydrationWarning>
                    {new Date(cm.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-[#2c2825] leading-relaxed whitespace-pre-wrap">
                  {cm.content}
                </p>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-[#8c857b]">
                  <span className="inline-flex items-center gap-1 cursor-pointer hover:text-rose-600 transition">
                    <Heart size={12} />
                    {cm.likes_count || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

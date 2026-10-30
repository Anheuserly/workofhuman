"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

export function AppreciateButton({
  projectSlug,
  initialCount = 0,
}: {
  projectSlug: string;
  initialCount?: number;
}) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function checkStatus() {
      try {
        const res = await fetch(`/api/projects/${projectSlug}/like`);
        if (res.ok) {
          const data = (await res.json()) as { liked?: boolean; likesCount?: number };
          if (mounted) {
            if (typeof data.liked === "boolean") setLiked(data.liked);
            if (typeof data.likesCount === "number") setCount(data.likesCount);
          }
        }
      } catch (err) {
        console.warn("Could not check like status:", err);
      }
    }
    checkStatus();
    return () => {
      mounted = false;
    };
  }, [projectSlug]);

  async function handleToggle() {
    if (loading) return;
    setLoading(true);

    // Optimistic UI update
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!prevLiked);
    setCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await fetch(`/api/projects/${projectSlug}/like`, {
        method: "POST",
      });

      if (!res.ok) {
        // Rollback on auth error or failure
        setLiked(prevLiked);
        setCount(prevCount);
        if (res.status === 401) {
          const currentPath = typeof window !== "undefined" ? window.location.pathname : "/explore";
          window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
        }
        return;
      }

      const data = (await res.json()) as { liked?: boolean; likesCount?: number };
      if (typeof data.liked === "boolean") setLiked(data.liked);
      if (typeof data.likesCount === "number") setCount(data.likesCount);
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={liked ? "Remove appreciation" : "Appreciate creation"}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition duration-200 cursor-pointer shadow-xs ${
        liked
          ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
          : "bg-white text-[#151515] border border-[#ded9cf] hover:bg-[#f6f4ef] hover:border-[#151515]"
      }`}
    >
      <Heart
        size={15}
        className={`transition-transform duration-200 ${
          liked ? "fill-rose-500 text-rose-500 scale-110" : "text-[#6f6a61]"
        }`}
      />
      <span>{liked ? "Appreciated" : "Appreciate"}</span>
      <span
        className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-mono ${
          liked ? "bg-rose-100 text-rose-700" : "bg-[#f6f4ef] text-[#6f6a61]"
        }`}
      >
        {count.toLocaleString()}
      </span>
    </button>
  );
}

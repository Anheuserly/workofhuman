"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";

export function FollowButton({
  username,
  initialFollowers = 0,
}: {
  username: string;
  initialFollowers?: number;
}) {
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(initialFollowers);
  const [loading, setLoading] = useState(false);
  const cleanUsername = username.replace(/^[@%40]+/, "").trim();

  useEffect(() => {
    let mounted = true;
    async function checkFollow() {
      try {
        const res = await fetch(`/api/user/follow?username=${encodeURIComponent(cleanUsername)}`);
        if (res.ok) {
          const data = (await res.json()) as { following?: boolean; followersCount?: number };
          if (mounted) {
            if (typeof data.following === "boolean") setFollowing(data.following);
            if (typeof data.followersCount === "number") setFollowersCount(data.followersCount);
          }
        }
      } catch (err) {
        console.warn("Could not check follow status:", err);
      }
    }
    if (cleanUsername) checkFollow();
    return () => {
      mounted = false;
    };
  }, [cleanUsername]);

  async function handleToggle() {
    if (loading) return;
    setLoading(true);

    const prevFollowing = following;
    const prevCount = followersCount;
    setFollowing(!prevFollowing);
    setFollowersCount(prevFollowing ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await fetch("/api/user/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername }),
      });

      if (!res.ok) {
        setFollowing(prevFollowing);
        setFollowersCount(prevCount);
        if (res.status === 401) {
          window.location.href = `/login?redirect=/@${cleanUsername}`;
        }
        return;
      }

      const data = (await res.json()) as { following?: boolean; followersCount?: number };
      if (typeof data.following === "boolean") setFollowing(data.following);
      if (typeof data.followersCount === "number") setFollowersCount(data.followersCount);
    } catch {
      setFollowing(prevFollowing);
      setFollowersCount(prevCount);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition duration-200 cursor-pointer shadow-xs ${
        following
          ? "border border-[#ded9cf] bg-white text-[#151515] hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          : "bg-[#151515] text-white hover:bg-[#0f766e]"
      }`}
    >
      {loading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : following ? (
        <>
          <UserCheck size={13} className="text-[#0f766e]" />
          Following
        </>
      ) : (
        <>
          <UserPlus size={13} />
          Follow Creator
        </>
      )}
    </button>
  );
}

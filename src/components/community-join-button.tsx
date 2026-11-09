"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";

export function CommunityJoinButton({
  communitySlug,
  initialIsMember,
  initialMemberCount,
  isAuthenticated,
}: {
  communitySlug: string;
  initialIsMember: boolean;
  initialMemberCount: number;
  isAuthenticated: boolean;
}) {
  const [isMember, setIsMember] = useState(initialIsMember);
  const [memberCount, setMemberCount] = useState(initialMemberCount);
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <Link
        href={`/signin?next=/communities/${communitySlug}`}
        className="button-primary text-xs !px-4 !py-2 font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
      >
        <UserPlus size={14} />
        Join Guild
      </Link>
    );
  }

  async function handleToggleJoin() {
    if (loading) return;
    setLoading(true);

    // Optimistic toggle
    const prevMember = isMember;
    const prevCount = memberCount;
    setIsMember(!prevMember);
    setMemberCount(prevMember ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await fetch(`/api/communities/${communitySlug}/join`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to update membership");
      }

      const data = await res.json();
      setIsMember(data.isMember);
      setMemberCount(data.memberCount);
    } catch (err) {
      console.error(err);
      // Revert on failure
      setIsMember(prevMember);
      setMemberCount(prevCount);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggleJoin}
      disabled={loading}
      className={`text-xs font-bold !px-5 !py-2 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs ${
        isMember
          ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 group"
          : "button-primary"
      }`}
    >
      {loading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : isMember ? (
        <>
          <UserCheck size={14} className="group-hover:hidden" />
          <span className="group-hover:hidden">Guild Member</span>
          <span className="hidden group-hover:inline">Leave Guild</span>
        </>
      ) : (
        <>
          <UserPlus size={14} />
          Join Guild
        </>
      )}
    </button>
  );
}

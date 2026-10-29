import { BadgeCheck, Shield, Sparkles } from "lucide-react";

interface RoleBadgeProps {
  role?: string | null;
  verified?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function RoleBadge({
  role = "creator",
  verified = false,
  size = "sm",
  className = "",
}: RoleBadgeProps) {
  const normalizedRole = (role || "creator").toLowerCase();

  const isSmall = size === "sm";
  const iconSize = isSmall ? 12 : 14;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {normalizedRole === "admin" && (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-[#151515] font-bold text-amber-300 shadow-xs ${
            isSmall ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
          } tracking-wider uppercase`}
          title="Platform Administrator"
        >
          <Shield size={iconSize} className="text-amber-400 fill-amber-400/20" />
          Admin
        </span>
      )}

      {normalizedRole === "moderator" && (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-indigo-900/10 border border-indigo-500/20 font-bold text-indigo-700 ${
            isSmall ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
          } tracking-wider uppercase`}
          title="Community Moderator"
        >
          <Sparkles size={iconSize} />
          Mod
        </span>
      )}

      {verified && (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-[#0f766e]/10 border border-[#0f766e]/20 font-semibold text-[#0f766e] ${
            isSmall ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
          }`}
          title="Verified Creator"
        >
          <BadgeCheck size={iconSize} className="text-[#0f766e]" />
          Verified
        </span>
      )}
    </div>
  );
}

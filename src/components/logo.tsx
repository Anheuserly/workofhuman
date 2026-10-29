import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  href?: string;
}

export function Logo({
  className = "",
  size = "md",
  showWordmark = true,
  href = "/",
}: LogoProps) {
  const sizeMap = {
    sm: "size-7 text-xs",
    md: "size-9 text-sm",
    lg: "size-11 text-base",
  };

  const content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <span
        className={`relative grid ${sizeMap[size]} place-items-center rounded-full bg-[#151515] font-black text-white shadow-xs transition hover:scale-105`}
        aria-hidden="true"
      >
        {/* Custom SVG Emblem */}
        <svg viewBox="0 0 64 64" fill="none" className="size-full p-1.5">
          <circle cx="32" cy="32" r="30" stroke="#2d2a26" strokeWidth="2" />
          <path
            d="M16 20L23.5 44L28.5 28L32 39L35.5 28L40.5 44L48 20"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polygon points="32,15 36,21 32,27 28,21" fill="#0f766e" />
        </svg>
      </span>

      {showWordmark && (
        <span className="text-xs sm:text-sm font-bold tracking-[0.18em] text-[#151515]">
          THE WORK OF HUMAN
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="The Work of Human home">
        {content}
      </Link>
    );
  }

  return content;
}

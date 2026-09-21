import React from "react";

interface MurafiqLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  variant?: "dark" | "light";
  className?: string;
}

export function MurafiqLogo({
  size = "md",
  showText = true,
  variant = "dark",
  className = "",
}: MurafiqLogoProps) {
  const iconDimensions = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }[size];

  const titleSize = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  }[size];

  const subtitleSize = {
    sm: "text-[10px]",
    md: "text-[11px]",
    lg: "text-xs",
    xl: "text-sm",
  }[size];

  const textColor = variant === "light" ? "text-white" : "text-sky-950";
  const subtextColor = variant === "light" ? "text-sky-200" : "text-slate-500";

  return (
    <div className={`flex items-center gap-2.5 font-arabic ${className}`}>
      {/* Modern Class Vector Emblem */}
      <div
        className={`${iconDimensions} relative flex-shrink-0 rounded-2xl p-0.5 shadow-sm transition-transform hover:scale-105 duration-200`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-xs"
        >
          <defs>
            {/* Outer Squircle Gradient */}
            <linearGradient id="mrf-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0369a1" />
              <stop offset="50%" stopColor="#0c4a6e" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Wing / Ribbon Right Gradient */}
            <linearGradient id="mrf-wing-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Wing / Ribbon Left Gradient */}
            <linearGradient id="mrf-wing-left" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>

            {/* Center Beacon Sparkle */}
            <linearGradient id="mrf-beacon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#bae6fd" />
            </linearGradient>
          </defs>

          {/* Background Squircle */}
          <rect width="48" height="48" rx="13" fill="url(#mrf-bg)" />

          {/* Subtle Inner Glow Border */}
          <rect
            x="0.75"
            y="0.75"
            width="46.5"
            height="46.5"
            rx="12.25"
            stroke="white"
            strokeOpacity="0.16"
            strokeWidth="1.5"
          />

          {/* Abstract Converging Arch of Resolution (Mediation Wings forming stylized 'M' & Civic Shield) */}
          {/* Left Protective Wing */}
          <path
            d="M12 33V20C12 16.5 14.5 14 18 14C20.5 14 22.5 15.5 24 17.5V29C24 30.5 22.5 32 20.5 32C18.5 32 17 30.5 17 29V23.5"
            stroke="url(#mrf-wing-left)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Protective Wing */}
          <path
            d="M36 33V20C36 16.5 33.5 14 30 14C27.5 14 25.5 15.5 24 17.5V29C24 30.5 25.5 32 27.5 32C29.5 32 31 30.5 31 29V23.5"
            stroke="url(#mrf-wing-right)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central Nexus Diamond Spark (Trust & Resolution Beacon) */}
          <path
            d="M24 8.5L26.5 12L24 15.5L21.5 12L24 8.5Z"
            fill="url(#mrf-beacon)"
            className="animate-pulse"
          />

          {/* Base Foundation Bar */}
          <circle cx="24" cy="36" r="2.2" fill="url(#mrf-wing-right)" />
        </svg>
      </div>

      {/* Typography Brand Lockup */}
      {showText && (
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1.5">
            <span className={`font-black ${titleSize} ${textColor} tracking-tight leading-none`}>
              مُرافِق
            </span>
            <span className="text-[10px] font-extrabold tracking-widest text-sky-600 uppercase bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 font-sans">
              MURAFIQ
            </span>
          </div>
          <span className={`block ${subtitleSize} ${subtextColor} font-medium mt-1 leading-tight`}>
            المنظومة الوطنية للوساطة والتسوية المؤسسية
          </span>
        </div>
      )}
    </div>
  );
}

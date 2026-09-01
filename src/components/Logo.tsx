import { cn } from "../utils/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("block", className)} aria-hidden="true">
      {/* Speed / road chevron mark */}
      <path
        d="M6 28 L18 8 L22 8 L13 26"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 30 L32 12 L36 12 L28 28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Red accent dot — the "vibe" */}
      <circle cx="33.4" cy="29" r="3.2" fill="#e3262e" />
    </svg>
  );
}

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2 sm:gap-2.5", className)}>
      <LogoMark className="h-6 w-6 shrink-0 text-white sm:h-7 sm:w-7" />
      <span
        className={cn(
          "font-display font-extrabold tracking-[0.08em] text-white select-none",
          compact ? "text-xl" : "text-xl sm:text-2xl"
        )}
        style={{ letterSpacing: "0.08em" }}
      >
        CAR<span className="text-[#e3262e]">VIBES</span>
      </span>
    </div>
  );
}

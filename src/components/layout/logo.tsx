import { cn } from "@/lib/utils";

/**
 * The Mind Substances mark: a point held by two nested open vessels — an idea
 * being caught and kept.
 *
 * Drawn on a 32×32 grid with generous stroke weights so it stays legible at
 * 16px. Uses `currentColor` so it inherits the surrounding text colour in both
 * themes. Kept in sync with the copies in `icon.tsx`, `apple-icon.tsx` and the
 * opengraph images, which cannot import components.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-7 h-7", className)}
      aria-hidden="true"
    >
      <circle cx="16" cy="6.5" r="3.2" fill="currentColor" />
      <path
        d="M10 13a6 6 0 0 0 12 0"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M5 16.5a11 11 0 0 0 22 0"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  markClassName?: string;
  /** Hide the wordmark and show the mark alone. */
  markOnly?: boolean;
}

export function Logo({ className, markClassName, markOnly }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={cn("text-mark shrink-0", markClassName)} />
      {!markOnly && (
        <span className="font-display font-bold tracking-tight leading-none">
          Mind Substances
        </span>
      )}
    </span>
  );
}

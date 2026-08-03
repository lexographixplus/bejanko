import { formatDate } from "@/lib/utils";

interface MarginColumnProps {
  date: Date | string;
  type: string;
  readingTime?: number | null;
  aside?: string | null;
}

export function MarginColumn({ date, type, readingTime, aside }: MarginColumnProps) {
  return (
    <aside className="lg:w-[var(--margin-col)] lg:shrink-0 flex lg:flex-col gap-3 lg:gap-4 text-sm text-soft lg:sticky lg:top-24 lg:self-start">
      <time dateTime={new Date(date).toISOString()} className="tabular-nums">
        {formatDate(date)}
      </time>
      <span className="uppercase tracking-wider text-xs font-medium text-mark">
        {type}
      </span>
      {readingTime && (
        <span>{readingTime} min read</span>
      )}
      {aside && (
        <p className="hidden lg:block text-xs leading-relaxed mt-2 pt-4 border-t border-rule italic">
          {aside}
        </p>
      )}
    </aside>
  );
}

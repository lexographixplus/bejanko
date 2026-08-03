import { formatDate } from "@/lib/utils";

interface MarginColumnProps {
  date: Date | string;
  type: string;
  readingTime?: number | null;
  aside?: string | null;
}

/**
 * The sticky metadata rail beside long-form content.
 *
 * Desktop only: below `lg` it would sit alongside the article and crush the
 * body copy into a narrow ribbon, and its date/reading-time are already shown
 * in the page header at that size. Use `MobileAside` to keep the margin note
 * itself visible on small screens.
 */
export function MarginColumn({
  date,
  type,
  readingTime,
  aside,
}: MarginColumnProps) {
  return (
    <aside className="hidden lg:flex lg:w-[var(--margin-col)] lg:shrink-0 lg:flex-col gap-4 text-sm text-soft lg:sticky lg:top-24 lg:self-start">
      <time dateTime={new Date(date).toISOString()} className="tabular-nums">
        {formatDate(date)}
      </time>
      <span className="uppercase tracking-wider text-xs font-medium text-mark">
        {type}
      </span>
      {readingTime && <span>{readingTime} min read</span>}
      {aside && (
        <p className="text-xs leading-relaxed mt-2 pt-4 border-t border-rule italic">
          {aside}
        </p>
      )}
    </aside>
  );
}

/** The margin note, shown inline above the body on small screens. */
export function MobileAside({ aside }: { aside?: string | null }) {
  if (!aside) return null;

  return (
    <p className="lg:hidden mb-8 border-l-2 border-mark/40 pl-4 text-sm text-soft italic leading-relaxed">
      {aside}
    </p>
  );
}

/**
 * Date / type / reading time for small screens.
 *
 * Only for pages whose header doesn't already carry this — the essay page
 * shows it under the title, so adding this there would duplicate it.
 */
export function MobileMeta({
  date,
  type,
  readingTime,
}: Omit<MarginColumnProps, "aside">) {
  return (
    <div className="lg:hidden flex flex-wrap items-center gap-3 text-sm text-soft mb-6">
      <span className="uppercase tracking-wider text-xs font-medium text-mark">
        {type}
      </span>
      <span aria-hidden className="w-1 h-1 rounded-full bg-rule" />
      <time dateTime={new Date(date).toISOString()} className="tabular-nums">
        {formatDate(date)}
      </time>
      {readingTime && (
        <>
          <span aria-hidden className="w-1 h-1 rounded-full bg-rule" />
          <span>{readingTime} min read</span>
        </>
      )}
    </div>
  );
}

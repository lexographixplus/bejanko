import Link from "next/link";
import { TableOfContents } from "@/components/shared/table-of-contents";
import { PromoBox, type Promo } from "@/components/shared/promo-box";
import { formatDate } from "@/lib/utils";
import type { TocItem } from "@/lib/utils";

export interface RecentEssay {
  title: string;
  slug: string;
  readingTime?: number | null;
  createdAt: Date | string;
}

interface EssaySidebarProps {
  date: Date | string;
  readingTime?: number | null;
  aside?: string | null;
  toc: TocItem[];
  recent: RecentEssay[];
  promo: Promo | null;
}

/** Meta, contents, more reading and the house promo — the desktop rail. */
export function EssaySidebar({
  date,
  readingTime,
  aside,
  toc,
  recent,
  promo,
}: EssaySidebarProps) {
  return (
    /* Sticky, but with its own scroll: once the contents list grows past the
       viewport a purely sticky column would strand its lower half. */
    <aside className="hidden xl:block w-[320px] shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain pr-1 space-y-8">
        {/* Meta */}
        <div className="space-y-2 text-sm text-soft">
          <span className="block uppercase tracking-wider text-xs font-medium text-mark">
            Essay
          </span>
          <time
            dateTime={new Date(date).toISOString()}
            className="block tabular-nums"
          >
            {formatDate(date)}
          </time>
          {readingTime && <span className="block">{readingTime} min read</span>}

          {aside && (
            <p className="text-xs leading-relaxed pt-3 mt-3 border-t border-rule italic">
              {aside}
            </p>
          )}
        </div>

        <TableOfContents items={toc} variant="sidebar" />

        {recent.length > 0 && (
          <nav aria-label="More essays">
            <p className="text-[11px] uppercase tracking-[0.12em] text-soft/70 mb-3">
              More essays
            </p>
            <ul className="space-y-3">
              {recent.map((essay) => (
                <li key={essay.slug}>
                  <Link
                    href={`/essays/${essay.slug}`}
                    className="group block"
                  >
                    <span className="block text-sm font-medium text-ink group-hover:text-mark transition-colors leading-snug">
                      {essay.title}
                    </span>
                    <span className="block text-xs text-soft mt-0.5">
                      {formatDate(essay.createdAt)}
                      {essay.readingTime && ` · ${essay.readingTime} min`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <PromoBox promo={promo} />
      </div>
    </aside>
  );
}

/**
 * The same extras below the essay on small screens, where the rail is hidden.
 * The table of contents is not repeated — it stays as the collapsible box
 * above the body, which is useful before reading rather than after.
 */
export function EssaySidebarMobile({
  recent,
  promo,
}: {
  recent: RecentEssay[];
  promo: Promo | null;
}) {
  if (recent.length === 0 && !promo) return null;

  return (
    <div className="xl:hidden mt-14 space-y-8">
      <PromoBox promo={promo} />

      {recent.length > 0 && (
        <nav aria-label="More essays">
          <p className="text-[11px] uppercase tracking-[0.12em] text-soft/70 mb-4">
            More essays
          </p>
          <ul className="grid sm:grid-cols-2 gap-4">
            {recent.map((essay) => (
              <li key={essay.slug}>
                <Link
                  href={`/essays/${essay.slug}`}
                  className="group block rounded-xl border border-rule bg-surface p-4 hover:border-mark/40 transition-colors"
                >
                  <span className="block text-sm font-medium text-ink group-hover:text-mark transition-colors leading-snug">
                    {essay.title}
                  </span>
                  <span className="block text-xs text-soft mt-1">
                    {formatDate(essay.createdAt)}
                    {essay.readingTime && ` · ${essay.readingTime} min`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

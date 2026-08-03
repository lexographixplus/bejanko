import Link from "next/link";
import Image from "next/image";
import { formatDate, truncate, stripHtml, cn } from "@/lib/utils";

// ── Essay Card ───────────────────────────────────────

interface EssayCardProps {
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  readingTime?: number | null;
  createdAt: Date | string;
  className?: string;
}

export function EssayCard({
  title,
  slug,
  excerpt,
  coverImage,
  readingTime,
  createdAt,
  className,
}: EssayCardProps) {
  return (
    <Link
      href={`/essays/${slug}`}
      className={cn(
        "group block rounded-xl overflow-hidden bg-surface border border-rule/50",
        "hover:border-mark/20 hover:shadow-lg hover:-translate-y-0.5",
        "transition-all duration-300",
        className
      )}
    >
      {coverImage ? (
        <div className="aspect-[16/9] overflow-hidden bg-stone">
          <Image
            src={coverImage}
            alt={title}
            width={600}
            height={338}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
          />
        </div>
      ) : (
        /* No cover: a slim marker rather than a full-bleed block repeating the
           title, which read as a failed image. */
        <div className="h-1.5 bg-gradient-to-r from-mark/70 via-mark/25 to-transparent" />
      )}
      <div className="p-5">
        <div className="flex items-center gap-3 text-xs text-soft mb-3">
          <time dateTime={new Date(createdAt).toISOString()}>
            {formatDate(createdAt)}
          </time>
          {readingTime && (
            <>
              <span className="w-1 h-1 rounded-full bg-rule" />
              <span>{readingTime} min read</span>
            </>
          )}
        </div>
        <h3 className="font-display font-semibold text-lg text-ink group-hover:text-mark transition-colors leading-snug">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-2 text-soft text-sm leading-relaxed">
            {truncate(stripHtml(excerpt), 140)}
          </p>
        )}
      </div>
    </Link>
  );
}

// ── Note Card ────────────────────────────────────────

interface NoteCardProps {
  title?: string | null;
  slug: string;
  content: string;
  createdAt: Date | string;
}

export function NoteCard({ title, slug, content, createdAt }: NoteCardProps) {
  return (
    <Link
      href={`/notes/${slug}`}
      className="group block py-6 border-b border-rule/50 hover:bg-stone/20 -mx-4 px-4 rounded-lg transition-colors"
    >
      <div className="flex items-start gap-6">
        <time
          dateTime={new Date(createdAt).toISOString()}
          className="hidden sm:block text-xs text-soft tabular-nums shrink-0 pt-1 w-24"
        >
          {formatDate(createdAt)}
        </time>
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="font-display font-semibold text-ink group-hover:text-mark transition-colors mb-1">
              {title}
            </h3>
          )}
          <p className="text-soft text-sm leading-relaxed">
            {truncate(stripHtml(content), 200)}
          </p>
          <time
            dateTime={new Date(createdAt).toISOString()}
            className="sm:hidden block mt-2 text-xs text-soft/70"
          >
            {formatDate(createdAt)}
          </time>
        </div>
      </div>
    </Link>
  );
}

// ── Quote Card ───────────────────────────────────────

interface QuoteCardProps {
  id?: string;
  content: string;
  source?: string | null;
  createdAt: Date | string;
}

export function QuoteCard({ content, source, createdAt }: QuoteCardProps) {
  return (
    <figure className="relative bg-surface border border-rule/50 rounded-xl p-6 hover:shadow-md hover:border-mark/20 transition-all group">
      {/* Decorative quote mark */}
      <span className="absolute top-3 right-4 font-display text-5xl text-rule/30 leading-none select-none" aria-hidden>
        &rdquo;
      </span>
      <blockquote className="font-reading text-ink text-lg leading-relaxed italic relative">
        &ldquo;{stripHtml(content)}&rdquo;
      </blockquote>
      {source && (
        <figcaption className="mt-4 text-sm text-soft flex items-center gap-2">
          <span className="w-6 h-px bg-mark" />
          {stripHtml(source)}
        </figcaption>
      )}
      <time
        dateTime={new Date(createdAt).toISOString()}
        className="block mt-3 text-xs text-soft/60"
      >
        {formatDate(createdAt)}
      </time>
    </figure>
  );
}

// ── Book Card ────────────────────────────────────────

interface BookCardProps {
  title: string;
  slug: string;
  coverImage?: string | null;
  bookAuthor?: string | null;
  year?: number | null;
  excerpt?: string | null;
  link?: string | null;
}

export function BookCard({
  title,
  slug,
  coverImage,
  bookAuthor,
  year,
  excerpt,
}: BookCardProps) {
  // Always route to the detail page — retailer links live there, so the card
  // never sends a reader straight off the site.
  return (
    <Link
      href={`/books/${slug}`}
      className="group flex gap-5 p-4 rounded-xl transition-colors hover:bg-stone/30"
    >
      <div className="w-20 h-28 shrink-0 rounded-md overflow-hidden bg-stone shadow-md group-hover:shadow-lg transition-shadow">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            width={80}
            height={112}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-mark/20 to-mark/5 flex items-center justify-center">
            <span className="font-display text-xs text-mark/60 text-center px-2 leading-tight">
              {title}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 py-1">
        <h3 className="font-display font-semibold text-ink group-hover:text-mark transition-colors leading-snug">
          {title}
        </h3>
        {bookAuthor && (
          <p className="text-sm text-soft mt-0.5">
            {bookAuthor}
            {year && <span className="text-soft/60"> &middot; {year}</span>}
          </p>
        )}
        {excerpt && (
          <p className="text-xs text-soft/80 mt-2 leading-relaxed">
            {truncate(stripHtml(excerpt), 100)}
          </p>
        )}
      </div>
    </Link>
  );
}

// ── Guest Post Card ──────────────────────────────────

interface GuestPostCardProps {
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  contributorName: string;
  createdAt: Date | string;
}

export function GuestPostCard({
  title,
  slug,
  excerpt,
  coverImage,
  contributorName,
  createdAt,
}: GuestPostCardProps) {
  return (
    <Link
      href={`/guest-writing/${slug}`}
      className="group block rounded-xl overflow-hidden bg-surface border border-rule/50 hover:border-mark/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      {coverImage ? (
        <div className="aspect-[16/9] overflow-hidden bg-stone">
          <Image
            src={coverImage}
            alt={title}
            width={600}
            height={338}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
          />
        </div>
      ) : (
        <div className="h-1.5 bg-gradient-to-r from-mark/70 via-mark/25 to-transparent" />
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-mark/20 to-mark/5 flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-[10px] text-mark">
              {contributorName.charAt(0)}
            </span>
          </div>
          <span className="text-xs text-soft">{contributorName}</span>
          <span className="text-xs font-medium text-mark bg-mark/5 px-2 py-0.5 rounded-full ml-auto">
            Guest
          </span>
        </div>
        <h3 className="font-display font-semibold text-lg text-ink group-hover:text-mark transition-colors leading-snug">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-2 text-soft text-sm leading-relaxed">
            {truncate(stripHtml(excerpt), 140)}
          </p>
        )}
        <time
          dateTime={new Date(createdAt).toISOString()}
          className="block mt-3 text-xs text-soft/60"
        >
          {formatDate(createdAt)}
        </time>
      </div>
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn, truncate, stripHtml } from "@/lib/utils";

interface AuthorCardProps {
  name: string;
  slug: string;
  role?: string | null;
  excerpt?: string | null;
  bio?: string | null;
  photo?: string | null;
  className?: string;
}

/** Initials fallback so a card without a photo still has a visual anchor. */
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AuthorCard({
  name,
  slug,
  role,
  excerpt,
  bio,
  photo,
  className,
}: AuthorCardProps) {
  const blurb = excerpt || (bio ? truncate(stripHtml(bio), 120) : null);

  return (
    <Link
      href={`/authors/${slug}`}
      className={cn(
        "group flex flex-col items-center text-center rounded-2xl border border-rule/60 bg-surface p-6",
        "hover:border-mark/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300",
        className
      )}
    >
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-stone shrink-0 ring-1 ring-rule">
        {photo ? (
          <Image
            src={photo}
            alt={name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-mark/20 to-mark/5 font-display font-bold text-xl text-mark">
            {initials(name)}
          </span>
        )}
      </div>

      <h3 className="mt-4 font-display font-semibold text-lg text-ink group-hover:text-mark transition-colors">
        {name}
      </h3>

      {role && (
        <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-mark font-medium">
          {role}
        </p>
      )}

      {blurb && (
        <p className="mt-3 text-sm text-soft leading-relaxed">{blurb}</p>
      )}

      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-soft group-hover:text-mark transition-colors">
        Read profile
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </span>
    </Link>
  );
}

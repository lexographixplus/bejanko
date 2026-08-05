import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Promo {
  enabled: boolean;
  eyebrow?: string;
  title: string;
  body?: string;
  image?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

/**
 * Reads the promo out of the SiteSetting KV store. Returns null unless it is
 * switched on and has at least a title, so a half-filled draft never ships.
 */
export function promoFromSettings(settings: Record<string, string>): Promo | null {
  if (settings.promoEnabled !== "true") return null;

  const title = settings.promoTitle?.trim();
  if (!title) return null;

  return {
    enabled: true,
    eyebrow: settings.promoEyebrow?.trim() || undefined,
    title,
    body: settings.promoBody?.trim() || undefined,
    image: settings.promoImage?.trim() || undefined,
    ctaLabel: settings.promoCtaLabel?.trim() || undefined,
    ctaUrl: settings.promoCtaUrl?.trim() || undefined,
  };
}

export function PromoBox({
  promo,
  className,
}: {
  promo: Promo | null;
  className?: string;
}) {
  if (!promo) return null;

  const href = promo.ctaUrl;
  // Only leave the site for an absolute URL; anything else stays internal.
  const external = href ? /^https?:\/\//i.test(href) : false;

  const inner = (
    <>
      {promo.image && (
        <div className="aspect-[16/9] rounded-lg overflow-hidden bg-stone mb-3">
          <Image
            src={promo.image}
            alt=""
            width={320}
            height={180}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {promo.eyebrow && (
        <p className="text-[10px] uppercase tracking-[0.14em] text-soft/70 mb-1.5">
          {promo.eyebrow}
        </p>
      )}

      <p className="font-display font-semibold text-ink leading-snug">
        {promo.title}
      </p>

      {promo.body && (
        <p className="mt-1.5 text-sm text-soft leading-relaxed">{promo.body}</p>
      )}

      {href && promo.ctaLabel && (
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-mark group-hover:gap-2.5 transition-all">
          {promo.ctaLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      )}
    </>
  );

  const box = cn(
    "block rounded-xl border border-rule bg-surface p-4 transition-colors",
    href && "group hover:border-mark/40",
    className
  );

  if (!href) return <div className={box}>{inner}</div>;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={box}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={box}>
      {inner}
    </Link>
  );
}

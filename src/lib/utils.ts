import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "") // strip diacritics
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const HEADING_RE = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi;

/**
 * Walks the h2/h3 headings of a rich-text body once, assigning each a stable,
 * de-duplicated id. Returns the rewritten HTML alongside the matching TOC so
 * the anchors rendered by `TableOfContents` always resolve to a real element —
 * TipTap does not emit heading ids of its own.
 */
export function buildToc(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const seen = new Map<string, number>();

  const rewritten = html.replace(
    HEADING_RE,
    (_full, level: string, attrs: string, inner: string) => {
      const text = stripHtml(inner).trim();
      const base = slugify(text) || `section-${toc.length + 1}`;

      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count + 1}`;

      toc.push({ id, text, level: Number(level) as 2 | 3 });

      // Drop any pre-existing id so ours is the only one on the element.
      const cleaned = attrs.replace(/\sid=("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
      return `<h${level}${cleaned} id="${id}">${inner}</h${level}>`;
    }
  );

  return { html: rewritten, toc };
}

export function extractToc(html: string): TocItem[] {
  return buildToc(html).toc;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  const cut = str.slice(0, length);
  const last = cut.lastIndexOf(" ");
  return (last > 0 ? cut.slice(0, last) : cut).trimEnd() + "...";
}

export function stripHtml(html: string): string {
  if (typeof document !== "undefined") {
    const el = document.createElement("div");
    el.innerHTML = html;
    return el.textContent ?? "";
  }
  return html.replace(/<[^>]*>/g, "");
}

export function anonymizeIp(ip: string): string {
  if (ip.includes(":")) {
    return ip.split(":").slice(0, 4).join(":") + "::";
  }
  return ip.split(".").slice(0, 3).join(".") + ".0";
}

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

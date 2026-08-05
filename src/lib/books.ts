/** A downloadable file stored inside `Book.files`. */
export interface BookFile {
  format: "EPUB" | "PDF";
  url: string;
  sizeBytes?: number;
}

/** EPUB first — it reflows, so it's the better read on a phone. */
const FORMAT_ORDER: BookFile["format"][] = ["EPUB", "PDF"];

export const FORMAT_BLURB: Record<BookFile["format"], string> = {
  EPUB: "Reflows to your screen — best on phones and e-readers",
  PDF: "Fixed layout — opens anywhere",
};

/**
 * Normalise `Book.files`, which is a Json column and so could hold anything.
 * Returns at most one file per format, ordered with EPUB first.
 */
export function parseBookFiles(value: unknown): BookFile[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const files: BookFile[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const { format, url, sizeBytes } = entry as Record<string, unknown>;

    if (typeof url !== "string") continue;
    const trimmed = url.trim();
    // Only http(s): a stored `javascript:` URL would become a clickable
    // script link on the public page.
    if (!/^https?:\/\//i.test(trimmed)) continue;

    const upper = String(format).toUpperCase();
    if (upper !== "EPUB" && upper !== "PDF") continue;
    if (seen.has(upper)) continue;
    seen.add(upper);

    files.push({
      format: upper,
      url: trimmed,
      sizeBytes: typeof sizeBytes === "number" ? sizeBytes : undefined,
    });
  }

  return files.sort(
    (a, b) => FORMAT_ORDER.indexOf(a.format) - FORMAT_ORDER.indexOf(b.format)
  );
}

export function formatFileSize(bytes?: number): string | null {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** A single retailer entry stored inside `Book.buyLinks`. */
export interface BuyLink {
  label: string;
  url: string;
}

/**
 * `buyLinks` is a Json column, so anything could be in there. Normalise it into
 * a predictable shape rather than trusting the stored value at render time.
 *
 * Lives outside the `'use server'` actions module, which may only export async
 * functions.
 */
export function parseBuyLinks(value: unknown): BuyLink[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const { label, url } = entry as Record<string, unknown>;

    if (typeof url !== "string") return [];
    const trimmed = url.trim();
    if (!trimmed) return [];

    // Only http(s) — a stored `javascript:` URL would otherwise become a
    // clickable script link on the public page.
    if (!/^https?:\/\//i.test(trimmed)) return [];

    return [
      {
        label:
          typeof label === "string" && label.trim() ? label.trim() : "Buy",
        url: trimmed,
      },
    ];
  });
}

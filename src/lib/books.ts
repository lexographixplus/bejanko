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

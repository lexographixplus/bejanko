export const SITE_NAME = "Mind Substances";
export const SITE_TAGLINE =
  "A writing space first, a literary community second.";
export const SITE_DESCRIPTION =
  "Essays, notes, and fragments on language, meaning, and the quiet work of paying attention.";

/**
 * Canonical origin, without a trailing slash.
 *
 * Falls back through Vercel's system environment variables so previews and
 * production both produce absolute URLs without extra configuration.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

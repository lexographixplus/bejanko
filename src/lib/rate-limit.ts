/**
 * Small in-memory sliding-window limiter for the public POST endpoints.
 *
 * Deliberately dependency-free: on serverless this is per-instance rather than
 * global, so treat it as a spam speed-bump layered on top of the honeypots and
 * the unique constraints — not as a security boundary.
 */

type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Hit>();

// Keep the map from growing without bound on a long-lived instance.
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, hit] of buckets) {
    if (hit.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter: number; // seconds
}

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 } = {}
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const hit = buckets.get(key);

  if (!hit || hit.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  hit.count += 1;

  if (hit.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((hit.resetAt - now) / 1000),
    };
  }

  return { ok: true, remaining: limit - hit.count, retryAfter: 0 };
}

/** Best-effort client identity for rate limiting. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

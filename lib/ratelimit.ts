/**
 * Best-effort in-memory rate limiter.
 *
 * Guards the verification-code endpoints so they cannot be used to spray
 * codes at arbitrary Role IDs. This is per-instance state: it stops casual
 * abuse and runaway clients, but a multi-region deploy would want a shared
 * store (Upstash, Redis) to make the limit global.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return { ok: true, remaining: limit - existing.count, retryAfterSeconds: 0 };
}

/** Drop expired buckets so the map cannot grow without bound. */
export function sweep(maxEntries = 5_000): void {
  if (buckets.size <= maxEntries) return;
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** Client IP from proxy headers, falling back to a shared bucket. */
export function clientKey(request: Request, suffix = ""): string {
  const headers = request.headers;
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown";
  return `${ip}${suffix ? `:${suffix}` : ""}`;
}

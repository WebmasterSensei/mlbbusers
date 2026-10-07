/**
 * Upstream client for the Rone Arena MLBB API.
 *
 * Free, keyless, CORS-open — but we still go through our own Route Handlers so
 * that (a) the player's JWT never reaches client JavaScript and (b) the set of
 * reachable upstream paths is an explicit allowlist rather than a pass-through.
 *
 * Game data © Moonton (Mobile Legends: Bang Bang). API maintained by
 * ridwaanhall / RoneAI. Unofficial — not affiliated with or endorsed by Moonton.
 */
export const RONE_BASE = process.env.NEXT_PUBLIC_RONE_BASE!;
export const PUBLIC_REVALIDATE = Number(
  process.env.NEXT_PUBLIC_REVALIDATE ?? 3600
);
export class ApiError extends Error {
  readonly status: number;
  readonly upstream: string | null;

  constructor(message: string, status: number, upstream?: string | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.upstream = upstream ?? null;
  }
}

export type Token = string | null;

interface UpstreamOptions {
  searchParams?: Record<string, string | number | undefined | null>;
  token?: Token;
  /** Public catalog endpoints are cached; authenticated calls never are. */
  authed?: boolean;
  revalidate?: number | false;
  signal?: AbortSignal;
}

/** Shape shared by every `arena.rone.dev` payload. */
interface Envelope<T> {
  code?: number;
  message?: string;
  msg?: string;
  data?: T;
  status?: string;
  details?: string;
}

function buildUrl(path: string, searchParams?: UpstreamOptions["searchParams"]): string {
  const url = new URL(`${RONE_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/**
 * Single funnel for every upstream call. Normalises upstream error envelopes
 * into `ApiError` so callers never have to guess the failure shape.
 */
export async function upstreamFetch<T>(
  path: string,
  { searchParams, token = null, authed = false, revalidate, signal }: UpstreamOptions = {},
): Promise<T> {
  const url = buildUrl(path, searchParams);

  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "usersmlbb/0.1 (+r.one.dev client)",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  // Authenticated responses must never land in the data cache.
  const cacheOptions: RequestInit & { next?: { revalidate: number | false } } = {
    headers,
    signal,
  };
  if (authed || token) {
    cacheOptions.cache = "no-store";
  } else {
    cacheOptions.next = { revalidate: revalidate ?? PUBLIC_REVALIDATE };
  }

  let res: Response;
  try {
    res = await fetch(url, cacheOptions);
  } catch (cause) {
    throw new ApiError(
      "Could not reach the MLBB data service. Check your connection and try again.",
      503,
      cause instanceof Error ? cause.message : null,
    );
  }

  const raw = await res.text();
  let body: Envelope<T> | null = null;
  if (raw) {
    try {
      body = JSON.parse(raw) as Envelope<T>;
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    const detail = body?.message ?? body?.msg ?? body?.details ?? res.statusText;
    throw new ApiError(detail || "Upstream request failed", res.status, raw.slice(0, 400));
  }

  // Upstream signals business errors with HTTP 200 + a non-zero body code.
  const code = body?.code;
  if (typeof code === "number" && code !== 0) {
    throw new ApiError(body?.message ?? body?.msg ?? "Upstream rejected the request", 200, raw.slice(0, 400));
  }

  return (body?.data ?? (body as unknown as T)) as T;
}

export async function upstreamPost<T>(
  path: string,
  payload: unknown,
  { signal }: { signal?: AbortSignal } = {},
): Promise<T> {
  const url = buildUrl(path);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "usersmlbb/0.1 (+r.one.dev client)",
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
      signal,
    });
  } catch (cause) {
    throw new ApiError(
      "Could not reach the MLBB data service. Check your connection and try again.",
      503,
      cause instanceof Error ? cause.message : null,
    );
  }

  const raw = await res.text();
  let body: Envelope<T> | null = null;
  if (raw) {
    try {
      body = JSON.parse(raw) as Envelope<T>;
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    const detail = body?.message ?? body?.msg ?? body?.details ?? res.statusText;
    throw new ApiError(detail || "Upstream request failed", res.status, raw.slice(0, 400));
  }

  const code = body?.code;
  if (typeof code === "number" && code !== 0) {
    throw new ApiError(body?.message ?? body?.msg ?? "Upstream rejected the request", 200, raw.slice(0, 400));
  }

  return (body?.data ?? (body as unknown as T)) as T;
}

/** Convenience for human-facing error text in the UI. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

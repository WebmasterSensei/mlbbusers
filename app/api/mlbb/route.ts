import { NextResponse } from "next/server";
import { ApiError, errorMessage, upstreamFetch } from "@/lib/api";

/**
 * Public catalog proxy.
 *
 * An explicit allowlist rather than a pass-through: the set of upstream paths
 * this app can reach is fixed here, so a crafted request can never fan out to
 * arbitrary endpoints.
 */
interface PublicRoute {
  path: string;
  query: (q: URLSearchParams) => Record<string, string | number>;
}

const PUBLIC_ROUTES: Record<string, PublicRoute> = {
  heroes: {
    path: "/heroes",
    query: (q) => ({ size: q.get("size") ?? 200, order: q.get("order") ?? "" }),
  },
  positions: {
    path: "/heroes/positions",
    query: (q) => ({ size: q.get("size") ?? 200, role: q.get("role") ?? "", lane: q.get("lane") ?? "" }),
  },
  "hero/rank": {
    path: "/heroes/rank",
    query: (q) => ({ size: q.get("size") ?? 20, rank: q.get("rank") ?? "", days: q.get("days") ?? "" }),
  },
  ranks: {
    path: "/academy/ranks",
    query: (q) => ({ size: q.get("size") ?? 40 }),
  },
  roles: {
    path: "/academy/roles",
    query: () => ({ size: 7 }),
  },
  "meta/version": {
    path: "/academy/meta/version",
    query: (q) => ({ size: q.get("size") ?? 5 }),
  },
  equipment: {
    path: "/academy/equipment",
    query: (q) => ({ size: q.get("size") ?? 200 }),
  },
  emblems: {
    path: "/academy/emblems",
    query: (q) => ({ size: q.get("size") ?? 10 }),
  },
  spells: {
    path: "/academy/spells",
    query: (q) => ({ size: q.get("size") ?? 20 }),
  },
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const resource = url.searchParams.get("resource") ?? "";

  const route = PUBLIC_ROUTES[resource];
  if (!route) {
    return NextResponse.json(
      { error: "Unknown resource", allowed: Object.keys(PUBLIC_ROUTES) },
      { status: 404 },
    );
  }

  try {
    const data = await upstreamFetch(route.path, {
      searchParams: { ...route.query(url.searchParams), lang: "en" },
    });
    return NextResponse.json({ data }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=3600" } });
  } catch (err) {
    const status = err instanceof ApiError && err.status >= 400 && err.status < 600 ? err.status : 502;
    return NextResponse.json({ error: errorMessage(err) }, { status });
  }
}

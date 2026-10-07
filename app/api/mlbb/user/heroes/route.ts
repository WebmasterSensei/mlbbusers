import { NextResponse } from "next/server";
import { ApiError, errorMessage, upstreamFetch } from "@/lib/api";
import { readSession } from "@/lib/auth";

/** Most-played heroes for a season, with win rate and best streak. */
export async function GET(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const url = new URL(request.url);
  const sid = Number(url.searchParams.get("sid"));
  if (!Number.isSafeInteger(sid) || sid <= 0) {
    return NextResponse.json({ error: "A valid `sid` season id is required." }, { status: 400 });
  }

  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? 20) || 20));

  try {
    const data = await upstreamFetch<unknown>("/user/heroes/frequent", {
      token: session.jwt,
      authed: true,
      searchParams: { sid, limit },
    });
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const status = err instanceof ApiError && err.status === 401 ? 401 : 502;
    return NextResponse.json({ error: errorMessage(err) }, { status });
  }
}

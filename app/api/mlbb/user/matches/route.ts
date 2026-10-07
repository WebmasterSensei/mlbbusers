import { NextResponse } from "next/server";
import { ApiError, errorMessage } from "@/lib/api";
import { readSession } from "@/lib/auth";
import { getMatches } from "@/lib/mlbb";

/**
 * Cursor-paginated, normalised match history. `sid` is a season id from
 * `/user/season`; `cursor` is the opaque `nextCursor` from the previous page.
 *
 * Returns the same `MatchPage` shape the server components consume so the client
 * list never has to understand the raw upstream envelope.
 */
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
  const cursor = url.searchParams.get("cursor");

  try {
    const page = await getMatches({ token: session.jwt }, sid, limit, cursor);
    return NextResponse.json({ data: page }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const status = err instanceof ApiError && err.status === 401 ? 401 : 502;
    return NextResponse.json({ error: errorMessage(err) }, { status });
  }
}

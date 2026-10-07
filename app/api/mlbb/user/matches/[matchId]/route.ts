import { NextResponse } from "next/server";
import { ApiError, errorMessage, upstreamFetch } from "@/lib/api";
import { parseMatchId, readSession } from "@/lib/auth";

/** Full battle report for one match — all ten players with their equipment. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> },
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { matchId: raw } = await params;
  const matchId = parseMatchId(raw);
  if (matchId === null) {
    return NextResponse.json({ error: "Invalid match id." }, { status: 400 });
  }

  const url = new URL(request.url);
  const sid = Number(url.searchParams.get("sid"));
  if (!Number.isSafeInteger(sid) || sid <= 0) {
    return NextResponse.json({ error: "A valid `sid` season id is required." }, { status: 400 });
  }

  try {
    const data = await upstreamFetch<unknown>(`/user/matches/${matchId}`, {
      token: session.jwt,
      authed: true,
      searchParams: { sid },
    });
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const status = err instanceof ApiError && err.status === 401 ? 401 : 502;
    return NextResponse.json({ error: errorMessage(err) }, { status });
  }
}

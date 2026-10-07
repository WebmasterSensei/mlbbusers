import { NextResponse } from "next/server";
import { ApiError, errorMessage, upstreamFetch } from "@/lib/api";
import { readSession } from "@/lib/auth";

/**
 * Authenticated player proxy: `?resource=info | stats | season`.
 *
 * The JWT is read from the httpOnly cookie here and never returned to the
 * client, so a compromised bundle cannot exfiltrate another player's session.
 */
const RESOURCES = ["info", "stats", "season"] as const;
type Resource = (typeof RESOURCES)[number];

export async function GET(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json(
      { error: "Not signed in. Verify your ID Card to continue." },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const resource = url.searchParams.get("resource") ?? "info";
  if (!RESOURCES.includes(resource as Resource)) {
    return NextResponse.json({ error: "Unknown resource", allowed: RESOURCES }, { status: 404 });
  }

  try {
    const data = await upstreamFetch<unknown>(`/user/${resource}`, {
      token: session.jwt,
      authed: true,
    });
    return NextResponse.json(
      { data, identity: { roleId: session.roleId, zoneId: session.zoneId } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const status = err instanceof ApiError && err.status === 401 ? 401 : 502;
    return NextResponse.json({ error: errorMessage(err) }, { status });
  }
}

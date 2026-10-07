import { NextResponse } from "next/server";
import { ApiError, errorMessage, upstreamPost } from "@/lib/api";
import { clearSession, writeSession } from "@/lib/auth";
import { clientKey, rateLimit, sweep } from "@/lib/ratelimit";

/**
 * ID Card verification.
 *
 * MLBB has no public account lookup, so signing in mirrors how every real
 * checker works:
 *
 *   1. send-vc — the API mails a 4-digit code into the player's in-game inbox
 *   2. login   — the player types it, we exchange it for a JWT
 *
 * The JWT is stored in an httpOnly cookie and never crosses the client boundary.
 */

const ZONE_RE = /^\d{1,6}$/;
const ROLE_RE = /^\d{1,12}$/;
const VC_RE = /^\d{4}$/;

const LIMITS = { "send-vc": 5, login: 10 } as const;

type Action = keyof typeof LIMITS | "logout";

function fail(message: string, status: number, retryAfter?: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      ...(retryAfter ? { headers: { "Retry-After": String(retryAfter) } } : {}),
    },
  );
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail("Expected a JSON body.", 400);
  }

  const action = String(payload.action ?? "") as Action;

  if (action === "logout") {
    await clearSession();
    return NextResponse.json({ ok: true });
  }

  if (action !== "send-vc" && action !== "login") {
    return fail("Unknown action.", 400);
  }

  const roleIdRaw = String(payload.roleId ?? "");
  const zoneIdRaw = String(payload.zoneId ?? "");

  if (!ROLE_RE.test(roleIdRaw) || !ZONE_RE.test(zoneIdRaw)) {
    return fail("Enter a valid Role ID and Zone ID (digits only).", 400);
  }
  const roleId = Number(roleIdRaw);
  const zoneId = Number(zoneIdRaw);
  if (!Number.isSafeInteger(roleId) || !Number.isSafeInteger(zoneId)) {
    return fail("Enter a valid Role ID and Zone ID (digits only).", 400);
  }

  if (action === "login") {
    const vc = String(payload.vc ?? "").trim();
    if (!VC_RE.test(vc)) {
      return fail("The verification code is 4 digits.", 400);
    }
  }

  sweep();
  const limit = rateLimit(clientKey(request, action), LIMITS[action]);
  if (!limit.ok) {
    return fail("Too many attempts. Wait a moment and try again.", 429, limit.retryAfterSeconds);
  }

  try {
    if (action === "send-vc") {
      await upstreamPost("/user/auth/send-vc", { role_id: roleId, zone_id: zoneId });
      return NextResponse.json({ ok: true, expiresInSeconds: 300 });
    }

    const data = await upstreamPost<{ jwt?: string; token?: string; roleid?: number; zoneid?: number }>(
      "/user/auth/login",
      { role_id: roleId, zone_id: zoneId, vc: Number(String(payload.vc).trim()) },
    );

    const jwt = data?.jwt ?? data?.token ?? null;
    if (!jwt) {
      return fail("The service did not return a session. Try requesting a new code.", 502);
    }

    await writeSession({ jwt, roleId: data?.roleid ?? roleId, zoneId: data?.zoneid ?? zoneId });
    return NextResponse.json({
      ok: true,
      identity: { roleId: data?.roleid ?? roleId, zoneId: data?.zoneid ?? zoneId },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      // Surface upstream validation failures (wrong code, unknown account)
      // verbatim — they are actionable for the user. Upstream reports business
      // errors as HTTP 200, so treat anything non-5xx as a client error.
      const upstreamMessage = err.upstream ? safeMessage(err.upstream) : null;
      const status = err.status === 401 ? 401 : err.status >= 500 ? 502 : 400;
      return fail(upstreamMessage ?? err.message, status);
    }
    return fail(errorMessage(err), 502);
  }
}

/**
 * Upstream errors arrive as JSON envelopes. Prefer a human-readable `message`,
 * and never echo raw upstream payloads verbatim to the client.
 */
function safeMessage(raw: string): string | null {
  try {
    const parsed = JSON.parse(raw) as { message?: unknown; msg?: unknown; details?: unknown };
    const candidate = [parsed.message, parsed.msg, parsed.details].find(
      (v): v is string => typeof v === "string" && v.trim().length > 0,
    );
    if (!candidate) return null;
    return candidate.length > 180 ? `${candidate.slice(0, 177)}…` : candidate;
  } catch {
    return null;
  }
}

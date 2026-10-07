import { cookies } from "next/headers";
import type { PlayerIdentity } from "@/types/mlbb";

/**
 * Session storage for the upstream JWT.
 *
 * The token lives in an httpOnly cookie so it never reaches client JavaScript —
 * all user data is then fetched server-side, where the cookie is readable but
 * the browser is not.
 */

export const SESSION_COOKIE = "mlbb_session";

/** The upstream JWT is long-lived; the browser session lasts 12 hours. */
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

export interface Session extends PlayerIdentity {
  jwt: string;
  /** Epoch millis the session was established. */
  issuedAt: number;
}

function parse(raw: string | undefined): Session | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (
      typeof parsed?.jwt !== "string" ||
      typeof parsed?.roleId !== "number" ||
      typeof parsed?.zoneId !== "number"
    ) {
      return null;
    }
    return {
      jwt: parsed.jwt,
      roleId: parsed.roleId,
      zoneId: parsed.zoneId,
      issuedAt: typeof parsed.issuedAt === "number" ? parsed.issuedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

/** Read the active session. Usable from Server Components (read-only). */
export async function readSession(): Promise<Session | null> {
  const store = await cookies();
  return parse(store.get(SESSION_COOKIE)?.value);
}

/** Cookie options shared by set and clear. */
function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  } as const;
}

/** Only callable from a Route Handler or Server Action. */
export async function writeSession(session: Omit<Session, "issuedAt">): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, JSON.stringify({ ...session, issuedAt: Date.now() }), cookieOptions());
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}

/* ── Route param parsing ────────────────────────────────────── */

const ZONE_RE = /^\d{1,6}$/;
const ROLE_RE = /^\d{1,12}$/;
const MATCH_RE = /^\d{1,20}$/;

export function parseIdentity(zone: string, roleId: string): PlayerIdentity | null {
  if (!ZONE_RE.test(zone) || !ROLE_RE.test(roleId)) return null;
  const z = Number(zone);
  const r = Number(roleId);
  if (!Number.isSafeInteger(z) || !Number.isSafeInteger(r)) return null;
  return { zoneId: z, roleId: r };
}

export function parseMatchId(raw: string): number | null {
  if (!MATCH_RE.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) ? n : null;
}

import { cache } from "react";
import { readSession, type Session } from "@/lib/auth";
import { getProfile } from "@/lib/mlbb";
import { errorMessage } from "@/lib/api";
import type { PlayerProfile } from "@/types/mlbb";

/**
 * Resolves the signed-in player, or explains why it could not.
 *
 * Every authenticated page calls this once. `error` is set when the cookie
 * exists but the upstream session has expired or been revoked, which is
 * different from "not signed in" and deserves a different message.
 */
export const getCurrentPlayer = cache(async (): Promise<{
  session: Session | null;
  profile: PlayerProfile | null;
  error: string | null;
}> => {
  const session = await readSession();
  if (!session) return { session: null, profile: null, error: null };

  try {
    const profile = await getProfile({ token: session.jwt });
    return { session, profile, error: null };
  } catch (err) {
    return { session, profile: null, error: errorMessage(err) };
  }
});

/** Profile lookup that never throws — for chrome that should degrade quietly. */
export const getProfileOrNull = cache(async (): Promise<PlayerProfile | null> => {
  const session = await readSession();
  if (!session) return null;
  try {
    return await getProfile({ token: session.jwt });
  } catch {
    return null;
  }
});

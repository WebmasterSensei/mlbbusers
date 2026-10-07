import type { ReactNode } from "react";
import { getCurrentPlayer } from "@/lib/session";
import { TopPlayerBar } from "@/components/lobby/TopPlayerBar";
import { AmbientBackdrop } from "@/components/site/AmbientBackdrop";

/**
 * Page frame shared by every route: identity bar on top, optional left rail,
 * content below.
 *
 * Resolves the signed-in player once per request and hands the result to the
 * bar. `getCurrentPlayer` is wrapped in React's `cache`, so a page that also
 * needs the profile reuses the same upstream call.
 */
export async function Shell({ children, rail }: { children: ReactNode; rail?: ReactNode }) {
  const { profile, session } = await getCurrentPlayer();

  return (
    <div className="flex min-h-dvh flex-col">
      <AmbientBackdrop />
      <TopPlayerBar profile={profile} identity={session} />
      <div className="flex min-h-0 flex-1">
        {rail ? <aside className="hidden shrink-0 lg:block">{rail}</aside> : null}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Shell } from "@/components/site/Shell";
import { LeftRail } from "@/components/lobby/LeftRail";
import { NotVerified } from "@/components/profile/NotVerified";
import { getCurrentPlayer } from "@/lib/session";

export const metadata: Metadata = {
  title: "Profile · MLBB Stats",
  description: "Rank, career stats and hero usage for a verified Mobile Legends account.",
};

/** No account in the URL — send them to their own profile, or to verify. */
export default async function ProfileIndexPage() {
  const { session, profile } = await getCurrentPlayer();

  if (session && profile) {
    redirect(`/profile/${session.zoneId}/${session.roleId}`);
  }

  return (
    <Shell rail={<LeftRail />}>
      <NotVerified
        title={session ? "Your session expired" : "No profile selected"}
        description={
          session
            ? "The saved session is no longer accepted by the game API. Verify your ID Card again to continue."
            : "Pick which account you want to see. Every profile here belongs to a player who has confirmed they own it."
        }
      />
    </Shell>
  );
}

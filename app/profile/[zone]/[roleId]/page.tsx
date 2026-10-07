import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/site/Shell";
import { LeftRail } from "@/components/lobby/LeftRail";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { CareerPanel } from "@/components/profile/CareerPanel";
import { FrequentHeroesPanel } from "@/components/profile/FrequentHeroesPanel";
import { RecentMatches } from "@/components/matches/RecentMatches";
import { NotVerified } from "@/components/profile/NotVerified";
import { EmptyState } from "@/components/ui/EmptyState";
import { errorMessage } from "@/lib/api";
import {
  getCareerStats,
  getFrequentHeroes,
  getMatches,
  getProfile,
  getSeasonIds,
} from "@/lib/mlbb";
import { getCurrentPlayer } from "@/lib/session";
import { parseIdentity } from "@/lib/auth";
import type { MatchPage } from "@/types/mlbb";
import { LuTriangleAlert } from "react-icons/lu";

export const metadata: Metadata = {
  title: "Profile · MLBB Stats",
  description: "Rank, career stats and hero usage for a verified Mobile Legends account.",
};

/** A settled promise result, so one panel's failure cannot blank its siblings. */
type Settled<T> = T | { err: string };

async function settle<T>(promise: Promise<T>): Promise<Settled<T>> {
  return promise.catch((err: unknown) => ({ err: errorMessage(err) }));
}

/** Stand-in history for a player the API reports no seasons for. */
const NO_MATCHES: MatchPage = { items: [], nextCursor: null, hasNext: false, total: 0 };

/** How many games the profile page shows; the full history lives on /war-records. */
const RECENT_MATCHES = 5;

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ zone: string; roleId: string }>;
}) {
  const { zone, roleId } = await params;
  const identity = parseIdentity(zone, roleId);
  const { session } = await getCurrentPlayer();

  if (!identity) {
    return (
      <Shell rail={<LeftRail />}>
        <NotVerified
          title="That is not a valid ID"
          description="Both the Role ID and the Zone ID must be digits only. Check the numbers under your in-game profile and try again."
        />
      </Shell>
    );
  }

  if (!session || session.roleId !== identity.roleId || session.zoneId !== identity.zoneId) {
    return (
      <Shell rail={<LeftRail />}>
        <NotVerified
          detail={
            session
              ? `This device is currently verified as ${session.roleId} / ${session.zoneId}. Verifying the other account will replace it.`
              : undefined
          }
        />
      </Shell>
    );
  }

  const token = session.jwt;

  const profile = await settle(getProfile({ token }));

  if ("err" in profile) {
    return (
      <Shell rail={<LeftRail />}>
        <div className="px-4 py-16">
          <EmptyState
            tone="error"
            icon={<LuTriangleAlert className="size-5" />}
            title="Could not load this profile"
            description={profile.err}
            action={
              <Link href="/search" className="text-[11px] text-gold-400 hover:underline">
                Verify again
              </Link>
            }
          />
        </div>
      </Shell>
    );
  }

  // Hero usage and match history are both season-scoped upstream, so the season
  // id has to be known before either can be requested. A player the API has no
  // seasons for gets an empty history, not an error.
  const seasonIds = await getSeasonIds({ token }).catch(() => [] as number[]);
  const sid = seasonIds[0] ?? null;

  // Each panel fails independently so one dead upstream endpoint does not blank
  // the whole profile.
  const [stats, heroes, matches] = await Promise.all([
    settle(getCareerStats({ token })),
    settle(sid === null ? Promise.resolve([]) : getFrequentHeroes({ token }, sid)),
    settle(
      sid === null ? Promise.resolve(NO_MATCHES) : getMatches({ token }, sid, RECENT_MATCHES),
    ),
  ]);

  return (
    <Shell rail={<LeftRail />}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8">
        <ProfileHeader profile={profile} />

        {"err" in stats ? (
          <EmptyState
            tone="warn"
            icon={<LuTriangleAlert className="size-5" />}
            title="Career stats unavailable"
            description={`${stats.err} The rest of the profile still loaded.`}
          />
        ) : (
          <CareerPanel stats={stats} identity={identity} />
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {"err" in heroes ? (
            <EmptyState tone="warn" title="Hero usage unavailable" description={heroes.err} />
          ) : (
            <FrequentHeroesPanel heroes={heroes} />
          )}

          {"err" in matches ? (
            <EmptyState tone="warn" title="Match history unavailable" description={matches.err} />
          ) : (
            <RecentMatches page={matches} identity={identity} />
          )}
        </div>
      </div>
    </Shell>
  );
}

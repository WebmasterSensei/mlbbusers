import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/site/Shell";
import { LeftRail } from "@/components/lobby/LeftRail";
import { MatchDetailView } from "@/components/matches/MatchDetailView";
import { NotVerified } from "@/components/profile/NotVerified";
import { EmptyState } from "@/components/ui/EmptyState";
import { errorMessage } from "@/lib/api";
import { parseIdentity, parseMatchId } from "@/lib/auth";
import { getMatchDetail, getSeasonIds } from "@/lib/mlbb";
import { getCurrentPlayer } from "@/lib/session";
import { LuGitBranch, LuTriangleAlert } from "react-icons/lu";

export const metadata: Metadata = {
  title: "Battle Report · MLBB Stats",
  description: "Full scoreboard and equipment for a single Mobile Legends ranked game.",
};

export default async function MatchDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ zone: string; roleId: string; matchId: string }>;
  searchParams: Promise<{ sid?: string }>;
}) {
  const { zone, roleId, matchId: rawMatchId } = await params;
  const identity = parseIdentity(zone, roleId);
  const matchId = parseMatchId(rawMatchId);
  const { session } = await getCurrentPlayer();

  const invalid = (
    <Shell rail={<LeftRail />}>
      <div className="px-4 py-16">
        <EmptyState
          title="That match link is malformed"
          description="A battle report needs a numeric Zone ID, Role ID and match id."
          action={
            <Link href="/war-records" className="text-[11px] text-gold-400 hover:underline">
              Back to war records
            </Link>
          }
        />
      </div>
    </Shell>
  );

  if (!identity || matchId === null) return invalid;

  if (!session || session.roleId !== identity.roleId || session.zoneId !== identity.zoneId) {
    return (
      <Shell rail={<LeftRail />}>
        <NotVerified />
      </Shell>
    );
  }

  const requested = Number((await searchParams).sid);
  let sid = Number.isSafeInteger(requested) && requested > 0 ? requested : null;
  if (sid === null) {
    const seasonIds = await getSeasonIds({ token: session.jwt }).catch(() => [] as number[]);
    sid = seasonIds[0] ?? null;
  }

  let detail;
  try {
    detail = sid === null ? null : await getMatchDetail({ token: session.jwt }, matchId, sid);
  } catch (err) {
    return (
      <Shell rail={<LeftRail />}>
        <div className="px-4 py-16">
          <EmptyState
            tone="error"
            icon={<LuTriangleAlert className="size-5" />}
            title="Could not load this battle report"
            description={errorMessage(err)}
          />
        </div>
      </Shell>
    );
  }

  if (!detail) {
    return (
      <Shell rail={<LeftRail />}>
        <div className="px-4 py-16">
          <EmptyState
            icon={<LuGitBranch className="size-5" />}
            title="Match not found"
            description="The API has no scoreboard for this match id — replays expire over time."
            action={
              <Link href="/war-records" className="text-[11px] text-gold-400 hover:underline">
                Back to war records
              </Link>
            }
          />
        </div>
      </Shell>
    );
  }

  return (
    <Shell rail={<LeftRail />}>
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <nav className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-ink-400">
          <Link href="/war-records" className="hover:text-gold-300">
            War Records
          </Link>
          <span className="mx-2 text-gold-600">/</span>
          <span className="text-ink-300">Match #{detail.matchId}</span>
        </nav>
        <MatchDetailView detail={detail} identity={identity} />
      </div>
    </Shell>
  );
}

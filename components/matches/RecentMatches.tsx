import Link from "next/link";
import { LuHistory } from "react-icons/lu";
import { Panel } from "@/components/ui/Panel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EmptyState } from "@/components/ui/EmptyState";
import { MatchRow } from "@/components/matches/MatchRow";
import type { MatchPage, PlayerIdentity } from "@/types/mlbb";

/**
 * The most recent ranked games, newest first.
 *
 * Each row links through to that game's battle report.
 */
export function RecentMatches({
  page,
  identity,
}: {
  page: MatchPage;
  identity: PlayerIdentity;
}) {
  return (
    <Panel
      title="Recent Matches"
      eyebrow="Ranked"
      action={
        <Link
          href="/war-records"
          className="text-[11px] font-semibold uppercase tracking-widest text-gold-500 hover:text-gold-300"
        >
          All matches
        </Link>
      }
    >
      {page.items.length === 0 ? (
        <EmptyState
          icon={<LuHistory className="size-5" />}
          title="No ranked matches"
          description="The API reports no ranked games for this account in the current season."
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {page.items.map((match) => (
            <li key={`${match.seasonId}-${match.matchId}`}>
              <MatchRow match={match} identity={identity} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 border-t border-gold-500/10 pt-3 text-[11px] leading-relaxed text-ink-400">
        <Eyebrow className="mb-1 inline-block tracking-[0.18em]">Reading this</Eyebrow>
        <br />
        Score is the in-game performance rating, not a win/loss marker — the
        banner on the left carries the result. Times are relative to now.
      </p>
    </Panel>
  );
}

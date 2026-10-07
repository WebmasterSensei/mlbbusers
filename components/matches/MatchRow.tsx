import Link from "next/link";
import Image from "next/image";
import { formatNumber, formatRelativeTime } from "@/lib/labels";
import { cn } from "@/lib/cn";
import type { MatchSummary, PlayerIdentity } from "@/types/mlbb";

/**
 * One ranked game row. Shared by the profile summary and the full
 * `/war-records` history so both read identically.
 */
export function MatchRow({
  match,
  identity,
}: {
  match: MatchSummary;
  identity: PlayerIdentity;
}) {
  const href = `/war-records/${identity.zoneId}/${identity.roleId}/${match.matchId}?sid=${match.seasonId}`;
  const accent =
    match.result === "victory"
      ? "text-victory"
      : match.result === "defeat"
        ? "text-defeat"
        : "text-ink-400";

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 transition"
      aria-label={`${match.result} on ${match.heroName}, ${formatRelativeTime(match.playedAt)}`}
    >
      {/* Result banner — the widest accent on the row, read first. */}
      <span aria-hidden className={cn("h-11 w-1 shrink-0 bg-current", accent)} />

      {match.heroPortrait ? (
        <Image
          src={match.heroPortrait}
          alt=""
          width={44}
          height={44}
          className="size-11 shrink-0 rounded-sm object-cover"
        />
      ) : (
        <span className="size-11 shrink-0 rounded-sm bg-abyss-800" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate font-display text-sm font-semibold text-ink-100 group-hover:text-gold-300">
            {match.heroName}
          </span>
          <span className="shrink-0 text-[11px] tabular-nums text-ink-400">
            {formatRelativeTime(match.playedAt)}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] tabular-nums text-ink-400">
          <span>
            <span className="text-ink-300">{match.kills}</span>
            <span className="mx-0.5 text-ink-400">/</span>
            <span className="text-defeat">{match.deaths}</span>
            <span className="mx-0.5 text-ink-400">/</span>
            <span className="text-ink-300">{match.assists}</span>
          </span>
          <span className="text-gold-600" aria-hidden>
            ·
          </span>
          <span className="truncate">{match.lane}</span>
          <span className="text-gold-600" aria-hidden>
            ·
          </span>
          <span>{formatNumber(Math.round(match.goldPerMinute))} gpm</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        {match.isMvp ? (
          <span className="clip-notch-sm bg-mvp/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-mvp">
            MVP
          </span>
        ) : null}
        <span className={cn("font-display text-sm font-bold tabular-nums", accent)}>
          {formatNumber(Math.round(match.score))}
        </span>
      </div>
    </Link>
  );
}

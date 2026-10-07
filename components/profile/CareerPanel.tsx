import Link from "next/link";
import Image from "next/image";
import { LuCrosshair, LuSkull } from "react-icons/lu";
import { Panel } from "@/components/ui/Panel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatNumber, formatPercent } from "@/lib/labels";
import type { CareerStats, PlayerIdentity, StatHighlight } from "@/types/mlbb";

/**
 * Career summary: the headline numbers, then the record-setting single-game
 * highs. A `null` highlight means the API returned no data for that stat, which
 * happens for players with very few matches — it is shown as "—" rather than 0.
 */
export function CareerPanel({
  stats,
  identity,
}: {
  stats: CareerStats;
  identity: PlayerIdentity;
}) {
  const played = stats.totalCount > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Career" eyebrow="Overall">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Matches" value={formatNumber(stats.totalCount)} />
          <Stat label="Wins" value={formatNumber(stats.winCount)} accent="text-victory" />
          <Stat
            label="Win rate"
            value={played ? formatPercent(stats.winRate) : "—"}
            accent={played ? "text-gold-300" : undefined}
          />
          <Stat label="Avg score" value={played ? formatNumber(Math.round(stats.averageScore)) : "—"} />
          <Stat label="Gold / min" value={played ? formatNumber(Math.round(stats.goldPerMinute)) : "—"} />
          <Stat label="MVPs" value={formatNumber(stats.mvpCount)} accent="text-mvp" />
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-ink-400">
          {stats.winStreak > 0
            ? `Current win streak: ${stats.winStreak} match${stats.winStreak === 1 ? "" : "es"}.`
            : "No active win streak."}{" "}
          {stats.seasonIds.length > 0
            ? `Seen across ${stats.seasonIds.length} season${stats.seasonIds.length === 1 ? "" : "s"}.`
            : "No season data yet."}
        </p>
      </Panel>

      <Panel title="Records" eyebrow="Best single game">
        <div className="grid gap-3 sm:grid-cols-2">
          <Highlight
            icon={<LuCrosshair className="size-3.5" />}
            label="Most kills"
            highlight={stats.highlights.mostKills}
            suffix="kills"
            identity={identity}
          />
          <Highlight
            icon={<LuCrosshair className="size-3.5" />}
            label="Most assists"
            highlight={stats.highlights.mostAssists}
            suffix="assists"
            identity={identity}
          />
          <Highlight
            label="Most damage"
            highlight={stats.highlights.mostDamage}
            suffix="dmg"
            identity={identity}
          />
          <Highlight
            icon={<LuSkull className="size-3.5" />}
            label="Most deaths"
            highlight={stats.highlights.mostDamageTaken}
            suffix="deaths"
            danger
            identity={identity}
          />
          <Highlight
            label="Most gold"
            highlight={stats.highlights.mostGold}
            suffix="gold"
            identity={identity}
          />
          <Highlight
            label="Best GPM"
            highlight={stats.highlights.mostGoldPerMinute}
            suffix="gpm"
            identity={identity}
          />
        </div>

        {!played ? (
          <EmptyState
            className="mt-4"
            icon={<LuCrosshair className="size-5" />}
            title="No ranked history yet"
            description="Records appear once this account has finished enough matches for the API to report them."
          />
        ) : null}
      </Panel>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="clip-notch-sm bg-abyss-950/50 px-3.5 py-3 ring-1 ring-inset ring-gold-500/12">
      <Eyebrow className="tracking-[0.18em]">{label}</Eyebrow>
      <p className={`mt-1 font-display text-xl font-bold tabular-nums ${accent ?? "text-ink-100"}`}>
        {value}
      </p>
    </div>
  );
}

function Highlight({
  icon,
  label,
  highlight,
  suffix,
  danger,
  identity,
}: {
  icon?: React.ReactNode;
  label: string;
  highlight: StatHighlight | null;
  suffix: string;
  danger?: boolean;
  identity: PlayerIdentity;
}) {
  return (
    <div className="clip-notch-sm bg-abyss-950/50 px-3.5 py-3 ring-1 ring-inset ring-gold-500/12">
      <div className="flex items-center gap-1.5">
        {icon}
        <Eyebrow className="tracking-[0.18em]">{label}</Eyebrow>
      </div>

      {highlight ? (
        <>
          <p
            className={`mt-1 font-display text-xl font-bold tabular-nums ${
              danger ? "text-defeat" : "text-ink-100"
            }`}
          >
            {formatNumber(highlight.value)}
            <span className="ml-1 text-[10px] font-medium uppercase tracking-wider text-ink-400">
              {suffix}
            </span>
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            {highlight.heroPortrait ? (
              <Image
                src={highlight.heroPortrait}
                alt=""
                width={20}
                height={20}
                className="size-5 rounded-sm object-cover"
              />
            ) : null}
            <span className="min-w-0 truncate text-[11px] text-ink-300">
              {highlight.heroName ?? "Unknown hero"}
            </span>
            {highlight.matchId ? (
              <Link
                href={`/war-records/${identity.zoneId}/${identity.roleId}/${highlight.matchId}`}
                className="ml-auto shrink-0 text-[10px] text-gold-500 hover:text-gold-300"
                aria-label={`View the match where this record was set`}
              >
                View
              </Link>
            ) : null}
          </div>
        </>
      ) : (
        <p className="mt-1 font-display text-xl font-bold text-ink-400">—</p>
      )}
    </div>
  );
}

import Image from "next/image";
import { Panel } from "@/components/ui/Panel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { formatDateTime, formatNumber } from "@/lib/labels";
import { cn } from "@/lib/cn";
import type { MatchDetail, MatchPlayer, PlayerIdentity } from "@/types/mlbb";

/**
 * Battle report for a single ranked game.
 *
 * Teams are the first and last five players in the payload, which is how the
 * upstream API orders them. The signed-in player is marked so the viewer can
 * find themselves without reading every nickname.
 */
export function MatchDetailView({
  detail,
  identity,
}: {
  detail: MatchDetail;
  identity: PlayerIdentity;
}) {
  const mine =
    detail.players.find(
      (p) => p.roleId === identity.roleId && p.zoneId === identity.zoneId,
    ) ?? detail.players.find((p) => p.heroId === detail.myHeroId);

  const victory = mine?.result === "victory";
  const draw = mine?.result === "draw";

  return (
    <div className="flex flex-col gap-4">
      <Panel padded={false} className="overflow-hidden">
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-4 px-6 py-5",
            victory
              ? "bg-victory/10"
              : draw
                ? "bg-white/5"
                : "bg-defeat/10",
          )}
        >
          <div className="flex items-center gap-4">
            {mine ? (
              <Image
                src={mine.heroPortrait}
                alt=""
                width={64}
                height={64}
                className="clip-notch-sm size-16 object-cover ring-1 ring-white/15"
              />
            ) : null}
            <div>
              <Eyebrow>Ranked · {formatDateTime(detail.playedAt)}</Eyebrow>
              <h1
                className={cn(
                  "mt-1 font-display text-3xl font-black uppercase tracking-tight",
                  victory ? "text-victory" : draw ? "text-ink-200" : "text-defeat",
                )}
              >
                {victory ? "Victory" : draw ? "Draw" : "Defeat"}
              </h1>
              <p className="mt-1 text-xs text-ink-400">
                {mine ? `${mine.heroName} · ` : ""}Match #{detail.matchId} · Season{" "}
                {detail.seasonId}
              </p>
            </div>
          </div>

          {mine ? (
            <dl className="grid grid-cols-3 gap-x-6 gap-y-2 text-center">
              <Stat label="K / D / A" value={`${mine.kills}/${mine.deaths}/${mine.assists}`} />
              <Stat label="Gold / min" value={formatNumber(Math.round(mine.goldPerMinute))} />
              <Stat label="Damage" value={formatNumber(mine.damage)} />
            </dl>
          ) : null}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <TeamPanel title="Team 1" players={detail.players.slice(0, 5)} identity={identity} />
        <TeamPanel title="Team 2" players={detail.players.slice(5)} identity={identity} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">{label}</dt>
      <dd className="font-display text-lg font-bold tabular-nums text-ink-100">{value}</dd>
    </div>
  );
}

function TeamPanel({
  title,
  players,
  identity,
}: {
  title: string;
  players: MatchPlayer[];
  identity: PlayerIdentity;
}) {
  const won = players[0]?.result === "victory";
  return (
    <Panel
      title={title}
      eyebrow={won ? "Winner" : players[0]?.result === "draw" ? "Draw" : "Loser"}
    >
      <ul className="flex flex-col gap-2.5">
        {players.map((p) => {
          const isMe = p.roleId === identity.roleId && p.zoneId === identity.zoneId;
          return (
            <li
              key={`${p.roleId}-${p.zoneId}-${p.heroId}`}
              className={cn(
                "clip-notch-sm flex items-center gap-3 p-2.5 ring-1 ring-inset",
                isMe
                  ? "bg-gold-500/12 ring-gold-400/40"
                  : "glass-subtle ring-white/10",
              )}
            >
              <Image
                src={p.heroPortrait}
                alt=""
                width={40}
                height={40}
                className="size-10 shrink-0 rounded-sm object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-ink-100">
                    {p.nickname || p.heroName}
                  </span>
                  {isMe ? (
                    <span className="rounded-sm bg-gold-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold-200">
                      You
                    </span>
                  ) : null}
                  {p.isMvp ? (
                    <span className="rounded-sm bg-mvp/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-mvp">
                      MVP
                    </span>
                  ) : null}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] tabular-nums text-ink-400">
                  <span>
                    <span className="text-ink-300">{p.kills}</span>/
                    <span className="text-defeat">{p.deaths}</span>/
                    <span className="text-ink-300">{p.assists}</span>
                  </span>
                  <span className="text-gold-600">·</span>
                  <span>{formatNumber(Math.round(p.goldPerMinute))} gpm</span>
                </div>
                {p.items.length > 0 ? (
                  <ul className="mt-1.5 flex flex-wrap gap-1" aria-label="Equipment">
                    {p.items.map((item) => (
                      <li key={item.id} title={item.name}>
                        {item.icon ? (
                          <Image
                            src={item.icon}
                            alt={item.name}
                            width={22}
                            height={22}
                            className="size-[22px] rounded-sm object-cover ring-1 ring-white/10"
                          />
                        ) : (
                          <span className="grid size-[22px] place-items-center rounded-sm bg-abyss-800 text-[8px] text-ink-400">
                            {item.id}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <span className="shrink-0 font-display text-sm font-bold tabular-nums text-ink-200">
                {formatNumber(Math.round(p.score))}
              </span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

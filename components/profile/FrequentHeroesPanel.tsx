import Link from "next/link";
import Image from "next/image";
import { LuSwords } from "react-icons/lu";
import { Panel } from "@/components/ui/Panel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatNumber, formatPercent } from "@/lib/labels";
import { cn } from "@/lib/cn";
import type { FrequentHero } from "@/types/mlbb";

export function FrequentHeroesPanel({ heroes }: { heroes: FrequentHero[] }) {
  const maxGames = Math.max(1, ...heroes.map((h) => h.totalCount));

  return (
    <Panel
      title="Frequent Heroes"
      eyebrow="Last 20 matches"
      action={
        <Link
          href="/heroes"
          className="text-[11px] font-semibold uppercase tracking-widest text-gold-500 hover:text-gold-300"
        >
          Browse all
        </Link>
      }
    >
      {heroes.length === 0 ? (
        <EmptyState
          icon={<LuSwords className="size-5" />}
          title="No hero usage yet"
          description="The API reports no recent picks for this account."
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {heroes.map((hero) => {
            const winRate = hero.totalCount > 0 ? (hero.winCount / hero.totalCount) * 100 : 0;
            return (
              <li key={hero.heroId}>
                <Link
                  href={`/heroes/${hero.heroId}`}
                  className="group flex items-center gap-3 transition"
                >
                  {hero.heroPortrait ? (
                    <Image
                      src={hero.heroPortrait}
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
                        {hero.heroName}
                      </span>
                      <span className="shrink-0 text-[11px] tabular-nums text-ink-400">
                        {formatNumber(hero.winCount)}/{formatNumber(hero.totalCount)}
                      </span>
                    </div>

                    <div className="mt-1.5 h-1.5 w-full overflow-hidden bg-abyss-950">
                      <div
                        className="h-full bg-gradient-to-r from-gold-600 to-gold-400"
                        style={{ width: `${(hero.totalCount / maxGames) * 100}%` }}
                      />
                    </div>
                  </div>

                  <span
                    className={cn(
                      "w-12 shrink-0 text-right text-xs font-semibold tabular-nums",
                      winRate >= 55
                        ? "text-victory"
                        : winRate >= 45
                          ? "text-gold-300"
                          : "text-defeat",
                    )}
                  >
                    {hero.totalCount > 0 ? formatPercent(winRate, 0) : "—"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 border-t border-gold-500/10 pt-3 text-[11px] leading-relaxed text-ink-400">
        <Eyebrow className="mb-1 inline-block tracking-[0.18em]">Reading this</Eyebrow>
        <br />
        Bar length is games played; the number on the right is that hero&apos;s win
        rate. Upstream caps this window at the 20 most recent matches.
      </p>
    </Panel>
  );
}

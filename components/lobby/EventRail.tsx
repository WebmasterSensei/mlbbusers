import Link from "next/link";
import Image from "next/image";
import { LuArrowUpRight } from "react-icons/lu";
import { Panel } from "@/components/ui/Panel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { formatRelativeTime } from "@/lib/labels";
import type { GamePatch } from "@/lib/meta";
import type { HeroRef } from "@/types/mlbb";

/**
 * Right-hand column: a few real heroes to browse, plus the current game patch.
 *
 * Both come from the public API. There is no events or news feed upstream, so
 * this deliberately does not pretend to be one.
 */
export function EventRail({
  featured,
  patches,
}: {
  featured: HeroRef[];
  patches: GamePatch[];
}) {
  return (
    <div className="flex w-full flex-col gap-4 p-4">
      <Panel>
        <Eyebrow>Browse</Eyebrow>
        <h2 className="mt-1 font-display text-sm font-bold uppercase tracking-[0.18em] text-ink-100">
          Featured Heroes
        </h2>

        <ul className="mt-3 flex flex-col gap-2">
          {featured.length === 0 ? (
            <li className="text-xs text-ink-400">Hero list unavailable.</li>
          ) : (
            featured.map((hero) => (
              <li key={hero.id}>
                <Link
                  href={`/heroes/${hero.id}`}
                  className="group flex items-center gap-3 p-1.5 transition hover:bg-gold-500/8"
                >
                  <span className="relative size-12 shrink-0 overflow-hidden bg-abyss-800">
                    {hero.portrait ? (
                      <Image
                        src={hero.portrait}
                        alt=""
                        width={48}
                        height={48}
                        className="size-full object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-sm font-semibold text-ink-100 group-hover:text-gold-300">
                      {hero.name}
                    </span>
                    <span className="block truncate text-[11px] text-ink-400">
                      {hero.lanes.length > 0 ? hero.lanes.join(" / ") : hero.role || "Flexible"}
                    </span>
                  </span>
                  <LuArrowUpRight className="size-4 shrink-0 text-ink-400 transition group-hover:text-gold-400" />
                </Link>
              </li>
            ))
          )}
        </ul>

        <Link
          href="/heroes"
          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-gold-400 hover:text-gold-300"
        >
          All 133 heroes
          <LuArrowUpRight className="size-3.5" />
        </Link>
      </Panel>

      <Panel>
        <Eyebrow>Patch</Eyebrow>
        {patches.length === 0 ? (
          <p className="mt-2 text-xs text-ink-400">Version history unavailable.</p>
        ) : (
          <ol className="mt-2 flex flex-col gap-2">
            {patches.map((patch, i) => (
              <li key={patch.version} className="flex items-baseline justify-between gap-3 text-xs">
                <span className={i === 0 ? "font-semibold text-gold-300" : "text-ink-300"}>
                  v{patch.version}
                </span>
                <span className="shrink-0 text-[11px] text-ink-400">
                  {formatRelativeTime(patch.releasedAt)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </div>
  );
}

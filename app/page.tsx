import { Shell } from "@/components/site/Shell";
import { LeftRail } from "@/components/lobby/LeftRail";
import { BackgroundFx } from "@/components/lobby/BackgroundFx";
import { HeroStage } from "@/components/lobby/HeroStage";
import { ModeDock } from "@/components/lobby/ModeDock";
import { EventRail } from "@/components/lobby/EventRail";
import { QuickLinks } from "@/components/lobby/QuickLinks";
import { getHeroes } from "@/lib/mlbb";
import { getPatches } from "@/lib/meta";
import { getCurrentPlayer } from "@/lib/session";
import { RONE_BASE } from "@/lib/api";

export const revalidate = 3600;

export default async function LobbyPage() {
  // Any single failure degrades the lobby rather than taking it down: the page
  // still renders its chrome, just with the missing panel's fallback state.
  const [heroes, patches, player] = await Promise.all([
    getHeroes().catch(() => []),
    getPatches(4).catch(() => []),
    getCurrentPlayer(),
  ]);

  return (
    <Shell rail={<LeftRail />}>
      <div className="relative flex min-h-[calc(100dvh-4rem)] flex-col">
        <BackgroundFx heroes={heroes} />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col xl:flex-row">
          <div className="flex min-h-[52vh] flex-1 flex-col justify-between">
            <HeroStage heroes={heroes} />
            <div className="px-4 pb-5">
              <ModeDock />
            </div>
          </div>

          <aside className="w-full shrink-0 xl:w-[300px]">
            <EventRail featured={heroes.slice(0, 5)} patches={patches} />
          </aside>
        </div>

        <QuickLinks identity={player.session} />
      </div>

      {/* Honest data-source footer — no fake build number */}
      <footer className="border-t border-gold-500/10 px-4 py-2 text-center text-[10px] uppercase tracking-[0.3em] text-ink-400">
        <a
          href={RONE_BASE}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gold-500"
        >
          Stats via Rone Arena
        </a>
      </footer>
    </Shell>
  );
}

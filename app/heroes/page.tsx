import type { Metadata } from "next";
import { Shell } from "@/components/site/Shell";
import { LeftRail } from "@/components/lobby/LeftRail";
import { HeroGrid } from "@/components/heroes/HeroGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { LuSwords } from "react-icons/lu";
import { getHeroes } from "@/lib/mlbb";

export const metadata: Metadata = {
  title: "Heroes · MLBB Stats",
  description: "Browse the full Mobile Legends: Bang Bang roster with roles and lanes.",
};

export const revalidate = 3600;

export default async function HeroesPage() {
  const heroes = await getHeroes().catch(() => []);

  return (
    <Shell rail={<LeftRail />}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold-500/80">
            Codex
          </p>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-ink-100">
            Heroes
          </h1>
          <p className="text-sm text-ink-400">
            All {heroes.length || 133} heroes, from the public catalog. Role and lane are the
            game&apos;s own classification.
          </p>
        </header>

        {heroes.length === 0 ? (
          <EmptyState
            icon={<LuSwords className="size-5" />}
            title="Hero catalog unavailable"
            description="The game data service could not be reached. Try again in a moment."
          />
        ) : (
          <HeroGrid heroes={heroes} />
        )}
      </div>
    </Shell>
  );
}

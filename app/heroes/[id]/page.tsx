import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shell } from "@/components/site/Shell";
import { LeftRail } from "@/components/lobby/LeftRail";
import { HeroDetail } from "@/components/heroes/HeroDetail";
import { EmptyState } from "@/components/ui/EmptyState";
import { getHero, getHeroIndex } from "@/lib/mlbb";
import { LuSwords } from "react-icons/lu";
import type { HeroRef } from "@/types/mlbb";

export const revalidate = 3600;

function parseHeroId(raw: string): number | null {
  if (!/^\d{1,12}$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const id = parseHeroId((await params).id);
  if (id === null) return { title: "Hero · MLBB Stats" };
  const hero = await getHero(id).catch(() => null);
  return {
    title: hero ? `${hero.name} · MLBB Stats` : "Hero · MLBB Stats",
    description: hero ? `${hero.name} skills, stats, counters and synergies.` : undefined,
  };
}

export default async function HeroPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseHeroId((await params).id);
  if (id === null) notFound();

  const [hero, index] = await Promise.all([
    getHero(id).catch(() => null),
    getHeroIndex().catch(() => new Map<number, HeroRef>()),
  ]);

  if (!hero) {
    return (
      <Shell rail={<LeftRail />}>
        <div className="px-4 py-16">
          <EmptyState
            tone="error"
            icon={<LuSwords className="size-5" />}
            title="Hero not found"
            description="The game API has no hero with that id."
            action={
              <Link href="/heroes" className="text-[11px] text-gold-400 hover:underline">
                Back to all heroes
              </Link>
            }
          />
        </div>
      </Shell>
    );
  }

  const resolve = (ids: number[]): HeroRef[] =>
    ids.map((hid) => index.get(hid)).filter((h): h is HeroRef => Boolean(h));

  const relations = {
    strong: { desc: hero.relations.strong.desc, heroes: resolve(hero.relations.strong.heroIds) },
    weak: { desc: hero.relations.weak.desc, heroes: resolve(hero.relations.weak.heroIds) },
    assist: { desc: hero.relations.assist.desc, heroes: resolve(hero.relations.assist.heroIds) },
  };

  return (
    <Shell rail={<LeftRail />}>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <nav className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-ink-400">
          <Link href="/heroes" className="hover:text-gold-300">
            Heroes
          </Link>
          <span className="mx-2 text-gold-600">/</span>
          <span className="text-ink-300">{hero.name}</span>
        </nav>
        <HeroDetail hero={hero} relations={relations} />
      </div>
    </Shell>
  );
}

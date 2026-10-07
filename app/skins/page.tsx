import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/site/Shell";
import { LeftRail } from "@/components/lobby/LeftRail";
import { EmptyState } from "@/components/ui/EmptyState";
import { LuSparkles } from "react-icons/lu";

export const metadata: Metadata = {
  title: "Skins · MLBB Stats",
  description: "Skin catalog for Mobile Legends: Bang Bang.",
};

export default function SkinsPage() {
  return (
    <Shell rail={<LeftRail />}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold-500/80">
            Collection
          </p>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-ink-100">
            Skins
          </h1>
        </header>

        <EmptyState
          icon={<LuSparkles className="size-5" />}
          title="Skin catalog is not wired up yet"
          description="The upstream API we rely on exposes hero data but not the skin catalog, so there is nothing honest to show here yet. Hero portraits and abilities are available on the heroes page in the meantime."
          action={
            <Link href="/heroes" className="text-[11px] text-gold-400 hover:underline">
              Browse heroes
            </Link>
          }
        />
      </div>
    </Shell>
  );
}

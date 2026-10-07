"use client";

import GridMotion from "@/components/bits/GridMotion";
import type { HeroRef } from "@/types/mlbb";

/**
 * Ambient lobby backdrop: a drifting grid of hero portraits behind a heavy
 * vignette.
 *
 * Decorative only — it is `aria-hidden`, ignores pointer events, and its
 * motion is already gated on `prefers-reduced-motion` by the global stylesheet.
 */
export function BackgroundFx({ heroes }: { heroes: HeroRef[] }) {
  const tiles = heroes.slice(0, 28).map((h) => h.painting || h.portrait).filter(Boolean);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(130%_85%_at_50%_-15%,#16233f_0%,#070c17_55%,#02040a_100%)]" />
      {tiles.length > 0 ? (
        <div className="absolute inset-0 opacity-[0.14] saturate-50">
          <GridMotion items={tiles} gradientColor="#eab839" rows={4} columns={7} />
        </div>
      ) : null}
      <div className="vignette absolute inset-0" />
      {/* Warm floor glow beneath the stage */}
      <div className="absolute -bottom-48 left-1/2 h-96 w-[75%] -translate-x-1/2 rounded-full bg-gold-600/10 blur-[130px]" />
      {/* Horizon line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/35 to-transparent" />
    </div>
  );
}

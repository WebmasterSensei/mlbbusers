"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import SplitText from "@/components/bits/SplitText";
import ElectricBorder from "@/components/bits/ElectricBorder";
import GlareHover from "@/components/bits/GlareHover";
import { LuChevronLeft, LuChevronRight, LuPlay, LuTriangleAlert } from "react-icons/lu";
import { cn } from "@/lib/cn";
import type { HeroRef } from "@/types/mlbb";

/**
 * The lobby centrepiece: a rotating hero showcase with a title reveal.
 *
 * The rotation is a manual carousel rather than an autoplayer — the lobby is a
 * navigation surface, and an animation that keeps moving under a keyboard
 * user's focus is hostile. Dot buttons and arrow keys both drive it.
 * 
 * 
 */


export function HeroStage({ heroes }: { heroes: HeroRef[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const featured = heroes.slice(0, 6);
  const current = featured[active] ?? null;

  useGSAP(
    () => {
      if (!stageRef.current) return;
      gsap.from("[data-stage-in]", {
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
      });
    },
    { scope: stageRef },
  );

  // Cross-fade the art when the selection changes.
  useGSAP(
    () => {
      gsap.fromTo(
        "[data-hero-art]",
        { opacity: 0, scale: 1.06, yPercent: 4 },
        { opacity: 1, scale: 1, yPercent: 0, duration: 0.7, ease: "power2.out" },
      );
    },
    { scope: stageRef, dependencies: [active] },
  );

  const go = (dir: 1 | -1) => {
    if (featured.length === 0) return;
    setActive((i) => (i + dir + featured.length) % featured.length);
  };

  if (!current) {
    return (
      <div className="grid min-h-[46vh] place-items-center">
        <p className="max-w-sm text-center text-sm text-ink-400">
         {JSON.stringify(heroes)}
        </p>
      </div>
    );
  }

  return (
    <div ref={stageRef} className="relative flex h-full flex-col justify-end pb-6 pt-4">
      {/* Art */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(75%_60%_at_50%_100%,rgba(26,43,74,0.55),rgba(5,8,15,0.7)_70%)]" />
        {current.painting || current.portrait ? (
          <Image
            key={current.id}
            data-hero-art
            src={current.painting || current.portrait}
            alt={current.name}
            fill
            priority={active === 0}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-contain object-bottom opacity-45 [mask-image:linear-gradient(to_top,black_35%,transparent_92%)]"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-abyss-1000 via-abyss-1000/35 to-transparent" />
      </div>

      {/* Copy */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-4 text-center">
        <p data-stage-in className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.45em] text-gold-500">
          <span className="h-px w-8 bg-gold-600/60" />
          Land of Dawn
          <span className="h-px w-8 bg-gold-600/60" />
        </p>

        <SplitText
          tag="h1"
          text={current.name}
          className="text-gold-gradient font-display text-5xl font-black uppercase tracking-tight sm:text-6xl lg:text-7xl"
          splitType="chars"
          from={{ opacity: 0, y: 60, rotateX: -70 }}
          to={{ opacity: 1, y: 0, rotateX: 0 }}
          duration={0.9}
          ease="power4.out"
        />

        <p data-stage-in className="max-w-md text-sm text-ink-300">
          {current.role === "All" || !current.role ? "Flexible role" : current.role}
          {current.lanes.length > 0 ? ` · ${current.lanes.join(" / ")}` : ""}
        </p>

        <div data-stage-in className="mt-2 flex flex-col items-center gap-3">
          <ElectricBorder color="#eab839" speed={1.6} chaos={0.08} borderRadius={2} className="w-56">
            <GlareHover
              width="100%"
              height="100%"
              background="transparent"
              borderRadius="0"
              borderColor="transparent"
              glareColor="#fff3d0"
              glareOpacity={0.35}
              className="w-full"
            >
              <Link
                href={`/heroes/${current.id}`}
                className="clip-blade flex w-full items-center justify-center gap-2.5 bg-gradient-to-b from-gold-400 to-gold-600 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-abyss-1000 transition hover:from-gold-300 hover:to-gold-500"
              >
                <LuPlay className="size-4 fill-current" />
                View Hero
              </Link>
            </GlareHover>
          </ElectricBorder>

          <p className="flex items-center gap-1.5 text-[11px] text-ink-400">
            <LuTriangleAlert className="size-3.5 text-gold-600" />
            Matchmaking needs the official client — this site is a stats browser.
          </p>
        </div>

        {/* Selector */}
        {featured.length > 1 ? (
          <div data-stage-in className="mt-1 flex items-center gap-3">
            <ArrowButton onClick={() => go(-1)} label="Previous hero">
              <LuChevronLeft className="size-4" />
            </ArrowButton>
            <ul className="flex items-center gap-2">
              {featured.map((hero, i) => (
                <li key={hero.id}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show ${hero.name}`}
                    aria-current={i === active}
                    className={cn(
                      "h-1.5 transition-all duration-300",
                      i === active ? "w-7 bg-gold-400 shadow-[0_0_10px_rgb(232_184_57/0.8)]" : "w-1.5 bg-ink-400/50 hover:bg-gold-600",
                    )}
                  />
                </li>
              ))}
            </ul>
            <ArrowButton onClick={() => go(1)} label="Next hero">
              <LuChevronRight className="size-4" />
            </ArrowButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ArrowButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-7 place-items-center border border-gold-500/25 text-ink-300 transition hover:border-gold-400/60 hover:text-gold-300"
    >
      {children}
    </button>
  );
}

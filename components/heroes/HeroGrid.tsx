"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { LuSearch, LuSwords } from "react-icons/lu";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import type { HeroRef } from "@/types/mlbb";

/**
 * Client-side roster browser.
 *
 * The full catalog is small and already cached server-side, so filtering is done
 * locally — no request per keystroke.
 */
export function HeroGrid({ heroes }: { heroes: HeroRef[] }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<string>("All");

  const roles = useMemo(() => {
    const set = new Set<string>();
    for (const h of heroes) if (h.role) set.add(h.role);
    return ["All", ...[...set].sort()];
  }, [heroes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return heroes.filter((h) => {
      if (role !== "All" && h.role !== role) return false;
      if (!q) return true;
      return (
        h.name.toLowerCase().includes(q) ||
        h.role.toLowerCase().includes(q) ||
        h.lanes.some((lane) => lane.toLowerCase().includes(q))
      );
    });
  }, [heroes, query, role]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <label className="clip-notch-sm flex items-center gap-2.5 glass px-4 py-2.5 ring-1 ring-inset ring-white/15 focus-within:ring-gold-400/60">
          <LuSearch className="size-4 shrink-0 text-gold-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search heroes, roles or lanes"
            className="w-full bg-transparent text-sm text-ink-100 outline-none placeholder:text-ink-400"
          />
        </label>

        {roles.length > 1 ? (
          <ul className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <li key={r}>
                <button
                  type="button"
                  onClick={() => setRole(r)}
                  aria-pressed={role === r}
                  className={cn(
                    "clip-notch-sm px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition",
                    role === r
                      ? "bg-gold-500/20 text-gold-200 ring-1 ring-inset ring-gold-400/50"
                      : "glass-subtle text-ink-300 ring-1 ring-inset ring-white/10 hover:text-ink-100",
                  )}
                >
                  {r}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<LuSwords className="size-5" />}
          title="No heroes match"
          description="Try a different name, role or lane."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {filtered.map((hero) => (
            <li key={hero.id}>
              <Link
                href={`/heroes/${hero.id}`}
                className="group flex flex-col gap-2"
              >
                <span className="clip-notch-sm relative block aspect-square overflow-hidden glass-subtle ring-1 ring-inset ring-white/10 transition group-hover:ring-gold-400/50">
                  {hero.portrait ? (
                    <Image
                      src={hero.portrait}
                      alt={hero.name}
                      fill
                      sizes="(max-width: 640px) 45vw, 15vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="grid size-full place-items-center bg-abyss-800 text-ink-400">
                      <LuSwords className="size-6" />
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-sm font-semibold text-ink-100 group-hover:text-gold-300">
                    {hero.name}
                  </span>
                  <span className="block truncate text-[11px] text-ink-400">
                    {hero.lanes.length > 0 ? hero.lanes.join(" / ") : hero.role || "Flexible"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

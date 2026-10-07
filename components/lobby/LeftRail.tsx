"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { RAIL_NAV } from "@/components/lobby/nav-config";

/**
 * Vertical icon rail, MLBB's left-hand navigation column.
 *
 * Items that need a verified ID Card still link through — the destination page
 * explains what is missing rather than dead-ending here.
 */
export function LeftRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Sections"
      className="glass-strong sticky top-16 flex h-[calc(100dvh-4rem)] w-[68px] flex-col items-center gap-1 border-r border-white/10 py-4"
    >
      {RAIL_NAV.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            href={item.href}
            title={item.label}
            className={cn(
              "group relative grid size-12 place-items-center transition-colors",
              active ? "text-gold-300" : "text-ink-400 hover:text-ink-100",
            )}
          >
            {active ? (
              <span
                aria-hidden
                className="absolute inset-y-1 left-0 w-[3px] bg-gold-400 shadow-[0_0_12px_rgb(232_184_57/0.8)]"
              />
            ) : null}
            <span
              aria-hidden
              className={cn(
                "clip-notch-sm grid size-11 place-items-center transition",
                active ? "bg-gold-500/15" : "group-hover:bg-gold-500/8",
              )}
            >
              <Icon className="size-5" />
            </span>
            <span className="sr-only">{item.label}</span>
          </Link>
        );
      })}

      <span aria-hidden className="mt-auto font-display text-[9px] tracking-[0.3em] text-gold-700">
        DAWN
      </span>
    </nav>
  );
}

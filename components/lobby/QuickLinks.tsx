import Link from "next/link";
import { cn } from "@/lib/cn";
import { PRIMARY_NAV } from "@/components/lobby/nav-config";
import type { PlayerIdentity } from "@/types/mlbb";

/**
 * Lobby footer strip — MLBB's friends row, repurposed.
 *
 * The public API has no friends or social graph, so instead of fake friends it
 * carries the primary navigation. When a player is verified the authenticated
 * entries point straight at their own profile and match history.
 */
export function QuickLinks({ identity }: { identity: PlayerIdentity | null }) {
  const href = (href: string, requiresAuth: boolean) =>
    requiresAuth && identity ? `/profile/${identity.zoneId}/${identity.roleId}` : href;

  return (
    <div className="glass-strong border-t border-white/10 px-4 py-3">
      <ul className="flex items-center gap-2 overflow-x-auto">
        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id} className="shrink-0">
              <Link
                href={href(item.href, item.requiresAuth)}
                className={cn(
                  "clip-notch-sm flex items-center gap-2 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider transition",
                  item.unavailable
                    ? "text-ink-400 hover:text-ink-200"
                    : "text-ink-300 hover:bg-gold-500/10 hover:text-gold-300",
                )}
              >
                <Icon className={cn("size-4", item.unavailable ? "text-ink-400" : "text-gold-500")} />
                {item.label}
                {item.unavailable ? (
                  <span className="rounded-sm bg-abyss-700 px-1 py-px text-[9px] tracking-normal text-ink-400">
                    n/a
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

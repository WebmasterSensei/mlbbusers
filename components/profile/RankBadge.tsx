import Image from "next/image";
import { cn } from "@/lib/cn";
import { BIG_RANK_COLOR } from "@/lib/labels";
import type { RankTier } from "@/types/mlbb";

/**
 * Rank emblem. Upstream supplies a per-tier icon; when it is missing (or the
 * rank is off-ladder) a coloured hex with the tier initials stands in.
 */
export function RankBadge({
  rank,
  size = 64,
  className,
  showStars = true,
}: {
  rank: RankTier | null;
  size?: number;
  className?: string;
  showStars?: boolean;
}) {
  if (!rank) {
    return (
      <span
        className={cn("clip-hex grid place-items-center bg-abyss-800 text-ink-400", className)}
        style={{ width: size, height: size }}
        title="Unranked"
      >
        <span className="text-[10px] font-bold tracking-widest">—</span>
      </span>
    );
  }

  const color = BIG_RANK_COLOR[rank.bigrank] ?? "#94a3b8";

  return (
    <span className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      {rank.icon ? (
        <Image
          src={rank.icon}
          alt={rank.label}
          width={size}
          height={size}
          className="size-full object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
        />
      ) : (
        <span
          className="clip-hex grid size-full place-items-center"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${color}55, #0b1220 75%)`,
            boxShadow: `inset 0 0 0 1px ${color}88`,
          }}
        >
          <span className="text-[9px] font-bold tracking-tight" style={{ color }}>
            {rank.shortLabel}
          </span>
        </span>
      )}
      {showStars ? (
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 120%, ${color}40, transparent 60%)`,
          }}
        />
      ) : null}
    </span>
  );
}

/** Small inline rank chip, e.g. next to a nickname in a match row. */
export function RankChip({ rank, className }: { rank: RankTier | null; className?: string }) {
  const color = rank ? (BIG_RANK_COLOR[rank.bigrank] ?? "#94a3b8") : "#64748b";
  return (
    <span
      className={cn(
        "clip-notch-sm inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        className,
      )}
      style={{ background: `${color}1a`, color, boxShadow: `inset 0 0 0 1px ${color}44` }}
    >
      {rank?.shortLabel ?? "Unranked"}
    </span>
  );
}

import type { Lane, RoleMeta } from "@/types/mlbb";

/**
 * English labels for upstream numeric codes.
 *
 * The `lang=en` parameter only localises *some* fields — `roadsortlabel` and
 * `sortlabel` come back in English, but the rank table's `bigrank_name` /
 * `minrank_name` stay Chinese. So rank naming is resolved locally.
 */

/** `bigrank` 1–7 as returned by `/api/academy/ranks`. */
export const BIG_RANKS = [
  "Warrior",
  "Elite",
  "Master",
  "Grandmaster",
  "Epic",
  "Legend",
  "Mythic",
] as const;

export function bigRankName(bigrank: number): string {
  return BIG_RANKS[bigrank - 1] ?? "Unranked";
}

/** Accent colour per big rank, used for badges and win-rate bars. */
export const BIG_RANK_COLOR: Record<number, string> = {
  1: "#9ca3af",
  2: "#4ade80",
  3: "#38bdf8",
  4: "#a78bfa",
  5: "#f472b6",
  6: "#fbbf24",
  7: "#fb7185",
};

/**
 * Mythic has no Roman numerals — MLBB uses four named tiers. Star ranges
 * mirror the upstream `rankid_start` / `rankid_end` values.
 */
export const MYTHIC_TIERS = [
  { name: "Mythic", short: "MYT", min: 136, max: 160 },
  { name: "Mythic Honor", short: "HON", min: 161, max: 185 },
  { name: "Mythic Glory", short: "GLO", min: 186, max: 235 },
  { name: "Mythic Immortal", short: "IMM", min: 236, max: 9999 },
] as const;

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"] as const;

/**
 * The star range a `rank_level` falls into, per big rank. Mirrors upstream
 * `rankid_start`/`rankid_end` exactly.
 */
const TIER_STAR_RANGES: Record<number, [number, number][]> = {
  1: [
    [1, 4],
    [5, 7],
    [8, 10],
  ],
  2: [
    [11, 15],
    [16, 20],
    [21, 25],
  ],
  3: [
    [26, 30],
    [31, 35],
    [36, 40],
    [41, 45],
  ],
  4: [
    [46, 51],
    [52, 57],
    [58, 63],
    [64, 69],
    [70, 75],
  ],
  5: [
    [76, 81],
    [82, 87],
    [88, 93],
    [94, 99],
    [100, 105],
  ],
  6: [
    [106, 111],
    [112, 117],
    [118, 123],
    [124, 129],
    [130, 135],
  ],
};

export interface RankCode {
  bigrank: number;
  tier: number;
  stars: number;
}

/**
 * Decode a raw `rank_level` integer into a big rank + sub-tier.
 *
 * `rankLevel` is the primary key across the whole ladder (1 → Immortal), which
 * is what `/api/user/info` returns. Unrecognised values degrade to tier 1 of
 * the inferred big rank rather than throwing.
 */
export function decodeRank(rankLevel: number | null | undefined): RankCode | null {
  if (typeof rankLevel !== "number" || !Number.isFinite(rankLevel) || rankLevel <= 0) {
    return null;
  }

  if (rankLevel >= 136) {
    const idx = MYTHIC_TIERS.findIndex((t) => rankLevel >= t.min && rankLevel <= t.max);
    return {
      bigrank: 7,
      tier: (idx === -1 ? 0 : idx) + 1,
      stars: rankLevel,
    };
  }

  for (const [bigrank, ranges] of Object.entries(TIER_STAR_RANGES)) {
    const b = Number(bigrank);
    const idx = ranges.findIndex(([min, max]) => rankLevel >= min && rankLevel <= max);
    if (idx !== -1) {
      return { bigrank: b, tier: idx + 1, stars: rankLevel };
    }
  }

  return { bigrank: 1, tier: 1, stars: rankLevel };
}

/** "Legend III", "Mythic Glory" — the display string for a decoded rank. */
export function formatRank(code: RankCode | null | undefined): string {
  if (!code) return "Unranked";
  if (code.bigrank === 7) {
    const mythic = MYTHIC_TIERS[Math.min(code.tier - 1, MYTHIC_TIERS.length - 1)];
    return mythic.name;
  }
  const roman = ROMAN[Math.max(1, TIER_STAR_RANGES[code.bigrank]?.length - code.tier + 1)] ?? "I";
  return `${bigRankName(code.bigrank)} ${roman}`;
}

/* ── Lanes & roles ──────────────────────────────────────────── */

/**
 * Upstream `roadsortlabel` is already English when `lang=en`, but a few heroes
 * emit empty strings — this normalises the blanks and the known variants.
 */
const LANE_ALIASES: Record<string, Lane> = {
  "gold lane": "Gold Lane",
  gold: "Gold Lane",
  "exp lane": "EXP Lane",
  exp: "EXP Lane",
  "side lane": "Side Lane",
  "mid lane": "Mid Lane",
  middle: "Mid Lane",
  jungling: "Jungling",
  jungle: "Jungling",
  // `/heroes/positions` emits "Roam" (verified against live data), not "Roaming".
  roam: "Roaming",
  roaming: "Roaming",
};

export function normalizeLane(raw: string | null | undefined): string {
  if (!raw) return "Unknown";
  return LANE_ALIASES[raw.trim().toLowerCase()] ?? raw.trim();
}

export const LANES: Lane[] = [
  "Gold Lane",
  "EXP Lane",
  "Mid Lane",
  "Side Lane",
  "Jungling",
  "Roaming",
];

export const ROLES: RoleMeta[] = [
  { name: "Tank", icon: "" },
  { name: "Assassin", icon: "" },
  { name: "Mage", icon: "" },
  { name: "Fighter", icon: "" },
  { name: "Support", icon: "" },
  { name: "Marksman", icon: "" },
];

/* ── Result decoding ─────────────────────────────────────────── */

/**
 * `/user/matches` returns `res` as an integer whose exact encoding upstream
 * never documents. MLBB's battle report uses 1 = win / 2 = loss, but a 0 is
 * also emitted for abandoned games. Anything outside 1/2 is reported as a draw
 * rather than silently guessed.
 */
export function decodeResult(res: number | null | undefined): "victory" | "defeat" | "draw" {
  if (res === 1) return "victory";
  if (res === 2) return "defeat";
  return "draw";
}

/* ── Misc ───────────────────────────────────────────────────── */

/** `s` in a match summary is the in-game match score (performance rating). */
export function formatNumber(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US");
}

export function formatPercent(n: number | null | undefined, digits = 1): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return `${n.toFixed(digits)}%`;
}

export function formatDuration(minutes: number): string {
  if (!minutes || minutes < 1) return "—";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatRelativeTime(epochMs: number | null | undefined, now = Date.now()): string {
  if (!epochMs || epochMs <= 0) return "Unknown";
  const diff = Math.max(0, now - epochMs);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function formatDateTime(epochMs: number | null | undefined): string {
  if (!epochMs || epochMs <= 0) return "Unknown time";
  return new Date(epochMs).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

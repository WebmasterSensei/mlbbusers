/**
 * Domain types for the MLBB data layer.
 *
 * The upstream (Rone Arena / arena.rone.dev) speaks in terse numeric codes and
 * Chinese-language `caption` fields. Everything here is the *normalised* shape
 * the UI consumes — see `lib/mlbb.ts` for the raw → normalised mapping.
 */

/* ── Public catalog ─────────────────────────────────────────── */

export type HeroRole =
  | "Tank"
  | "Assassin"
  | "Mage"
  | "Fighter"
  | "Support"
  | "Marksman"
  | "All";

export type Lane =
  | "Gold Lane"
  | "EXP Lane"
  | "Mid Lane"
  | "Side Lane"
  | "Jungling"
  | "Roaming";

export interface HeroSkill {
  name: string;
  desc: string;
  icon: string | null;
  tags: string[];
}

/**
 * Lightweight hero record used by lists, match rows and the lobby stage.
 *
 * Assembled by joining `/heroes` + `/heroes/positions` +
 * `/academy/heroes/catalog` on `hero_id` — see `getHeroIndex` in `lib/mlbb.ts`.
 */
export interface HeroRef {
  id: number;
  name: string;
  /** Square avatar, safe to use in dense lists. */
  portrait: string;
  /** Full-body character art. Often empty for some ids. */
  painting: string;
  /** Small map icon. */
  smallmap: string;
  role: string;
  lanes: string[];
}

export interface Hero {
  id: number;
  name: string;
  story: string;
  specialties: string[];
  role: string;
  lanes: string[];
  difficulty: number;
  /** Square portrait — the lobby card face. */
  portrait: string;
  /** Wide character art — lobby backdrop / detail hero. */
  painting: string;
  smallmap: string;
  loreUrl: string | null;
  skills: HeroSkill[];
  relations: {
    strong: { desc: string; heroIds: number[] };
    weak: { desc: string; heroIds: number[] };
    assist: { desc: string; heroIds: number[] };
  };
  stats: {
    winRate: number | null;
    battleWinRate: number | null;
    pickRate: number | null;
    banRate: number | null;
  };
}

export interface RankTier {
  /** 1–7: Warrior → Mythic. */
  bigrank: number;
  /** 1–25+ sub-tier within the big rank. */
  tier: number;
  label: string;
  shortLabel: string;
  icon: string;
  minStars: number;
  maxStars: number;
}

export interface RoleMeta {
  name: string;
  icon: string;
}

/* ── Session / auth ─────────────────────────────────────────── */

export interface PlayerIdentity {
  roleId: number;
  zoneId: number;
}

export interface PlayerProfile extends PlayerIdentity {
  name: string;
  avatar: string;
  level: number;
  rankLevel: number | null;
  historyRankLevel: number | null;
  currentRank: RankTier | null;
  highestRank: RankTier | null;
  country: string | null;
}

/* ── Career stats ───────────────────────────────────────────── */

export interface StatHighlight {
  value: number;
  at: number;
  heroId: number | null;
  heroName: string | null;
  heroPortrait: string | null;
  matchId: number | null;
  seasonId: number | null;
}

export interface CareerStats {
  winCount: number;
  totalCount: number;
  winRate: number;
  averageScore: number;
  goldPerMinute: number;
  mvpCount: number;
  winStreak: number;
  highlights: {
    mostKills: StatHighlight | null;
    mostAssists: StatHighlight | null;
    mostGold: StatHighlight | null;
    mostDamage: StatHighlight | null;
    mostDamageTaken: StatHighlight | null;
    mostGoldPerMinute: StatHighlight | null;
    mostMinions: StatHighlight | null;
  };
  seasonIds: number[];
}

/* ── Matches ────────────────────────────────────────────────── */

export type MatchResult = "victory" | "defeat" | "draw";

export interface MatchSummary {
  matchId: number;
  seasonId: number;
  heroId: number;
  heroName: string;
  heroPortrait: string;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
  lane: string;
  goldPerMinute: number;
  isMvp: boolean;
  result: MatchResult;
  /** Epoch millis. */
  playedAt: number;
}

export interface MatchPage {
  items: MatchSummary[];
  nextCursor: string | null;
  hasNext: boolean;
  total: number;
}

export interface MatchEquipment {
  id: number;
  name: string;
  icon: string | null;
}

export interface MatchPlayer {
  heroId: number;
  heroName: string;
  heroPortrait: string;
  nickname: string;
  roleId: number;
  zoneId: number;
  kills: number;
  deaths: number;
  assists: number;
  goldPerMinute: number;
  damage: number;
  score: number;
  rating: number;
  result: MatchResult;
  isMvp: boolean;
  items: MatchEquipment[];
}

export interface MatchDetail {
  matchId: number;
  seasonId: number;
  playedAt: number;
  myHeroId: number;
  players: MatchPlayer[];
}

/* ── Frequent heroes ────────────────────────────────────────── */

export interface FrequentHero {
  heroId: number;
  heroName: string;
  heroPortrait: string;
  totalCount: number;
  winCount: number;
  winRate: number;
  bestStreak: number;
  matchRank: number;
}

/* ── UI state ───────────────────────────────────────────────── */

export type SearchPhase = "idle" | "sending" | "awaiting-code" | "verifying" | "done" | "error";

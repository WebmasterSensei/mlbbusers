import { cache } from "react";
import { upstreamFetch } from "@/lib/api";
import {
  BIG_RANK_COLOR,
  bigRankName,
  decodeRank,
  decodeResult,
  normalizeLane,
  type RankCode,
} from "@/lib/labels";
import type {
  CareerStats,
  FrequentHero,
  Hero,
  HeroRef,
  HeroSkill,
  MatchDetail,
  MatchEquipment,
  MatchPage,
  MatchPlayer,
  MatchSummary,
  PlayerProfile,
  RankTier,
  RoleMeta,
  StatHighlight,
} from "@/types/mlbb";

/* ─────────────────────────────────────────────────────────────
   Raw upstream shapes.
   Upstream nests everything under `records[].data` and mixes
   strings with empty strings, so every read here is defensive.
   ───────────────────────────────────────────────────────────── */

type Rec = Record<string, unknown>;

const asRec = (v: unknown): Rec => (v && typeof v === "object" ? (v as Rec) : {});
const arr = <T = unknown>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" && v.trim() ? v.trim() : fallback;
const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};
const first = (v: unknown): unknown => arr(v)[0];

interface RecordList {
  records: Rec[];
  total: number;
}

async function list(path: string, searchParams: Record<string, string | number> = {}): Promise<RecordList> {
  const data = await upstreamFetch<{ records?: Rec[]; total?: number }>(path, {
    searchParams: { ...searchParams, lang: "en" },
  });
  const records = arr<Rec>(data?.records);
  return { records, total: num(data?.total) ?? records.length };
}

/* ─────────────────────────────────────────────────────────────
   Hero index
   ───────────────────────────────────────────────────────────── */

/* `HeroRef` lives in `types/mlbb.ts` so client components can import the shape
   without pulling in this server-only module. Re-exported here for convenience. */
export type { HeroRef } from "@/types/mlbb";

const roleTitle = (node: unknown): string => {
  const d = asRec(asRec(node).data);
  const t = str(d.sort_title);
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
};

const laneTitle = (node: unknown): string => normalizeLane(str(asRec(asRec(node).data).road_sort_title));

/**
 * `sortid` / `roadsort` are sparse: many heroes carry empty-string placeholders
 * rather than omitting the entry, and every list also has a trailing blank.
 * Dropping them before mapping keeps "Unknown" out of the UI.
 */
const titles = (list: unknown, title: (node: unknown) => string): string[] => {
  const out = arr(list)
    .map((node) => title(node))
    .filter((t) => t && t !== "Unknown");
  return [...new Set(out)];
};

/**
 * The public hero catalog, joined from three endpoints because no single one
 * carries the full set of fields the UI needs:
 *
 *   /heroes                 → name, square portrait, smallmap
 *   /heroes/positions       → role + lane (localised to English via lang=en)
 *   /academy/heroes/catalog → character painting + large portrait
 *
 * All three are cached for an hour by the fetch layer; `cache()` additionally
 * de-dupes them within a single render pass.
 */
export const getHeroIndex = cache(async (): Promise<Map<number, HeroRef>> => {
  const [base, positions, catalog] = await Promise.all([
    list("/heroes", { size: 200 }),
    list("/heroes/positions", { size: 200 }),
    list("/academy/heroes/catalog", { size: 200 }),
  ]);

  const byId = new Map<number, HeroRef>();

  for (const rec of base.records) {
    const d = asRec(rec.data);
    const hero = asRec(d.hero);
    const hd = asRec(hero.data);
    const id = num(d.hero_id);
    if (id === null) continue;
    byId.set(id, {
      id,
      name: str(hd.name, `Hero ${id}`),
      portrait: str(hd.head),
      painting: "",
      smallmap: str(hd.smallmap),
      role: "",
      lanes: [],
    });
  }

  for (const rec of positions.records) {
    const d = asRec(rec.data);
    const hd = asRec(asRec(d.hero).data);
    const id = num(d.hero_id);
    if (id === null) continue;
    const existing = byId.get(id);
    const roles = titles(hd.sortid, roleTitle);
    const lanes = titles(hd.roadsort, laneTitle);
    byId.set(id, {
      id,
      name: existing?.name ?? str(hd.name, `Hero ${id}`),
      portrait: existing?.portrait ?? "",
      painting: existing?.painting ?? "",
      smallmap: str(hd.smallmap) || existing?.smallmap || "",
      role: roles[0] ?? "All",
      lanes,
    });
  }

  for (const rec of catalog.records) {
    const d = asRec(rec.data);
    const id = num(d.hero_id);
    if (id === null) continue;
    const existing = byId.get(id);
    if (!existing) continue;
    existing.painting = str(d.painting) || str(d.head_big) || existing.painting;
    if (!existing.portrait) existing.portrait = str(d.head);
  }

  return byId;
});

/** Full catalog, alphabetically ordered for the heroes page. */
export const getHeroes = cache(async (): Promise<HeroRef[]> => {
  const index = await getHeroIndex();
  return [...index.values()].sort((a, b) => a.name.localeCompare(b.name));
});

export const getHeroRef = cache(async (id: number): Promise<HeroRef | null> => {
  const index = await getHeroIndex();
  return index.get(id) ?? null;
});

/** Stable "heroId:name:portrait" triple so hero art renders in match rows. */
function heroStub(ref: HeroRef | null, id: number) {
  return {
    heroId: id,
    heroName: ref?.name ?? `Hero ${id}`,
    heroPortrait: ref?.portrait ?? ref?.smallmap ?? "",
  };
}

/* ─────────────────────────────────────────────────────────────
   Hero detail
   ───────────────────────────────────────────────────────────── */

const stripTags = (html: string): string =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

export const getHero = cache(async (identifier: string | number): Promise<Hero | null> => {
  const { records } = await list(`/heroes/${encodeURIComponent(String(identifier))}`, { size: 1 });
  const rec = first(records);
  if (!rec) return null;

  const d = asRec(asRec(rec).data);
  const heroNode = asRec(d.hero);
  const hd = asRec(heroNode.data);
  const id = num(d.hero_id) ?? num(hd.heroid);
  if (id === null) return null;

  const ref = (await getHeroIndex()).get(id) ?? null;

  const skills: HeroSkill[] = [];
  for (const group of arr(hd.heroskilllist)) {
    for (const skill of arr(asRec(group).skilllist)) {
      const s = asRec(skill);
      const name = str(s.skillname);
      const desc = stripTags(str(s.skilldesc));
      if (!name && !desc) continue;
      skills.push({
        name: name || "Ability",
        desc,
        icon: str(s.skillicon) || null,
        tags: arr(asRec(first(s.skilltag))).map((t) => str(asRec(t).tagname)).filter(Boolean),
      });
    }
  }

  const relation = (key: "strong" | "weak" | "assist") => {
    const node = asRec(asRec(d.relation)[key]);
    return {
      desc: stripTags(str(node.desc)),
      heroIds: arr(node.target_hero_id)
        .map((n) => num(n))
        .filter((n): n is number => n !== null),
    };
  };

  return {
    id,
    name: ref?.name ?? str(hd.name, `Hero ${id}`),
    story: str(hd.story),
    specialties: arr(hd.speciality).map((s) => str(s)).filter(Boolean),
    role: ref?.role ?? "All",
    lanes: ref?.lanes ?? [],
    difficulty: num(hd.difficulty) ?? 5,
    portrait: ref?.portrait ?? str(hd.head),
    painting: ref?.painting ?? str(hd.painting),
    smallmap: ref?.smallmap ?? str(hd.smallmap),
    loreUrl: str(asRec(rec).url) || null,
    skills,
    relations: {
      strong: relation("strong"),
      weak: relation("weak"),
      assist: relation("assist"),
    },
    stats: await getHeroStats(id),
  };
});

/** Win/pick/ban rates. Upstream returns 0 when a hero has no ranked data. */
export const getHeroStats = cache(async (id: number) => {
  try {
    const { records } = await list(`/heroes/${id}/stats`, { size: 1, rank: 101 });
    const node = asRec(asRec(asRec(first(records)).data).data);
    const pct = (v: unknown) => {
      const n = num(v);
      return n === null || n === 0 ? null : n;
    };
    return {
      winRate: pct(node.win_rate),
      battleWinRate: pct(node.battle_win_rate),
      pickRate: pct(node.pick_rate),
      banRate: pct(node.ban_rate),
    };
  } catch {
    return { winRate: null, battleWinRate: null, pickRate: null, banRate: null };
  }
});

/* ─────────────────────────────────────────────────────────────
   Ranks & roles
   ───────────────────────────────────────────────────────────── */

export const getRanks = cache(async (): Promise<RankTier[]> => {
  const { records } = await list("/academy/ranks", { size: 40 });
  return records
    .map((rec) => {
      const d = asRec(asRec(rec).data);
      const bigrank = num(d.bigrank);
      if (bigrank === null) return null;
      const start = num(d.rankid_start) ?? 1;
      const end = num(d.rankid_end) ?? start;
      const minRank = num(d.minrank);
      return {
        bigrank,
        tier: minRank ?? bigrank,
        label: rankLabel(bigrank, minRank),
        shortLabel: rankShort(bigrank, minRank),
        icon: str(d.icon),
        minStars: start,
        maxStars: end,
      };
    })
    .filter((r): r is RankTier => r !== null)
    .sort((a, b) => a.minStars - b.minStars);
});

function rankLabel(bigrank: number, tier: number | null): string {
  if (bigrank === 7) {
    const names = ["Mythic", "Mythic Honor", "Mythic Glory", "Mythic Immortal"];
    return names[Math.max(0, (tier ?? 1) - 1)] ?? "Mythic";
  }
  return formatTier(bigrank, tier);
}

function rankShort(bigrank: number, tier: number | null): string {
  if (bigrank === 7) {
    const shorts = ["MYT", "HON", "GLO", "IMM"];
    return shorts[Math.max(0, (tier ?? 1) - 1)] ?? "MYT";
  }
  return `${bigRankName(bigrank).slice(0, 3).toUpperCase()}${formatTier(bigrank, tier)}`;
}

function formatTier(bigrank: number, tier: number | null): string {
  const counts: Record<number, number> = { 1: 3, 2: 3, 3: 4, 4: 5, 5: 5, 6: 5 };
  const total = counts[bigrank] ?? 1;
  const roman = ["", "I", "II", "III", "IV", "V"];
  const idx = Math.min(total, Math.max(1, (tier ?? 1))) - 1;
  const symbol = roman[total - idx] ?? "I";
  return `${bigRankName(bigrank)} ${symbol}`;
}

const rankByStars = cache(async (): Promise<RankTier[]> => getRanks());

export const resolveRank = cache(async (rankLevel: number | null): Promise<RankTier | null> => {
  if (rankLevel === null || rankLevel === undefined) return null;
  const code: RankCode | null = decodeRank(rankLevel);
  if (!code) return null;
  const table = await rankByStars();
  const exact = table.find((t) => rankLevel >= t.minStars && rankLevel <= t.maxStars);
  if (exact) return exact;
  return {
    bigrank: code.bigrank,
    tier: code.tier,
    label: rankLabel(code.bigrank, code.tier),
    shortLabel: rankShort(code.bigrank, code.tier),
    icon: "",
    minStars: code.stars,
    maxStars: code.stars,
  };
});

export const getRoles = cache(async (): Promise<RoleMeta[]> => {
  const { records } = await list("/academy/roles");
  return records
    .map((rec) => {
      const d = asRec(asRec(rec).data);
      const name = str(d.emblem_title);
      if (!name || name === "All") return null;
      return { name, icon: str(d.emblem_icon) };
    })
    .filter((r): r is RoleMeta => r !== null);
});

export { BIG_RANK_COLOR };

/* ─────────────────────────────────────────────────────────────
   Authenticated player data
   ───────────────────────────────────────────────────────────── */

interface Auth {
  token: string;
}

/**
 * Query functions are memoised on the *token string*, not the `{ token }` object
 * literal callers pass in: React's `cache` keys on argument identity, so a fresh
 * object would always miss. Wrapping the primitive keeps the whole render pass
 * sharing one upstream call.
 */
const profileByToken = cache(async (token: string): Promise<PlayerProfile> => {
  const data = await upstreamFetch<Rec>("/user/info", { token, authed: true });
  const roleId = num(data.roleId) ?? 0;
  const zoneId = num(data.zoneId) ?? 0;
  const rankLevel = num(data.rank_level);
  const historyRank = num(data.history_rank_level);

  const [currentRank, highestRank] = await Promise.all([
    resolveRank(rankLevel),
    resolveRank(historyRank),
  ]);

  return {
    roleId,
    zoneId,
    name: str(data.name, "Unknown Player"),
    avatar: str(data.avatar),
    level: num(data.level) ?? 1,
    rankLevel,
    historyRankLevel: historyRank,
    currentRank,
    highestRank,
    country: str(data.reg_country) || null,
  };
});

export const getProfile = ({ token }: Auth): Promise<PlayerProfile> => profileByToken(token);

async function toHighlight(
  node: unknown,
  heroes: Map<number, HeroRef>,
): Promise<StatHighlight | null> {
  const d = asRec(node);
  const value = num(d.v);
  if (value === null || value === 0) return null;
  const heroId = num(d.hid);
  const ref = heroId === null ? null : heroes.get(heroId);
  return {
    value,
    at: num(d.ts) ?? 0,
    heroId,
    heroName: ref?.name ?? null,
    heroPortrait: ref?.portrait ?? null,
    matchId: num(d.bid),
    seasonId: num(d.sid),
  };
}

const careerStatsByToken = cache(async (token: string): Promise<CareerStats> => {
  const [data, heroes] = await Promise.all([
    upstreamFetch<Rec>("/user/stats", { token, authed: true }),
    getHeroIndex(),
  ]);
  const winCount = num(data.wc) ?? 0;
  const totalCount = num(data.tc) ?? 0;

  const [kills, assists, gold, damage, damageTaken, gpm, minions] = await Promise.all([
    toHighlight(data.mo, heroes),
    toHighlight(data.hk, heroes),
    toHighlight(data.ma, heroes),
    toHighlight(data.ms, heroes),
    toHighlight(data.mdt, heroes),
    toHighlight(data.mg, heroes),
    toHighlight(data.mtd, heroes),
  ]);

  return {
    winCount,
    totalCount,
    winRate: totalCount > 0 ? (winCount / totalCount) * 100 : 0,
    averageScore: num(data.as) ?? 0,
    goldPerMinute: num(data.gt) ?? 0,
    mvpCount: num(data.mvpc) ?? 0,
    winStreak: num(data.wsc) ?? 0,
    highlights: {
      mostKills: kills,
      mostAssists: assists,
      mostGold: gold,
      mostDamage: damage,
      mostDamageTaken: damageTaken,
      mostGoldPerMinute: gpm,
      mostMinions: minions,
    },
    seasonIds: arr<number>(data.sids).map((s) => num(s)).filter((s): s is number => s !== null),
  };
});

export const getCareerStats = ({ token }: Auth): Promise<CareerStats> =>
  careerStatsByToken(token);

const seasonIdsByToken = cache(async (token: string): Promise<number[]> => {
  const data = await upstreamFetch<Rec>("/user/season", { token, authed: true });
  const sids = arr<number>(data.sids)
    .map((s) => num(s))
    .filter((s): s is number => s !== null);
  return sids.length ? sids : [];
});

export const getSeasonIds = ({ token }: Auth): Promise<number[]> => seasonIdsByToken(token);

const matchesByToken = cache(
  async (
    token: string,
    sid: number,
    limit: number,
    lastCursor: string | null,
  ): Promise<MatchPage> => {
    const [data, heroes] = await Promise.all([
      upstreamFetch<Rec>("/user/matches", {
        token,
        authed: true,
        searchParams: { sid, limit, last_cursor: lastCursor ?? undefined },
      }),
      getHeroIndex(),
    ]);

    const results = arr(data.result);
    const pageInfo = asRec(data.pageInfo);
    const nextRaw = pageInfo.nextCursor;

    const items: MatchSummary[] = results.map((raw) => {
      const m = asRec(raw);
      const heroId = num(m.hid) ?? 0;
      const ref = heroes.get(heroId);
      const playedAt = num(m.ts) ?? 0;
      return {
        matchId: num(m.bid) ?? 0,
        seasonId: num(m.sid) ?? sid,
        heroId,
        heroName: ref?.name ?? `Hero ${heroId}`,
        heroPortrait: ref?.portrait ?? ref?.smallmap ?? "",
        kills: num(m.k) ?? 0,
        deaths: num(m.d) ?? 0,
        assists: num(m.a) ?? 0,
        score: num(m.s) ?? 0,
        lane: normalizeLane(laneFromId(num(m.lid))),
        goldPerMinute: num(m.gt) ?? 0,
        isMvp: (num(m.mvp) ?? 0) === 1,
        result: decodeResult(num(m.res)),
        playedAt,
      };
    });

    return {
      items,
      nextCursor: nextRaw === null || nextRaw === undefined ? null : String(nextRaw),
      hasNext: pageInfo.hasNext === true,
      total: num(pageInfo.count) ?? items.length,
    };
  },
);

export const getMatches = (
  { token }: Auth,
  sid: number,
  limit = 20,
  lastCursor?: string | null,
): Promise<MatchPage> => matchesByToken(token, sid, limit, lastCursor ?? null);

/**
 * `lid` in a match summary is a lane id, not a name. Upstream never documents
 * the mapping; the conventional MLBB ordering is used and anything unrecognised
 * is passed through to `normalizeLane` as an opaque value rather than dropped.
 */
function laneFromId(lid: number | null): string | null {
  if (lid === null) return null;
  const table: Record<number, string> = {
    1: "Gold Lane",
    2: "EXP Lane",
    3: "Mid Lane",
    4: "Side Lane",
    5: "Jungling",
    6: "Roaming",
  };
  return table[lid] ?? null;
}

const matchDetailByToken = cache(
  async (token: string, matchId: number, sid: number): Promise<MatchDetail | null> => {
    const [data, heroes] = await Promise.all([
      upstreamFetch<Rec>(`/user/matches/${matchId}`, {
        token,
        authed: true,
        searchParams: { sid },
      }),
      getHeroIndex(),
    ]);

    const results = arr(data.result);
    if (!results.length) return null;

    const firstMatch = asRec(results[0]);
    const players: MatchPlayer[] = results.map((raw) => {
      const p = asRec(raw);
      const heroId = num(p.hid) ?? 0;
      const ref = heroes.get(heroId);
      const items: MatchEquipment[] = arr(p.its_e)
        .map((node) => {
          const it = asRec(node);
          const itData = asRec(it.data);
          const id = num(it.id) ?? num(itData._object) ?? 0;
          const name = str(itData.equip_name) || str(itData.name);
          if (!id && !name) return null;
          return { id, name: name || `Item ${id}`, icon: str(itData.icon) || null };
        })
        .filter((i): i is MatchEquipment => i !== null);

      return {
        heroId,
        heroName: ref?.name ?? `Hero ${heroId}`,
        heroPortrait: ref?.portrait ?? ref?.smallmap ?? "",
        nickname: str(p.rname, "—"),
        roleId: num(p.rid) ?? 0,
        zoneId: num(p.zid) ?? 0,
        kills: num(p.k) ?? 0,
        deaths: num(p.d) ?? 0,
        assists: num(p.a) ?? 0,
        goldPerMinute: num(p.tfr) ?? 0,
        damage: num(p.o) ?? 0,
        score: num(p.s) ?? 0,
        rating: num(p.op) ?? 0,
        result: decodeResult(num(p.fk) === 1 ? 1 : num(p.fk) === 0 ? 2 : null),
        isMvp: (num(p.mvp) ?? 0) === 1,
        items,
      };
    });

    return {
      matchId,
      seasonId: num(firstMatch.sid) ?? sid,
      playedAt: num(firstMatch.ts) ?? 0,
      myHeroId: num(firstMatch.hid) ?? players[0]?.heroId ?? 0,
      players,
    };
  },
);

export const getMatchDetail = (
  { token }: Auth,
  matchId: number,
  sid: number,
): Promise<MatchDetail | null> => matchDetailByToken(token, matchId, sid);

const frequentHeroesByToken = cache(
  async (token: string, sid: number, limit: number): Promise<FrequentHero[]> => {
    const [data, heroes] = await Promise.all([
      upstreamFetch<Rec>("/user/heroes/frequent", {
        token,
        authed: true,
        searchParams: { sid, limit },
      }),
      getHeroIndex(),
    ]);

    return arr(data.result)
      .map((raw) => {
        const f = asRec(raw);
        const heroId = num(f.hid) ?? 0;
        const ref = heroes.get(heroId) ?? null;
        const stub = heroStub(ref, heroId);
        const winCount = num(f.wc) ?? 0;
        const totalCount = num(f.tc) ?? 0;
        return {
          ...stub,
          totalCount,
          winCount,
          winRate: totalCount > 0 ? (winCount / totalCount) * 100 : 0,
          bestStreak: num(f.bs) ?? 0,
          matchRank: num(f.mr) ?? num(f.mrp) ?? num(f.p) ?? 0,
        };
      })
      .filter((h) => h.heroId > 0);
  },
);

export const getFrequentHeroes = (
  { token }: Auth,
  sid: number,
  limit = 20,
): Promise<FrequentHero[]> => frequentHeroesByToken(token, sid, limit);

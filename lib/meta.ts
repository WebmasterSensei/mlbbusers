import { cache } from "react";
import { upstreamFetch } from "@/lib/api";

export interface GamePatch {
  version: string;
  releasedAt: number;
}

interface MetaRecord {
  data?: { game_version?: string };
  createdAt?: number;
}

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const str = (v: unknown): string => (typeof v === "string" ? v : "");

/**
 * Game version history from `/academy/meta/version`.
 *
 * This is the only "news"-shaped thing the public API exposes — there is no
 * events or announcements feed — so the UI labels it patch history rather than
 * inventing a news section.
 */
export const getPatches = cache(async (limit = 4): Promise<GamePatch[]> => {
  const data = await upstreamFetch<{ records?: MetaRecord[] }>("/academy/meta/version", {
    searchParams: { size: 8, lang: "en" },
  });

  const records = Array.isArray(data?.records) ? data.records : [];

  return records
    .map((rec) => {
      const version = str(rec?.data?.game_version);
      if (!version) return null;
      return { version, releasedAt: num(rec?.createdAt) ?? 0 };
    })
    .filter((p): p is GamePatch => p !== null)
    .sort((a, b) => b.releasedAt - a.releasedAt)
    .slice(0, limit);
});

export const getCurrentVersion = cache(async (): Promise<GamePatch | null> => {
  const [latest] = await getPatches(1);
  return latest ?? null;
});

"use client";

import { useCallback, useState } from "react";
import { LuHistory } from "react-icons/lu";
import { AngularButton } from "@/components/ui/AngularButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { MatchRow } from "@/components/matches/MatchRow";
import type { MatchPage, MatchSummary, PlayerIdentity } from "@/types/mlbb";

const PAGE_SIZE = 20;

/**
 * Cursor-paginated ranked history.
 *
 * The first page arrives from the server render; "Load more" fetches the next
 * `cursor` from `/api/mlbb/user/matches` and appends. `cursor` is opaque, so we
 * never compute it ourselves.
 */
export function WarRecordsList({
  initialPage,
  identity,
  sid,
}: {
  initialPage: MatchPage;
  identity: PlayerIdentity;
  sid: number;
}) {
  const [items, setItems] = useState<MatchSummary[]>(initialPage.items);
  const [cursor, setCursor] = useState<string | null>(initialPage.nextCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ sid: String(sid), limit: String(PAGE_SIZE), cursor });
      const res = await fetch(`/api/mlbb/user/matches?${params}`, { cache: "no-store" });
      const body = (await res.json()) as { data?: MatchPage; error?: string };
      if (!res.ok || !body.data) throw new Error(body.error || "Could not load more matches.");
      const next = body.data;
      setItems((prev) => {
        const seen = new Set(prev.map((m) => m.matchId));
        return [...prev, ...next.items.filter((m) => !seen.has(m.matchId))];
      });
      setCursor(next.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load more matches.");
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, sid]);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<LuHistory className="size-5" />}
        title="No ranked matches"
        description="The API reports no ranked games for this account in the selected season."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2.5">
        {items.map((match) => (
          <li key={match.matchId}>
            <MatchRow match={match} identity={identity} />
          </li>
        ))}
      </ul>

      {error ? <p className="text-xs text-defeat">{error}</p> : null}

      {cursor ? (
        <div className="flex justify-center">
          <AngularButton
            variant="glass"
            size="md"
            onClick={loadMore}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Loading…" : "Load more"}
          </AngularButton>
        </div>
      ) : (
        <p className="text-center text-[11px] uppercase tracking-widest text-ink-400">
          End of history
        </p>
      )}
    </div>
  );
}

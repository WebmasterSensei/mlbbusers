import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/site/Shell";
import { LeftRail } from "@/components/lobby/LeftRail";
import { WarRecordsList } from "@/components/matches/WarRecordsList";
import { NotVerified } from "@/components/profile/NotVerified";
import { EmptyState } from "@/components/ui/EmptyState";
import { errorMessage } from "@/lib/api";
import { getMatches, getSeasonIds } from "@/lib/mlbb";
import { getCurrentPlayer } from "@/lib/session";
import { LuGitBranch, LuHistory } from "react-icons/lu";

export const metadata: Metadata = {
  title: "War Records · MLBB Stats",
  description: "The full ranked match history for your verified Mobile Legends account.",
};

const PAGE_SIZE = 20;

export default async function WarRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ sid?: string }>;
}) {
  const { session } = await getCurrentPlayer();

  if (!session) {
    return (
      <Shell rail={<LeftRail />}>
        <NotVerified />
      </Shell>
    );
  }

  const identity = { roleId: session.roleId, zoneId: session.zoneId };
  const token = session.jwt;

  const requested = Number((await searchParams).sid);
  const seasonIds = await getSeasonIds({ token }).catch(() => [] as number[]);
  const sid = seasonIds.includes(requested) ? requested : (seasonIds[0] ?? null);

  return (
    <Shell rail={<LeftRail />}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8">
        <header className="flex flex-col gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold-500/80">
            Ranked
          </p>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-ink-100">
            War Records
          </h1>
          <p className="text-sm text-ink-400">
            Every ranked game the API still lists for this season, newest first.
          </p>
        </header>

        {seasonIds.length > 1 ? (
          <nav className="flex flex-wrap gap-2" aria-label="Season">
            {seasonIds.map((id) => (
              <Link
                key={id}
                href={`/war-records?sid=${id}`}
                aria-current={id === sid ? "page" : undefined}
                className={
                  id === sid
                    ? "clip-notch-sm bg-gold-500/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold-200 ring-1 ring-inset ring-gold-400/50"
                    : "clip-notch-sm glass-subtle px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-300 ring-1 ring-inset ring-white/10 hover:text-ink-100"
                }
              >
                Season {id}
              </Link>
            ))}
          </nav>
        ) : null}

        {sid === null ? (
          <EmptyState
            icon={<LuHistory className="size-5" />}
            title="No seasons found"
            description="The API has no ranked seasons on file for this account yet."
          />
        ) : await renderHistory({ token, sid, identity })}
      </div>
    </Shell>
  );
}

async function renderHistory({
  token,
  sid,
  identity,
}: {
  token: string;
  sid: number;
  identity: { roleId: number; zoneId: number };
}) {
  try {
    const page = await getMatches({ token }, sid, PAGE_SIZE);
    return <WarRecordsList initialPage={page} identity={identity} sid={sid} />;
  } catch (err) {
    return (
      <EmptyState
        tone="error"
        icon={<LuGitBranch className="size-5" />}
        title="Match history unavailable"
        description={errorMessage(err)}
      />
    );
  }
}

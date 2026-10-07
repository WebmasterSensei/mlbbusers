import type { Metadata } from "next";
import { Shell } from "@/components/site/Shell";
import { LeftRail } from "@/components/lobby/LeftRail";
import { VerifyForm } from "@/components/search/VerifyForm";
import { NoNicknameSearch } from "@/components/search/NoNicknameSearch";
import { getCurrentPlayer } from "@/lib/session";

export const metadata: Metadata = {
  title: "ID Card · MLBB Stats",
  description: "Look up a Mobile Legends account by Role ID and Zone ID.",
};

/** Pre-fills the Zone ID when arriving from a profile URL. */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ zone?: string }>;
}) {
  const [{ zone }, { session }] = await Promise.all([searchParams, getCurrentPlayer()]);

  return (
    <Shell rail={<LeftRail />}>
      <div className="flex flex-col items-center gap-8 px-4 py-10 lg:py-16">
        <VerifyForm defaultZoneId={zone} />
        <NoNicknameSearch />
      </div>

      {session ? (
        <p className="px-4 pb-10 text-center text-[11px] text-ink-400">
          You are already verified as{" "}
          <a
            href={`/profile/${session.zoneId}/${session.roleId}`}
            className="text-gold-400 underline-offset-4 hover:underline"
          >
            {session.roleId}
          </a>
          . Verifying another account replaces the current one.
        </p>
      ) : null}
    </Shell>
  );
}

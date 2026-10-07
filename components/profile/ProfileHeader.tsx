import { LuTrophy } from "react-icons/lu";
import { Panel } from "@/components/ui/Panel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RankBadge } from "@/components/profile/RankBadge";
import { Portrait } from "@/components/ui/Portrait";
import ShinyText from "@/components/bits/ShinyText";
import type { PlayerProfile } from "@/types/mlbb";

/** Profile header: avatar, name, level, current and peak rank. */
export function ProfileHeader({ profile }: { profile: PlayerProfile }) {
  return (
    <Panel padded={false} className="overflow-hidden">
      <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        {/* Faint rank-tinted wash behind the avatar */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 -top-10 size-56 rounded-full bg-gold-600/10 blur-3xl"
        />

        <div className="relative flex shrink-0 items-center gap-4">
          <RankBadge rank={profile.currentRank} size={92} />
          <Portrait
            src={profile.avatar || null}
            alt={profile.name}
            size={64}
            frame="none"
            monogram={profile.name}
            priority
            className="ring-1 ring-gold-500/30"
          />
        </div>

        <div className="relative min-w-0 flex-1">
          <Eyebrow>
            {profile.country ? `Region ${profile.country}` : "Land of Dawn"}
          </Eyebrow>
          <h1 className="mt-1.5 truncate">
            <ShinyText
              text={profile.name}
              className="font-display text-3xl font-black uppercase tracking-tight"
              color="#eab839"
              shineColor="#fff3d0"
              speed={4}
            />
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400">
            <span>Level {profile.level}</span>
            <span aria-hidden className="text-gold-600">
              ·
            </span>
            <span className="font-mono">
              {profile.roleId} / {profile.zoneId}
            </span>
          </p>
        </div>

        <div className="relative flex shrink-0 gap-5">
          <RankStat label="Current" rank={profile.currentRank} />
          <RankStat label="Peak" rank={profile.highestRank} icon />
        </div>
      </div>
    </Panel>
  );
}

function RankStat({
  label,
  rank,
  icon,
}: {
  label: string;
  rank: PlayerProfile["currentRank"];
  icon?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <Eyebrow className="tracking-[0.2em]">{label}</Eyebrow>
      <div className="flex items-center gap-2">
        {icon ? <LuTrophy className="size-4 text-gold-500" aria-hidden /> : null}
        <RankBadge rank={rank} size={icon ? 40 : 48} showStars={false} />
      </div>
    </div>
  );
}

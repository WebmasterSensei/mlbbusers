"use client";


import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LuLogOut, LuSettings, LuShieldCheck, LuUserRound } from "react-icons/lu";
import { cn } from "@/lib/cn";
import { RankBadge } from "@/components/profile/RankBadge";
import type { PlayerIdentity, PlayerProfile } from "@/types/mlbb";

/**
 * MLBB's top bar: identity on the left, currency and system icons on the right.
 *
 * Currency and the system icons are decorative — this app reads a public game
 * data API, not a player account, so there is no balance to show. They are
 * rendered but explicitly marked as unavailable rather than filled with fake
 * numbers.
 */
export function TopPlayerBar({
  profile,
  identity,
}: {
  profile: PlayerProfile | null;
  identity: PlayerIdentity | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  const signedIn = profile !== null && identity !== null;

  async function signOut() {
    setBusy(true);
    try {
      await fetch("/api/mlbb/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } finally {
      setBusy(false);
      startTransition(() => {
        router.push("/");
        router.refresh();
      });
    }
  }

  return (
    <header className="glass-strong relative z-40 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 lg:px-6">
      {/* Identity */}
      <div className="flex min-w-0 items-center gap-3">
        {signedIn ? (
          <Link
            href={`/profile/${identity.zoneId}/${identity.roleId}`}
            className="group flex min-w-0 items-center gap-3"
          >
            <RankBadge rank={profile.currentRank} size={40} showStars={false} />
            <span className="min-w-0">
              <span className="block truncate font-display text-sm font-semibold leading-tight text-ink-100 group-hover:text-gold-300">
                {profile.name}
              </span>
              <span className="flex items-center gap-2 text-[11px] leading-tight text-ink-400">
                <span>Lv.{profile.level}</span>
                <span className="text-gold-600">·</span>
                <span className="truncate">{profile.currentRank?.label ?? "Unranked"}</span>
              </span>
            </span>
          </Link>
        ) : (
          <Link href="/search" className="group flex items-center gap-3">
            <span className="clip-hex grid size-10 place-items-center bg-abyss-800 text-ink-400 ring-1 ring-gold-500/25 transition group-hover:text-gold-300">
              <LuUserRound className="size-5" />
            </span>
            <span className="hidden sm:block">
              <span className="block font-display text-sm font-semibold leading-tight text-ink-200 group-hover:text-gold-300">
                Not signed in
              </span>
              <span className="text-[11px] text-ink-400">Verify an ID Card</span>
            </span>
          </Link>
        )}
      </div>

      {/* Currency + system */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <CurrencyChip label="BP" value="—" title="Battle Points — not exposed by the public API" />
        <CurrencyChip label="◈" value="—" title="Diamonds — not exposed by the public API" />

        <span aria-hidden className="mx-1 hidden h-7 w-px bg-gold-500/20 sm:block" />

        <IconButton href="/search" label="Search players" active={pathname === "/search"}>
          <LuShieldCheck className="size-[18px]" />
        </IconButton>

        <IconButton label="Settings — not available in this build" disabled>
          <LuSettings className="size-[18px]" />
        </IconButton>

        {signedIn ? (
          <button
            type="button"
            onClick={signOut}
            disabled={busy || pending}
            title="Sign out"
            className="grid size-9 place-items-center text-ink-400 transition hover:bg-defeat/10 hover:text-defeat disabled:opacity-40"
          >
            <LuLogOut className="size-[18px]" />
            <span className="sr-only">Sign out</span>
          </button>
        ) : null}
      </div>
    </header>
  );
}

function CurrencyChip({ label, value, title }: { label: string; value: string; title: string }) {
  return (
    <span
      title={title}
      className="clip-notch-sm flex items-center gap-1.5 bg-abyss-850/80 px-2.5 py-1.5 text-[11px] font-semibold text-ink-300 ring-1 ring-inset ring-gold-500/15"
    >
      <span className="text-gold-400">{label}</span>
      <span className="text-ink-400">{value}</span>
    </span>
  );
}

function IconButton({
  children,
  href,
  label,
  active,
  disabled,
}: {
  children: React.ReactNode;
  href?: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  const className = cn(
    "grid size-9 place-items-center transition",
    active ? "bg-gold-500/15 text-gold-300" : "text-ink-400 hover:bg-gold-500/10 hover:text-gold-300",
    disabled && "cursor-not-allowed opacity-30 hover:bg-transparent hover:text-ink-400",
  );

  if (disabled) {
    return (
      <span className={className} title={label} aria-disabled>
        {children}
      </span>
    );
  }

  if (href) {
    return (
      <Link href={href} className={className} title={label}>
        {children}
      </Link>
    );
  }

  return (
    <span className={className} title={label}>
      {children}
    </span>
  );
}

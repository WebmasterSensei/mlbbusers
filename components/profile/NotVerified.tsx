import Link from "next/link";
import type { ReactNode } from "react";
import { LuShieldAlert } from "react-icons/lu";
import { Panel } from "@/components/ui/Panel";
import { AngularLink } from "@/components/ui/AngularButton";

/**
 * Shown on any authenticated page when the requested account is not the one
 * this device has verified.
 *
 * The upstream API only accepts a JWT bound to a single account, so this build
 * cannot show a second player's stats without that player sending a code to
 * their own inbox. Saying that plainly beats rendering an empty shell.
 */
export function NotVerified({
  title = "Verify this ID Card first",
  description = "Mobile Legends has no public profile API. To see this account's rank, career stats and match history, confirm you own it with the 4-digit code in the game's Mail tab.",
  action,
  detail,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  detail?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16">
      <Panel className="p-8 text-center">
        <span aria-hidden className="clip-hex mx-auto grid size-16 place-items-center bg-gold-500/10 text-gold-400">
          <LuShieldAlert className="size-7" />
        </span>

        <h1 className="mt-5 font-display text-xl font-bold uppercase tracking-wide text-ink-100">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-400">{description}</p>

        {detail ? (
          <p className="mx-auto mt-3 max-w-md text-[11px] leading-relaxed text-ink-400">{detail}</p>
        ) : null}

        <div className="mt-6 flex justify-center">
          {action ?? (
            <AngularLink href="/search" variant="gold" size="lg">
              Verify an ID Card
            </AngularLink>
          )}
        </div>

        <p className="mt-5 text-[11px] text-ink-400">
          Public data needs no verification —{" "}
          <Link href="/heroes" className="text-gold-500 underline-offset-4 hover:underline">
            browse all 133 heroes
          </Link>{" "}
          or check{" "}
          <Link href="/skins" className="text-gold-500 underline-offset-4 hover:underline">
            what this site can and cannot show
          </Link>
          .
        </p>
      </Panel>
    </div>
  );
}

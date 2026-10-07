import { LuCircleHelp, LuInfo } from "react-icons/lu";
import { Panel } from "@/components/ui/Panel";

/**
 * Explains the two things a visitor will expect this page to do and cannot.
 *
 * Both restrictions are properties of the game, not of this implementation:
 * Mobile Legends has no public account search, and it has no public skin
 * database. Saying so up front beats a dead search box.
 */
export function NoNicknameSearch() {
  return (
    <Panel className="w-full max-w-lg p-6" tone="quiet">
      <h2 className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.2em] text-ink-200">
        <LuCircleHelp className="size-4 text-gold-500" />
        Why you cannot search by nickname
      </h2>

      <ul className="mt-3 flex flex-col gap-3 text-xs leading-relaxed text-ink-400">
        <li>
          Mobile Legends does not expose a public account directory. The only
          identifier a player has is the pair of numbers on their in-game
          profile — a <strong className="text-ink-200">Role ID</strong> and a{" "}
          <strong className="text-ink-200">Zone ID</strong>. The verification
          code is the only way to confirm the account is actually yours, since
          those two numbers are visible to anyone who sees your profile.
        </li>
        <li>
          You can find them in-game under <em>Me → Edit Profile</em>, or in the
          numeric player number at the end of your profile URL.
        </li>
      </ul>

      <p className="mt-4 flex items-start gap-2 border-t border-gold-500/10 pt-4 text-[11px] leading-relaxed text-ink-400">
        <LuInfo className="mt-px size-3.5 shrink-0 text-arcane-400" />
        Everything else on this site is free and public: all 133 heroes, their
        skills and counters, plus rank, career stats and match history for any
        account you verify.
      </p>
    </Panel>
  );
}

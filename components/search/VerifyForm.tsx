"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LuArrowLeft, LuShieldCheck, LuTriangleAlert } from "react-icons/lu";
import DecryptedText from "@/components/bits/DecryptedText";
import { Panel } from "@/components/ui/Panel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import type { SearchPhase } from "@/types/mlbb";

const CODE_TTL_SECONDS = 300;

/**
 * Two-step ID Card verification.
 *
 * MLBB has no public account lookup and no OAuth-style web login, so the only
 * way to prove you own an account is the 4-digit code the game mails to your
 * in-game inbox. This mirrors that flow exactly rather than pretending a
 * nickname search exists.
 */
export function VerifyForm({ defaultZoneId }: { defaultZoneId?: string }) {
  const router = useRouter();

  const [phase, setPhase] = useState<SearchPhase>("idle");
  const [zoneId, setZoneId] = useState(defaultZoneId ?? "");
  const [roleId, setRoleId] = useState("");
  const [vc, setVc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const vcInput = useRef<HTMLInputElement>(null);

  // The code's lifetime is owned by the game, so the deadline is stamped the
  // moment a code is requested. The interval only advances `now`, leaving the
  // remaining seconds a pure derivation that cannot drift from the wall clock.
  useEffect(() => {
    if (expiresAt === null) return;
    const tick = setInterval(() => {
      const at = Date.now();
      if (at >= expiresAt) {
        clearInterval(tick);
        setExpiresAt(null);
        setNow(at);
        setPhase("idle");
        setError("That code expired. Request a new one.");
        return;
      }
      setNow(at);
    }, 1000);
    return () => clearInterval(tick);
  }, [expiresAt]);

  useEffect(() => {
    if (phase === "awaiting-code") vcInput.current?.focus();
  }, [phase]);

  const post = useCallback(async (body: Record<string, unknown>) => {
    const res = await fetch("/api/mlbb/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      throw new Error(typeof data.error === "string" ? data.error : "Something went wrong. Try again.");
    }
    return data;
  }, []);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPhase("sending");
    try {
      await post({ action: "send-vc", zoneId: zoneId.trim(), roleId: roleId.trim() });
      setVc("");
      const sentAt = Date.now();
      setNow(sentAt);
      setExpiresAt(sentAt + CODE_TTL_SECONDS * 1000);
      setPhase("awaiting-code");
    } catch (err) {
      setExpiresAt(null);
      setError(err instanceof Error ? err.message : "Could not send a code.");
      setPhase("error");
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPhase("verifying");
    try {
      const data = await post({
        action: "login",
        zoneId: zoneId.trim(),
        roleId: roleId.trim(),
        vc: vc.trim(),
      });
      const identity = data.identity as { zoneId?: number; roleId?: number } | undefined;
      const zone = identity?.zoneId ?? zoneId.trim();
      const role = identity?.roleId ?? roleId.trim();
      setPhase("done");
      router.push(`/profile/${zone}/${role}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
      setPhase("error");
    }
  }

  const busy = phase === "sending" || phase === "verifying";
  const awaiting = phase === "awaiting-code";
  const secondsLeft =
    expiresAt === null ? 0 : Math.max(0, Math.ceil((expiresAt - now) / 1000));

  return (
    <div className="mx-auto w-full max-w-lg">
      <Panel className="p-7">
        <Eyebrow icon={<LuShieldCheck className="size-3.5" />}>ID Card</Eyebrow>
        <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide text-ink-100">
          {awaiting ? "Enter your code" : "Verify your account"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-400">
          {awaiting
            ? "Mobile Legends has sent a 4-digit code to your in-game inbox. Check the Mail tab in the game and type it below."
            : "Enter the numbers shown on your in-game profile. We will send a verification code to the account's inbox to prove it is yours."}
        </p>

        {error ? (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 border border-defeat/30 bg-defeat/10 px-3 py-2.5 text-xs leading-relaxed text-defeat"
          >
            <LuTriangleAlert className="mt-px size-4 shrink-0" />
            {error}
          </p>
        ) : null}

        {!awaiting && phase !== "done" ? (
          <form onSubmit={requestCode} className="mt-5 flex flex-col gap-4">
            <Field
              id="zoneId"
              label="Zone ID"
              hint="Shown under your avatar in-game"
              value={zoneId}
              onChange={setZoneId}
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              disabled={busy}
            />
            <Field
              id="roleId"
              label="Role ID"
              hint="The digits in your profile URL"
              value={roleId}
              onChange={setRoleId}
              inputMode="numeric"
              autoComplete="off"
              maxLength={12}
              disabled={busy}
            />

            <button
              type="submit"
              disabled={busy || !zoneId.trim() || !roleId.trim()}
              className="clip-blade mt-1 w-full bg-gradient-to-b from-gold-400 to-gold-600 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-abyss-1000 transition hover:from-gold-300 hover:to-gold-500 disabled:pointer-events-none disabled:opacity-40"
            >
              {phase === "sending" ? <Spinner label="Sending code" /> : "Send verification code"}
            </button>
          </form>
        ) : null}

        {awaiting || phase === "verifying" || phase === "done" ? (
          <form onSubmit={verify} className="mt-5 flex flex-col gap-4">
            <Field
              id="vc"
              label="4-digit code"
              hint={`Expires in ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`}
              value={vc}
              onChange={(v) => setVc(v.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              disabled={busy}
              inputRef={vcInput}
              mono
              big
            />

            <button
              type="submit"
              disabled={busy || vc.length !== 4}
              className="clip-blade w-full bg-gradient-to-b from-gold-400 to-gold-600 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-abyss-1000 transition hover:from-gold-300 hover:to-gold-500 disabled:pointer-events-none disabled:opacity-40"
            >
              {phase === "verifying" ? (
                <Spinner label="Verifying" />
              ) : phase === "done" ? (
                "Verified"
              ) : (
                "Verify and continue"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setPhase("idle");
                setError(null);
                setVc("");
              }}
              disabled={busy}
              className="inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-ink-400 transition hover:text-ink-200 disabled:opacity-40"
            >
              <LuArrowLeft className="size-3.5" />
              Use a different ID
            </button>
          </form>
        ) : null}

        {phase === "sending" ? (
          <p className="mt-4">
            <DecryptedText
              text="Contacting the Mobile Legends server"
              className="font-mono text-[11px] text-ink-400"
              encryptedClassName="font-mono text-arcane-400"
              speed={45}
              characters="▓▒░"
            />
          </p>
        ) : null}
      </Panel>

      <p className="mt-4 px-2 text-center text-[11px] leading-relaxed text-ink-400">
        The code is never stored. We only keep the session token in an encrypted
        cookie on this device, and you can sign out at any time.
      </p>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  inputMode,
  autoComplete,
  maxLength,
  disabled,
  inputRef,
  mono,
  big,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  inputMode?: "numeric" | "text";
  autoComplete?: string;
  maxLength?: number;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  mono?: boolean;
  big?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-500">
          {label}
        </span>
        <span className="text-[10px] text-ink-400">{hint}</span>
      </label>
      <input
        ref={inputRef}
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        disabled={disabled}
        className={cn(
          "clip-notch-sm w-full bg-abyss-950/80 px-4 text-ink-100 ring-1 ring-inset ring-gold-500/25 outline-none transition placeholder:text-ink-400 focus:ring-gold-400/70 disabled:opacity-50",
          mono ? "tracking-[0.5em]" : "tracking-wider",
          big ? "py-4 text-center text-2xl font-bold" : "py-3 text-sm",
        )}
      />
    </div>
  );
}

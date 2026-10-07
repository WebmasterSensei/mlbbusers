import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The angular gold-framed panel that every surface in this app sits in.
 * MLBB never uses a plain rounded rectangle, so neither do we.
 */
export function Panel({
  children,
  className,
  title,
  eyebrow,
  action,
  tone = "default",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  tone?: "default" | "raised" | "quiet";
  padded?: boolean;
}) {
  return (
    <section
      className={cn(
        "clip-notch relative isolate overflow-hidden",
        tone === "raised" ? "glass-strong" : tone === "quiet" ? "glass-subtle" : "glass",
        "ring-1 ring-white/10",
        className,
      )}
    >
      {/* Top edge accent — a bright specular highlight, as on real glass */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
      />
      {title ? (
        <header className="flex items-end justify-between gap-4 border-b border-gold-500/15 px-5 py-3.5">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-500/80">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="truncate font-display text-base font-semibold tracking-wide text-ink-100">
              {title}
            </h2>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn(padded && "p-5")}>{children}</div>
    </section>
  );
}

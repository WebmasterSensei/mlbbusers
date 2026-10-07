import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Shown wherever a surface has no data to render — including the Skins page,
 * where the honest reason is that no public API exposes skin ownership.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "quiet",
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "quiet" | "warn" | "error";
  className?: string;
}) {
  const ring =
    tone === "error"
      ? "ring-defeat/30"
      : tone === "warn"
        ? "ring-gold-500/30"
        : "ring-gold-500/20";

  return (
    <div
      className={cn(
        "clip-notch-sm flex flex-col items-center gap-3 px-6 py-10 text-center",
        "glass ring-1 ring-inset",
        ring,
        className,
      )}
    >
      {icon ? (
        <span
          aria-hidden
          className={cn(
            "clip-hex grid size-14 place-items-center text-2xl",
            tone === "error" ? "bg-defeat/10 text-defeat" : "bg-gold-500/10 text-gold-400",
          )}
        >
          {icon}
        </span>
      ) : null}
      <h3 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-ink-200">
        {title}
      </h3>
      {description ? (
        <p className="max-w-md text-sm leading-relaxed text-ink-400">{description}</p>
      ) : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

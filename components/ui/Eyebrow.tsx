import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Small gold label above a panel or section title, matching MLBB's section
 * headers. Decorative by default — pass an `as` heading level when the label
 * is the only thing labelling a region.
 */
export function Eyebrow({
  children,
  className,
  icon,
}: {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-gold-500",
        className,
      )}
    >
      {icon ? <span aria-hidden className="text-gold-400">{icon}</span> : null}
      {children}
    </p>
  );
}

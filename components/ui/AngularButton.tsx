import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "gold" | "arcane" | "ghost" | "danger" | "glass";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  gold:
    "bg-gradient-to-b from-gold-400 to-gold-600 text-abyss-1000 font-bold " +
    "shadow-[0_0_24px_-6px_rgb(232_184_57/0.6)] hover:from-gold-300 hover:to-gold-500 " +
    "hover:shadow-[0_0_34px_-4px_rgb(232_184_57/0.8)]",
  arcane:
    "bg-gradient-to-b from-arcane-400 to-arcane-600 text-abyss-1000 font-bold " +
    "shadow-[0_0_24px_-6px_rgb(56_189_248/0.55)] hover:from-arcane-300 hover:to-arcane-500",
  ghost:
    "bg-abyss-800/70 text-ink-200 ring-1 ring-inset ring-gold-500/30 " +
    "hover:bg-abyss-700/80 hover:text-ink-100 hover:ring-gold-400/60",
  glass:
    "glass text-ink-100 ring-1 ring-inset ring-white/20 " +
    "hover:text-white hover:ring-white/35",
  danger:
    "bg-gradient-to-b from-defeat to-red-700 text-white font-bold hover:from-red-400 hover:to-red-600",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[11px]",
  md: "px-4 py-2.5 text-xs",
  lg: "px-8 py-4 text-sm",
};

const BASE =
  "clip-blade relative inline-flex items-center justify-center gap-2 uppercase " +
  "tracking-[0.16em] whitespace-nowrap transition-all duration-200 " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-45";

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  full?: boolean;
};

export function AngularButton({
  children,
  variant = "gold",
  size = "md",
  className,
  full,
  ...rest
}: CommonProps & ComponentProps<"button">) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], full && "w-full", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function AngularLink({
  children,
  variant = "gold",
  size = "md",
  className,
  full,
  ...rest
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(BASE, VARIANTS[variant], SIZES[size], full && "w-full", className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

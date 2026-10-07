import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Square hero/player portrait with the angular frame used everywhere in the app.
 * Falls back to a monogram tile when the CDN has no art for an id.
 */
export function Portrait({
  src,
  alt,
  size = 56,
  className,
  frame = "gold",
  monogram,
  priority,
}: {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
  frame?: "gold" | "arcane" | "none";
  monogram?: string | null;
  priority?: boolean;
}) {
  const ring =
    frame === "gold"
      ? "ring-gold-500/40"
      : frame === "arcane"
        ? "ring-arcane-500/40"
        : "ring-transparent";

  const letter = (monogram ?? alt).trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className={cn(
        "clip-notch-sm relative inline-grid shrink-0 place-items-center overflow-hidden bg-abyss-800 ring-1",
        ring,
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          priority={priority}
          className="size-full object-cover"
        />
      ) : (
        <span className="font-display text-lg font-bold text-gold-500/70">{letter}</span>
      )}
    </span>
  );
}

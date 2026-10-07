import { AmbientBackdrop } from "@/components/site/AmbientBackdrop";
import { AngularLink } from "@/components/ui/AngularButton";

export default function NotFound() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <AmbientBackdrop />
      <div className="clip-notch glass relative flex max-w-md flex-col items-center gap-4 px-8 py-10 text-center ring-1 ring-white/10">
        <p className="font-display text-7xl font-black leading-none text-gold-gradient">404</p>
        <h1 className="font-display text-xl font-bold uppercase tracking-wide text-ink-100">
          Page not found
        </h1>
        <p className="text-sm text-ink-400">
          That route isn&apos;t part of the codex. The heroes and your war records are a tap away.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <AngularLink href="/" variant="gold" size="md">
            Back to lobby
          </AngularLink>
          <AngularLink href="/heroes" variant="glass" size="md">
            Heroes
          </AngularLink>
        </div>
      </div>
    </div>
  );
}

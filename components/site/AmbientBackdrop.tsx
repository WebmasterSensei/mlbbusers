/**
 * Ambient liquid-glass backdrop.
 *
 * A fixed, non-interactive layer of drifting colour blobs behind the whole app.
 * Glass surfaces refract it, which is what makes the translucency readable on
 * pages that have no hero artwork of their own. Motion is disabled by the global
 * `prefers-reduced-motion` rule.
 */
export function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#070c17_0%,#04070e_55%,#02040a_100%)]" />
      <span
        className="ambient-blob left-[-10%] top-[-15%] size-[46rem] bg-gold-500/25"
        style={{ animationDelay: "0s" }}
      />
      <span
        className="ambient-blob right-[-12%] top-[-5%] size-[40rem] bg-arcane-500/25"
        style={{ animationDelay: "-7s" }}
      />
      <span
        className="ambient-blob bottom-[-25%] left-[20%] size-[44rem] bg-mvp/20"
        style={{ animationDelay: "-13s" }}
      />
      <div className="vignette absolute inset-0" />
    </div>
  );
}

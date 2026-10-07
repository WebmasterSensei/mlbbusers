"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * GSAP plugin registration, done once per browser context.
 *
 * Imported for its side effect by any component that uses the ScrollTrigger or
 * SplitText plugins — `SplitText` and `ScrollTrigger` are both free as of
 * GSAP 3.13 (we pin 3.15).
 *
 * `gsap.registerPlugin` is idempotent, but guarding on `window` keeps the
 * import out of the server render path entirely.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

export { gsap, ScrollTrigger, SplitText };

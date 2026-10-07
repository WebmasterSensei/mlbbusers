import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Upstream MLBB payloads embed portraits, splash art and item icons from a
    // CDN whose hosts are undocumented and change without notice, so we allow
    // the whole https space rather than 400 on an unanticipated host.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    // Required in Next 16 — anything outside the allowlist is coerced.
    qualities: [75],
  },
};

export default nextConfig;

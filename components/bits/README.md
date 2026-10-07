# React Bits components

Copy-pasted source from [React Bits](https://reactbits.dev) (MIT + Commons
Clause — free for personal and commercial use), TypeScript + Tailwind variants.

These files are **not** wrapped in a package: React Bits is a copy-paste
library, so the source now lives here and can be edited freely. Upstream
origin: <https://github.com/DavidHDev/react-bits> (`src/ts-tailwind/`).

| Component | Upstream deps | Used in |
| --- | --- | --- |
| `AnimatedList` | `motion` | match history list |
| `BorderGlow` | — | hero cards, mode cards |
| `CardNav` | `gsap`, `react-icons` | lobby main menu |
| `ClickSpark` | — | button interactions |
| `CountUp` | `motion` | career stat counters |
| `DecryptedText` | `motion` | search "scanning" state |
| `Dock` | `motion` | game-mode bar |
| `ElasticSlider` | `motion` | hero carousel |
| `ElectricBorder` | — | primary Play CTA |
| `FadeContent` | `motion` | panel transitions |
| `GlareHover` | — | CTA shine sweep |
| `GlassSurface` | — | frosted lobby panels |
| `GridMotion` | `gsap` | hero word-cloud backdrop |
| `MagnetLines` | — | lobby background grid |
| `ShinyText` | `motion` | gold rank / name text |
| `SplitText` | `gsap` + plugins | title reveals |
| `SpotlightCard` | — | stat tiles |
| `StaggeredMenu` | `gsap` | full-screen overlay menu |
| `TiltedCard` | `motion` | hero cards |

`gsap/SplitText` and `gsap/ScrollTrigger` are free in GSAP ≥ 3.13 (we pin
3.15). Plugin registration happens once in `components/bits/register.ts`.

## Local edits

- `CardNav` — `logo` prop expects a URL string, rendered with a raw `<img>`.
  Left as-is: it is a tiny inline logo and `next/image` would add no value.
- `GlassSurface` — `useDarkMode` reads `prefers-color-scheme`. This app is
  always dark, so it is forced on at the call site via the `dark` prop rather
  than being patched here.
- Nothing else has been modified.

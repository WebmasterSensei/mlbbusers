import type { IconType } from "react-icons";
import {
  LuBookOpen,
  LuBoxes,
  LuCrown,
  LuGem,
  LuLayoutGrid,
  LuHistory,
  LuPalette,
  LuScrollText,
  LuSearch,
  LuShield,
  LuShoppingBag,
  LuSparkles,
  LuSwords,
  LuTrophy,
  LuUserRound,
} from "react-icons/lu";

/**
 * The lobby's navigation model.
 *
 * `href` values are literal route strings so Next 16's typed-routes check
 * validates them at build time.
 */
export interface NavItem {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  icon: IconType;
  /** Requires a verified ID Card before the page has anything to show. */
  requiresAuth: boolean;
  /** Marked in the UI when the upstream API exposes no data for it. */
  unavailable?: boolean;
}

export const PRIMARY_NAV: NavItem[] = [
  {
    id: "search",
    label: "ID Card",
    sublabel: "Look up a player",
    href: "/search",
    icon: LuSearch,
    requiresAuth: false,
  },
  {
    id: "profile",
    label: "Profile",
    sublabel: "Rank & career",
    href: "/profile",
    icon: LuUserRound,
    requiresAuth: true,
  },
  {
    id: "war-records",
    label: "War Records",
    sublabel: "Match history",
    href: "/war-records",
    icon: LuHistory,
    requiresAuth: true,
  },
  {
    id: "heroes",
    label: "Heroes",
    sublabel: "Full roster",
    href: "/heroes",
    icon: LuSwords,
    requiresAuth: false,
  },
  {
    id: "skins",
    label: "Skins",
    sublabel: "No public data",
    href: "/skins",
    icon: LuPalette,
    requiresAuth: false,
    unavailable: true,
  },
];

export const RAIL_NAV: NavItem[] = [
  { id: "lobby", label: "Lobby", sublabel: "", href: "/", icon: LuLayoutGrid, requiresAuth: false },
  { id: "rank", label: "Rank", sublabel: "", href: "/profile", icon: LuCrown, requiresAuth: true },
  { id: "heroes", label: "Heroes", sublabel: "", href: "/heroes", icon: LuShield, requiresAuth: false },
  { id: "items", label: "Items", sublabel: "", href: "/skins", icon: LuBoxes, requiresAuth: false },
  { id: "codex", label: "Codex", sublabel: "", href: "/heroes", icon: LuBookOpen, requiresAuth: false },
  { id: "news", label: "Events", sublabel: "", href: "/skins", icon: LuScrollText, requiresAuth: false },
  { id: "shop", label: "Shop", sublabel: "", href: "/skins", icon: LuShoppingBag, requiresAuth: false },
  { id: "trophy", label: "Trophies", sublabel: "", href: "/profile", icon: LuTrophy, requiresAuth: true },
];

/** Game modes shown on the lobby dock. */
export interface GameMode {
  id: string;
  label: string;
  blurb: string;
  icon: IconType;
  accent: string;
  /** Modes are presentational only — this app has no matchmaking backend. */
  available: boolean;
}

export const GAME_MODES: GameMode[] = [
  {
    id: "classic",
    label: "Classic",
    blurb: "5v5 · All unlocks",
    icon: LuSwords,
    accent: "#38bdf8",
    available: false,
  },
  {
    id: "ranked",
    label: "Ranked",
    blurb: "Season ladder",
    icon: LuCrown,
    accent: "#eab839",
    available: false,
  },
  {
    id: "brawl",
    label: "Brawl",
    blurb: "10-player chaos",
    icon: LuSparkles,
    accent: "#f472b6",
    available: false,
  },
  {
    id: "custom",
    label: "Custom",
    blurb: "Private room",
    icon: LuGem,
    accent: "#34d399",
    available: false,
  },
];

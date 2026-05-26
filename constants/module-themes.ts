import {
  Apple,
  BatteryCharging,
  BookOpen,
  Brain,
  Dumbbell,
  HeartPulse,
  Leaf,
  Moon,
  Sunrise,
  User,
  type LucideIcon,
} from "lucide-react-native";

/**
 * Single source of truth for each module's visual identity.
 *
 * Every screen that surfaces a module (home grid, resources page, module
 * detail) should pull its icon + colors from here so that the styling stays
 * consistent and any tweaks happen in one place.
 *
 * Icon choices are intentionally unique across modules — earlier we had
 * duplicates (Heart used for both Sleep and Recovery, Zap for Energy and
 * Stress, etc.) which made the grid look repetitive at a glance.
 */
export interface ModuleTheme {
  /** Stable slug used for routing and as a key in module data. */
  slug: string;
  /** lucide-react-native icon component. Render with `<Icon size={...} color={...} />`. */
  Icon: LucideIcon;
  /** Color used for the icon stroke and as a deep-tint accent. */
  iconColor: string;
  /** Pastel background tint used on cards, chips, and section backgrounds. */
  backgroundColor: string;
  /** Body / heading text color used on top of `backgroundColor`. */
  textColor: string;
  /** Short label for module headers (e.g. "Energy Management"). */
  shortName: string;
}

export const MODULE_THEMES: Record<string, ModuleTheme> = {
  sleep: {
    slug: "sleep",
    Icon: Moon,
    iconColor: "#8B7AB8",
    backgroundColor: "#E5D9F2",
    textColor: "#6B5B8C",
    shortName: "Sleep",
  },
  "morning-routines": {
    slug: "morning-routines",
    Icon: Sunrise,
    iconColor: "#D4A574",
    backgroundColor: "#FFF3DC",
    textColor: "#B8884D",
    shortName: "Morning Routines",
  },
  "energy-management": {
    slug: "energy-management",
    Icon: BatteryCharging,
    iconColor: "#5D9B8B",
    backgroundColor: "#D4F1E8",
    textColor: "#4A7D6F",
    shortName: "Energy Management",
  },
  mindfulness: {
    slug: "mindfulness",
    Icon: Leaf,
    iconColor: "#A87BC9",
    backgroundColor: "#EADBF7",
    textColor: "#7B5299",
    shortName: "Creativity",
  },
  "move-2-perform": {
    slug: "move-2-perform",
    Icon: HeartPulse,
    iconColor: "#7BA8C9",
    backgroundColor: "#DBE9F7",
    textColor: "#5278A8",
    shortName: "Recovery",
  },
  "thinking-2-perform": {
    slug: "thinking-2-perform",
    Icon: Brain,
    iconColor: "#C97BA8",
    backgroundColor: "#F7DBF0",
    textColor: "#A35D85",
    shortName: "Thinking 2 Perform",
  },
  recovery: {
    slug: "recovery",
    Icon: Dumbbell,
    iconColor: "#6B9BD1",
    backgroundColor: "#D9E9F7",
    textColor: "#5278A8",
    shortName: "Move 2 Perform",
  },
  "fuel-2-perform": {
    slug: "fuel-2-perform",
    Icon: Apple,
    iconColor: "#D97B7B",
    backgroundColor: "#FFDDD9",
    textColor: "#B85D5D",
    shortName: "Fuel 2 Perform",
  },
  "stress-management": {
    slug: "stress-management",
    Icon: User,
    iconColor: "#C9A87B",
    backgroundColor: "#F7EADB",
    textColor: "#997D5C",
    shortName: "Most Authentic You",
  },
  habits: {
    slug: "habits",
    Icon: BookOpen,
    iconColor: "#7BC9A8",
    backgroundColor: "#DBF7EA",
    textColor: "#52997D",
    shortName: "Building Habits",
  },
};

/** Canonical display order for modules. */
export const MODULE_ORDER = [
  "sleep",
  "morning-routines",
  "energy-management",
  "mindfulness",
  "move-2-perform",
  "thinking-2-perform",
  "recovery",
  "fuel-2-perform",
  "stress-management",
  "habits",
] as const satisfies ReadonlyArray<keyof typeof MODULE_THEMES>;

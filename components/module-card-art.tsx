import type { ImageSourcePropType } from "react-native";

/**
 * Painted background art for home module cards.
 * Images live in assets/images/home/ (compressed JPEGs).
 */
export const MODULE_CARD_BACKGROUNDS: Record<string, ImageSourcePropType> = {
  sleep: require("@/assets/images/home/module-bg-sleep.jpg"),
  "morning-routines": require("@/assets/images/home/module-bg-morning.jpg"),
  "energy-management": require("@/assets/images/home/module-bg-energy.jpg"),
  mindfulness: require("@/assets/images/home/module-bg-creativity.jpg"),
  "move-2-perform": require("@/assets/images/home/module-bg-recovery.jpg"),
  "thinking-2-perform": require("@/assets/images/home/module-bg-thinking.jpg"),
  recovery: require("@/assets/images/home/module-bg-move.jpg"),
  "fuel-2-perform": require("@/assets/images/home/module-bg-fuel.jpg"),
  "stress-management": require("@/assets/images/home/module-bg-authentic.jpg"),
  habits: require("@/assets/images/home/module-bg-habits.jpg"),
};

/**
 * Dark fade for dark mode — white text on painted art.
 * Sleep has no overlay (art is already dark enough).
 */
export const MODULE_CARD_DARK_SCRIMS: Partial<
  Record<string, readonly [string, string]>
> = {
  "morning-routines": ["rgba(20, 12, 8, 0.20)", "rgba(12, 8, 4, 0.55)"],
  "energy-management": ["rgba(8, 20, 16, 0.20)", "rgba(4, 12, 10, 0.55)"],
  mindfulness: ["rgba(18, 10, 24, 0.20)", "rgba(10, 6, 16, 0.55)"],
  "move-2-perform": ["rgba(8, 14, 22, 0.20)", "rgba(4, 8, 14, 0.55)"],
  "thinking-2-perform": ["rgba(22, 10, 18, 0.20)", "rgba(14, 6, 12, 0.55)"],
  recovery: ["rgba(8, 14, 22, 0.20)", "rgba(4, 8, 14, 0.55)"],
  "fuel-2-perform": ["rgba(22, 10, 8, 0.20)", "rgba(14, 6, 4, 0.55)"],
  "stress-management": ["rgba(20, 14, 8, 0.20)", "rgba(12, 8, 4, 0.55)"],
  habits: ["rgba(8, 20, 14, 0.20)", "rgba(4, 12, 8, 0.55)"],
};

/** @deprecated Use MODULE_CARD_DARK_SCRIMS */
export const MODULE_CARD_SCRIMS = MODULE_CARD_DARK_SCRIMS;

/**
 * Soft white brighten overlay for light mode — dark text on painted art.
 * Sleep has no overlay (always uses white text on dark art).
 */
export const MODULE_CARD_BRIGHTEN_SCRIMS: Partial<
  Record<string, readonly [string, string]>
> = {
  "morning-routines": ["rgba(255,255,255,0.40)", "rgba(255,255,255,0.58)"],
  "energy-management": ["rgba(255,255,255,0.40)", "rgba(255,255,255,0.58)"],
  mindfulness: ["rgba(255,255,255,0.40)", "rgba(255,255,255,0.58)"],
  "move-2-perform": ["rgba(255,255,255,0.40)", "rgba(255,255,255,0.58)"],
  "thinking-2-perform": ["rgba(255,255,255,0.40)", "rgba(255,255,255,0.58)"],
  recovery: ["rgba(255,255,255,0.40)", "rgba(255,255,255,0.58)"],
  "fuel-2-perform": ["rgba(255,255,255,0.40)", "rgba(255,255,255,0.58)"],
  "stress-management": ["rgba(255,255,255,0.40)", "rgba(255,255,255,0.58)"],
  habits: ["rgba(255,255,255,0.40)", "rgba(255,255,255,0.58)"],
};

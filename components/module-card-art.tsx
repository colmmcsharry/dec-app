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
 * Dark fade for Sleep only (light text on dark art).
 */
export const MODULE_CARD_SCRIMS: Partial<
  Record<string, readonly [string, string]>
> = {
  sleep: ["rgba(15, 10, 30, 0)", "rgba(10, 6, 22, 0.35)"],
};

/**
 * Soft white brighten overlay for light cards — lifts the art so dark text pops.
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

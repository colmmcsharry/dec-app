import type { ImageSourcePropType } from "react-native";

/**
 * Painted background art for home module cards.
 * Images live in assets/images/home/.
 */
export const MODULE_CARD_BACKGROUNDS: Record<string, ImageSourcePropType> = {
  sleep: require("@/assets/images/home/module-bg-sleep.png"),
  "morning-routines": require("@/assets/images/home/module-bg-morning.png"),
  "energy-management": require("@/assets/images/home/module-bg-energy.png"),
  mindfulness: require("@/assets/images/home/module-bg-creativity.png"),
  "move-2-perform": require("@/assets/images/home/module-bg-recovery.png"),
  "thinking-2-perform": require("@/assets/images/home/module-bg-thinking.png"),
  recovery: require("@/assets/images/home/module-bg-move.png"),
  "fuel-2-perform": require("@/assets/images/home/module-bg-fuel.png"),
  "stress-management": require("@/assets/images/home/module-bg-authentic.png"),
  habits: require("@/assets/images/home/module-bg-habits.png"),
};

/**
 * Light scrims — keep mockup colors visible while protecting white text.
 */
export const MODULE_CARD_SCRIMS: Record<string, readonly [string, string]> = {
  sleep: ["rgba(20, 14, 40, 0.08)", "rgba(15, 10, 30, 0.55)"],
  "morning-routines": ["rgba(160, 80, 30, 0.05)", "rgba(120, 60, 20, 0.5)"],
  "energy-management": ["rgba(15, 70, 55, 0.06)", "rgba(10, 50, 40, 0.52)"],
  mindfulness: ["rgba(70, 40, 100, 0.06)", "rgba(45, 25, 70, 0.55)"],
  "move-2-perform": ["rgba(25, 55, 100, 0.06)", "rgba(15, 40, 70, 0.52)"],
  "thinking-2-perform": ["rgba(120, 40, 80, 0.06)", "rgba(80, 25, 55, 0.55)"],
  recovery: ["rgba(30, 55, 100, 0.06)", "rgba(20, 40, 75, 0.52)"],
  "fuel-2-perform": ["rgba(130, 40, 35, 0.06)", "rgba(90, 25, 25, 0.52)"],
  "stress-management": ["rgba(120, 85, 30, 0.06)", "rgba(80, 55, 20, 0.52)"],
  habits: ["rgba(20, 80, 60, 0.06)", "rgba(15, 55, 45, 0.52)"],
};

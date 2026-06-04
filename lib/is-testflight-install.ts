import { Platform } from "react-native";

let cached: boolean | null = null;

/**
 * True on iOS TestFlight builds. Returns false (never throws) when the native
 * module is missing — e.g. archive before `pod install` after adding expo-testflight.
 */
export function isTestFlightInstall(): boolean {
  if (__DEV__ || Platform.OS !== "ios") return false;
  if (cached !== null) return cached;

  try {
    const { requireNativeModule } = require("expo") as typeof import("expo");
    const mod = requireNativeModule("ExpoTestFlight") as {
      isTestFlight?: boolean;
    };
    cached = Boolean(mod.isTestFlight);
  } catch {
    cached = false;
  }

  return cached;
}

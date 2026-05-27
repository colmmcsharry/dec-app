import type { ConfigContext, ExpoConfig } from "expo/config";

import appJson from "./app.json";

/**
 * Expo config — merges app.json with optional env overrides for EAS builds.
 *
 * Set REVENUECAT_ANDROID_KEY locally (.env) or in EAS project secrets so the
 * Google Play API key is not committed if you prefer.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const base = appJson.expo;

  return {
    ...config,
    ...base,
    extra: {
      ...base.extra,
      revenueCatIosKey:
        process.env.REVENUECAT_IOS_KEY ?? base.extra?.revenueCatIosKey,
      revenueCatAndroidKey:
        process.env.REVENUECAT_ANDROID_KEY ?? base.extra?.revenueCatAndroidKey,
    },
  };
};

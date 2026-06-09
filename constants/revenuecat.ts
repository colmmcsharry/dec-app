/**
 * RevenueCat identifiers — keep iOS and Android aligned in the RevenueCat dashboard.
 * @see docs/ANDROID_REVENUECAT_SETUP.md
 */

/** Entitlement ID (RevenueCat → Product catalog → Entitlements). Legacy name — do not change without updating RevenueCat. */
export const PRO_ENTITLEMENT_ID = "Daily Diesel Pro";

/** Default offering shown by RevenueCatUI.Paywall (RevenueCat → Offerings). */
export const DEFAULT_OFFERING_ID = "default";

/** Google Play / App Store application ID — must match app.json and store consoles. */
export const APP_PACKAGE_NAME = "com.colmmcs.dailydiesel";

/**
 * App Store / Google Play product identifiers.
 * iOS (live in RevenueCat → Product catalog → Products):
 *   - dailydiesel_monthly
 *   - dailydiesel_yearly
 *   - dailydiesel_lifetime
 *
 * Create matching subscriptions/IAP on Google Play, then link them to the
 * same packages in RevenueCat → Offerings → default.
 */
export const STORE_PRODUCT_IDS = {
  monthly: "dailydiesel_monthly",
  yearly: "dailydiesel_yearly",
  lifetime: "dailydiesel_lifetime",
} as const;

/** RevenueCat offering package identifiers (Offerings → default). */
export const OFFERING_PACKAGE_IDS = {
  monthly: "$rc_monthly",
  yearly: "$rc_annual",
  lifetime: "$rc_lifetime",
} as const;

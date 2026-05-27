import Constants from "expo-constants";
import * as StoreReview from "expo-store-review";
import { Linking, Platform } from "react-native";

export const APP_STORE_ID = "6761314761";

export const PLAY_STORE_PACKAGE =
  Constants.expoConfig?.android?.package ?? "com.colmmcs.dailydiesel";

function getAppStoreReviewUrl(): string {
  return `https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`;
}

function getPlayStoreReviewUrl(): string {
  return (
    Constants.expoConfig?.android?.playStoreUrl ??
    `https://play.google.com/store/apps/details?id=${PLAY_STORE_PACKAGE}`
  );
}

/**
 * Native in-app review when available (iOS + Android).
 * Falls back to the App Store / Play Store listing page.
 */
export async function requestAppReview(): Promise<void> {
  if (Platform.OS === "web") return;

  if (await StoreReview.hasAction()) {
    await StoreReview.requestReview();
    return;
  }

  const url =
    Platform.OS === "ios" ? getAppStoreReviewUrl() : getPlayStoreReviewUrl();
  await Linking.openURL(url);
}

export function getReviewStoreLabel(): string {
  if (Platform.OS === "android") return "Google Play Store";
  if (Platform.OS === "ios") return "App Store";
  return "app store";
}

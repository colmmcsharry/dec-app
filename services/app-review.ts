import * as StoreReview from "expo-store-review";
import { Linking, Platform } from "react-native";

export const APP_STORE_ID = "6761314761";

function getAppStoreReviewUrl(): string {
  return `https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`;
}

/** Native in-app prompt when available; otherwise opens the App Store review page. */
export async function requestAppReview(): Promise<void> {
  if (Platform.OS === "ios" && (await StoreReview.isAvailableAsync())) {
    await StoreReview.requestReview();
    return;
  }

  if (Platform.OS === "ios") {
    await Linking.openURL(getAppStoreReviewUrl());
  }
}

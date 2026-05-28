import Constants from "expo-constants";
import { Platform } from "react-native";

export function canUseNativePdfViewer(): boolean {
  return Platform.OS === "android" && Constants.appOwnership !== "expo";
}

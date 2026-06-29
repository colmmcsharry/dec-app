import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTOPLAY_KEY = "__dd_video_autoplay";

/** Autoplay chains module videos after the user starts the first one. Default: on. */
export async function getVideoAutoplayEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(AUTOPLAY_KEY);
    if (value === null) return true;
    return value === "1";
  } catch {
    return true;
  }
}

export async function setVideoAutoplayEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(AUTOPLAY_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
}

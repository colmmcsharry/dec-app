import { File, Paths } from "expo-file-system";

import {
  EMPTY_TWO_DAY_BEGINNER_WEIGHTS,
  type TwoDayBeginnerWeights,
} from "@/data/two-day-beginner-program";

const LOG_FILENAME = "two_day_beginner_weights.json";

function getFile(): File {
  return new File(Paths.document, LOG_FILENAME);
}

export async function getTwoDayBeginnerWeights(): Promise<TwoDayBeginnerWeights> {
  try {
    const file = getFile();
    if (!file.exists) return { ...EMPTY_TWO_DAY_BEGINNER_WEIGHTS };
    const parsed = JSON.parse(await file.text()) as Partial<TwoDayBeginnerWeights>;
    return { ...EMPTY_TWO_DAY_BEGINNER_WEIGHTS, ...parsed };
  } catch {
    return { ...EMPTY_TWO_DAY_BEGINNER_WEIGHTS };
  }
}

export async function saveTwoDayBeginnerWeights(
  weights: TwoDayBeginnerWeights
): Promise<void> {
  try {
    const file = getFile();
    if (!file.exists) {
      file.create();
    }
    file.write(JSON.stringify(weights));
  } catch (error) {
    console.log("[TwoDayBeginnerLog] Error saving:", error);
  }
}

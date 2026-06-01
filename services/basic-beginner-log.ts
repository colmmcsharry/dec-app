import { File, Paths } from "expo-file-system";

import {
  EMPTY_BASIC_BEGINNER_WEIGHTS,
  type BasicBeginnerWeights,
} from "@/data/basic-beginner-program";

const LOG_FILENAME = "basic_beginner_weights.json";

function getFile(): File {
  return new File(Paths.document, LOG_FILENAME);
}

export async function getBasicBeginnerWeights(): Promise<BasicBeginnerWeights> {
  try {
    const file = getFile();
    if (!file.exists) return { ...EMPTY_BASIC_BEGINNER_WEIGHTS };
    const parsed = JSON.parse(await file.text()) as Partial<BasicBeginnerWeights>;
    return { ...EMPTY_BASIC_BEGINNER_WEIGHTS, ...parsed };
  } catch {
    return { ...EMPTY_BASIC_BEGINNER_WEIGHTS };
  }
}

export async function saveBasicBeginnerWeights(
  weights: BasicBeginnerWeights
): Promise<void> {
  try {
    const file = getFile();
    if (!file.exists) {
      file.create();
    }
    file.write(JSON.stringify(weights));
  } catch (error) {
    console.log("[BasicBeginnerLog] Error saving:", error);
  }
}

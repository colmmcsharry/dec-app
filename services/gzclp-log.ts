import { File, Paths } from "expo-file-system";

import {
  EMPTY_GZCLP_WEIGHTS,
  type GzclpWeights,
} from "@/data/gzclp-program";

const GZCLP_LOG_FILENAME = "gzclp_weights.json";

function getFile(): File {
  return new File(Paths.document, GZCLP_LOG_FILENAME);
}

export async function getGzclpWeights(): Promise<GzclpWeights> {
  try {
    const file = getFile();
    if (!file.exists) return { ...EMPTY_GZCLP_WEIGHTS };
    const parsed = JSON.parse(await file.text()) as Partial<GzclpWeights>;
    return { ...EMPTY_GZCLP_WEIGHTS, ...parsed };
  } catch {
    return { ...EMPTY_GZCLP_WEIGHTS };
  }
}

export async function saveGzclpWeights(weights: GzclpWeights): Promise<void> {
  try {
    const file = getFile();
    if (!file.exists) {
      file.create();
    }
    file.write(JSON.stringify(weights));
  } catch (error) {
    console.log("[GzclpLog] Error saving:", error);
  }
}

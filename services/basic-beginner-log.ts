import { File, Paths } from "expo-file-system";

import {
  EMPTY_BASIC_BEGINNER_WEIGHTS,
  type BasicBeginnerWeights,
} from "@/data/basic-beginner-program";
import type { WeightUnit } from "@/lib/weight-unit";

const LOG_FILENAME = "basic_beginner_weights.json";

export type BasicBeginnerLog = {
  unit: WeightUnit;
  weights: BasicBeginnerWeights;
};

function getFile(): File {
  return new File(Paths.document, LOG_FILENAME);
}

const DEFAULT_LOG: BasicBeginnerLog = {
  unit: "kg",
  weights: { ...EMPTY_BASIC_BEGINNER_WEIGHTS },
};

function normalizeLog(parsed: unknown): BasicBeginnerLog {
  if (!parsed || typeof parsed !== "object") return { ...DEFAULT_LOG };

  const record = parsed as Partial<BasicBeginnerLog & BasicBeginnerWeights>;

  if (record.weights && typeof record.weights === "object") {
    return {
      unit: record.unit === "lb" ? "lb" : "kg",
      weights: { ...EMPTY_BASIC_BEGINNER_WEIGHTS, ...record.weights },
    };
  }

  return {
    unit: "kg",
    weights: { ...EMPTY_BASIC_BEGINNER_WEIGHTS, ...record },
  };
}

export async function getBasicBeginnerLog(): Promise<BasicBeginnerLog> {
  try {
    const file = getFile();
    if (!file.exists) return { ...DEFAULT_LOG };
    const parsed = JSON.parse(await file.text()) as unknown;
    return normalizeLog(parsed);
  } catch {
    return { ...DEFAULT_LOG };
  }
}

/** @deprecated Use getBasicBeginnerLog — kept for any external callers. */
export async function getBasicBeginnerWeights(): Promise<BasicBeginnerWeights> {
  const log = await getBasicBeginnerLog();
  return log.weights;
}

export async function saveBasicBeginnerLog(log: BasicBeginnerLog): Promise<void> {
  try {
    const file = getFile();
    if (!file.exists) {
      file.create();
    }
    file.write(JSON.stringify(log));
  } catch (error) {
    console.log("[BasicBeginnerLog] Error saving:", error);
  }
}

export async function saveBasicBeginnerWeights(
  weights: BasicBeginnerWeights
): Promise<void> {
  const log = await getBasicBeginnerLog();
  await saveBasicBeginnerLog({ ...log, weights });
}

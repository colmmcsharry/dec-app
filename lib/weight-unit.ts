export type WeightUnit = "kg" | "lb";

const LB_TO_KG = 0.453592;
const KG_TO_LB = 2.20462;

/** Convert a logged weight when the display unit changes. */
export function convertWeightString(
  value: string,
  from: WeightUnit,
  to: WeightUnit
): string {
  const trimmed = value.trim();
  if (!trimmed || from === to) return value;

  const num = Number.parseFloat(trimmed);
  if (!Number.isFinite(num)) return value;

  if (to === "lb") {
    return String(Math.round(num * KG_TO_LB * 2) / 2);
  }

  return String(Math.round(num * LB_TO_KG * 4) / 4);
}

export function convertWeightsRecord<T extends Record<string, string>>(
  weights: T,
  from: WeightUnit,
  to: WeightUnit
): T {
  if (from === to) return weights;

  const next = { ...weights };
  for (const key of Object.keys(weights) as (keyof T)[]) {
    next[key] = convertWeightString(weights[key], from, to) as T[keyof T];
  }
  return next;
}

export function weightUnitShortLabel(unit: WeightUnit): string {
  return unit === "kg" ? "kg" : "lb";
}

export function weightUnitHint(unit: WeightUnit): string {
  return unit === "kg"
    ? "Showing weights in kilograms (kg)."
    : "Showing weights in pounds (lbs).";
}

export type StrengthStandardsOption = {
  id: "basic" | "detailed";
  title: string;
  subtitle: string;
  description: string;
  route: "/strength-fitness-targets/basic" | "/strength-fitness-targets/detailed";
};

export const STRENGTH_STANDARDS_OPTIONS: StrengthStandardsOption[] = [
  {
    id: "basic",
    title: "Basic Strength & Fitness Targets",
    subtitle: "Quick benchmarks by level",
    description:
      "Beginner, intermediate, and advanced targets for chin-ups, push-ups, squats, and running.",
    route: "/strength-fitness-targets/basic",
  },
  {
    id: "detailed",
    title: "Detailed Weight Lifting Standards",
    subtitle: "Relative strength guide",
    description:
      "In-depth benchmarks with bodyweight multipliers, kg/lb examples, and training timelines.",
    route: "/strength-fitness-targets/detailed",
  },
];

export const STRENGTH_STANDARDS_HUB = {
  title: "Strength and Fitness Targets",
  subtitle: "Choose a guide to get started",
  summary:
    "Start with the basic targets for a quick overview, or open the detailed guide for relative strength standards across all major lifts.",
};

export const STRENGTH_STANDARDS_MORE_DETAILS_PROMPT =
  "Want some more detailed info on strength standards?";

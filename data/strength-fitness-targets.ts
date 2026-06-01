export type StrengthTargetRow = {
  label: string;
  men: string;
  women: string;
};

export type StrengthTargetLevel = {
  id: "beginner" | "intermediate" | "advanced";
  title: string;
  table?: StrengthTargetRow[];
  note?: string;
  runningGoals?: string[];
};

export const STRENGTH_FITNESS_INTRO = {
  title: "Strength and Fitness Targets",
  subtitle: "Benchmarks to aim for at each level",
  summary:
    "Use these as guideposts for your training — not strict pass/fail tests. Compare men's and women's targets side by side, and work toward the level that matches where you are now.",
};

export const STRENGTH_FITNESS_DISCLAIMER =
  "Chin-ups, push-ups, and squats must be FULL range of motion reps — no cheating.";

export const INTERMEDIATE_SQUAT_NOTE =
  "Additional bodyweight on the bar means matching your bodyweight on the barbell — e.g. if you weigh 75 kg, have 75 kg on your back.";

export const STRENGTH_FITNESS_LEVELS: StrengthTargetLevel[] = [
  {
    id: "beginner",
    title: "Beginner Strength and Fitness Goals",
    table: [
      {
        label: "Chin-ups",
        men: "3 chin-ups",
        women: "1 chin-up",
      },
      {
        label: "Push-ups",
        men: "10 push-ups",
        women: "5 push-ups",
      },
      {
        label: "Squats",
        men: "20 bodyweight squats",
        women: "20 bodyweight squats",
      },
    ],
    runningGoals: ["Run 5 km without stopping"],
  },
  {
    id: "intermediate",
    title: "Intermediate Strength and Fitness Goals",
    note: INTERMEDIATE_SQUAT_NOTE,
    table: [
      {
        label: "Chin-ups",
        men: "10 chin-ups",
        women: "5 chin-ups",
      },
      {
        label: "Push-ups",
        men: "20 push-ups",
        women: "10 push-ups",
      },
      {
        label: "Squats",
        men: "3+ squats with additional bodyweight on bar",
        women: "3+ squats with additional bodyweight on bar",
      },
    ],
    runningGoals: [
      "Run 5 km in under 30 minutes",
      "Run 10 km in under 1 hour",
    ],
  },
  {
    id: "advanced",
    title: "Advanced Strength and Fitness Goals",
    table: [
      {
        label: "Chin-ups",
        men: "15+ chin-ups",
        women: "10 chin-ups",
      },
      {
        label: "Push-ups",
        men: "30+ push-ups",
        women: "15 push-ups",
      },
      {
        label: "Bench Press",
        men: "Bodyweight bench press for 3+ reps",
        women: "Bench press 0.75× bodyweight for 1+ rep",
      },
      {
        label: "Squat",
        men: "1.5× bodyweight for 3+ reps",
        women: "1.5× bodyweight for 3+ reps",
      },
    ],
    runningGoals: [
      "Run 5 km in under 20 minutes",
      "Run 10 km in under 40 minutes",
    ],
  },
];

export const STRENGTH_FITNESS_TIPS = [
  "These are goals to work toward over time — progress beats perfection.",
  "If you can't hit a target yet, keep training consistently and track improvement.",
  "Depending on your natural body type, limb length, etc, some people will be better at pushing than pulling, and vice versa. So you might hit Advanced in press ups, whilst still being Intermediate at chins ups, or vice versa.",
  "Generally, men are much stronger than women in the upper body, whilst lower body strength tends to be closer.",
];

export type GzclpWorkoutId = "day1" | "day2" | "day3" | "day4";

export type GzclpWeights = {
  squat: string;
  bench: string;
  deadlift: string;
  overheadPress: string;
  latPulldown: string;
  bentOverRow: string;
};

export type GzclpWorkoutExercise = {
  liftId: keyof GzclpWeights;
  name: string;
  tier: "T1" | "T2" | "T3";
  setsReps: string;
};

export type GzclpWorkout = {
  id: GzclpWorkoutId;
  label: string;
  exercises: GzclpWorkoutExercise[];
};

export type GzclpLift = {
  id: keyof GzclpWeights;
  name: string;
  roles: string;
  progression: string;
};

export const GZCLP_PDF_KEY = "gzclp-training-guide";

export const GZCLP_WORKOUTS: GzclpWorkout[] = [
  {
    id: "day1",
    label: "Day 1",
    exercises: [
      {
        liftId: "squat",
        name: "Squat",
        tier: "T1",
        setsReps: "5 × 3+",
      },
      {
        liftId: "bench",
        name: "Bench Press",
        tier: "T2",
        setsReps: "3 × 10",
      },
      {
        liftId: "latPulldown",
        name: "Lat Pulldown",
        tier: "T3",
        setsReps: "3 × 15+",
      },
    ],
  },
  {
    id: "day2",
    label: "Day 2",
    exercises: [
      {
        liftId: "overheadPress",
        name: "Overhead Press",
        tier: "T1",
        setsReps: "5 × 3+",
      },
      {
        liftId: "deadlift",
        name: "Deadlift",
        tier: "T2",
        setsReps: "3 × 10",
      },
      {
        liftId: "bentOverRow",
        name: "Bent-Over Row",
        tier: "T3",
        setsReps: "3 × 15+",
      },
    ],
  },
  {
    id: "day3",
    label: "Day 3",
    exercises: [
      {
        liftId: "bench",
        name: "Bench Press",
        tier: "T1",
        setsReps: "5 × 3+",
      },
      {
        liftId: "squat",
        name: "Squat",
        tier: "T2",
        setsReps: "3 × 10",
      },
      {
        liftId: "latPulldown",
        name: "Lat Pulldown",
        tier: "T3",
        setsReps: "3 × 15+",
      },
    ],
  },
  {
    id: "day4",
    label: "Day 4",
    exercises: [
      {
        liftId: "deadlift",
        name: "Deadlift",
        tier: "T1",
        setsReps: "5 × 3+",
      },
      {
        liftId: "overheadPress",
        name: "Overhead Press",
        tier: "T2",
        setsReps: "3 × 10",
      },
      {
        liftId: "bentOverRow",
        name: "Bent-Over Row",
        tier: "T3",
        setsReps: "3 × 15+",
      },
    ],
  },
];

export const GZCLP_LIFTS: GzclpLift[] = [
  {
    id: "squat",
    name: "Squat",
    roles: "T1 on Day 1 (5×3+), T2 on Day 3 (3×10)",
    progression:
      "Add 5 kg / 10 lb when you complete all sets at that tier.",
  },
  {
    id: "bench",
    name: "Bench Press",
    roles: "T2 on Day 1 (3×10), T1 on Day 3 (5×3+)",
    progression:
      "Add 2.5 kg / 5 lb when you complete all sets at that tier.",
  },
  {
    id: "deadlift",
    name: "Deadlift",
    roles: "T2 on Day 2 (3×10), T1 on Day 4 (5×3+)",
    progression:
      "Add 5 kg / 10 lb when you complete all sets at that tier.",
  },
  {
    id: "overheadPress",
    name: "Overhead Press",
    roles: "T1 on Day 2 (5×3+), T2 on Day 4 (3×10)",
    progression:
      "Add 2.5 kg / 5 lb when you complete all sets at that tier.",
  },
  {
    id: "latPulldown",
    name: "Lat Pulldown",
    roles: "T3 on Day 1 (3×15+), T3 on Day 3 (3×15+)",
    progression:
      "Add 2.5 kg / 5 lb when you get 25+ reps on your last set.",
  },
  {
    id: "bentOverRow",
    name: "Bent-Over Row",
    roles: "T3 on Day 2 (3×15+), T3 on Day 4 (3×15+)",
    progression:
      "Add 2.5 kg / 5 lb when you get 25+ reps on your last set.",
  },
];

export const EMPTY_GZCLP_WEIGHTS: GzclpWeights = {
  squat: "",
  bench: "",
  deadlift: "",
  overheadPress: "",
  latPulldown: "",
  bentOverRow: "",
};

export const GZCLP_INTRO = {
  title: "GZCLP — Intermediate Routine",
  subtitle: "Linear progression after your first few months in the gym",
  summary:
    "GZCLP trains 3 days per week using 4 different workouts (Day 1–4). Each main lift appears twice: once heavy (T1) and once lighter (T2). Back work is lat pulldowns and bent-over rows. Best after 3 months on a simpler starter plan. The “+” means your last set is as many good reps as you can manage.",
};

export const GZCLP_DETAILED_GUIDE_URL =
  "https://thefitness.wiki/routines/gzclp/";

export const GZCLP_POPULAR_NOTE =
  "GZCLP is one of the most popular strength programs online, used by millions worldwide. This guide covers the essentials — for progression stages, rest times, and the full program breakdown, see the detailed guide linked below.";

export const GZCLP_WEEKLY_SCHEDULE = [
  "Week 1: Mon Day 1 · Wed Day 2 · Fri Day 3",
  "Week 2: Mon Day 4 · Wed Day 1 · Fri Day 2",
  "Week 3: Mon Day 3 · Wed Day 4 · Fri Day 1",
  "Keep rotating through all 4 days — always 3 gym days per week.",
];

export const GZCLP_TIER_GUIDE = [
  "T1 — heaviest main lift (5 × 3+ with AMRAP on the last set).",
  "T2 — same lifts, lighter weight (3 × 10).",
  "T3 — back & arm support work (3 × 15+ with AMRAP on the last set).",
];

export const GZCLP_STARTER_TIPS = [
  "Start lighter than you think — perfect form beats heavy weight.",
  "Rest 2–3 minutes between T1 sets, 2 minutes on T2, 60–90 seconds on T3.",
  "Log your weights here after each gym visit.",
  "If you miss reps, repeat the same weight next time before adding load.",
];

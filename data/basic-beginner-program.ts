export type BasicBeginnerWeights = {
  barbellRow: string;
  benchPress: string;
  squat: string;
  chinup: string;
  overheadPress: string;
  deadlift: string;
};

export type BasicBeginnerLift = {
  id: keyof BasicBeginnerWeights;
  name: string;
  workout: "A" | "B";
  setsReps: string;
  progression: string;
};

export const BASIC_BEGINNER_PDF_KEY = "basic-beginner-routine";

export const BASIC_BEGINNER_INTRO = {
  title: "3 Day Basic Beginner Routine",
  subtitle: "Simple barbell training to get started",
  summary:
    "A short, easy-to-follow 3-day plan built around five barbell lifts plus chin-ups. Alternate Workout A and B with a rest day between each gym day. The “+” on each lift means your last set is as many good reps as you can manage — stop when form breaks down or the bar slows.",
};

export const BASIC_BEGINNER_WHO_FOR = [
  "Complete beginners to barbell strength training.",
  "Anyone who wants a simple habit to build before moving to a bigger program.",
];

export const BASIC_BEGINNER_HOW_LONG = [
  "Run this for up to 3 months.",
  "After that, move to a more comprehensive plan — GZCLP (Intermediate routine in this app) is a great next step.",
];

export const BASIC_BEGINNER_WORKOUT_A = [
  "Barbell Row — 3 × 5+",
  "Bench Press — 3 × 5+",
  "Squat — 3 × 5+",
];

export const BASIC_BEGINNER_WORKOUT_B = [
  "Chin-ups (or equivalent) — 3 × 5+",
  "Overhead Press — 3 × 5+",
  "Deadlift — 3 × 5+",
];

export const BASIC_BEGINNER_SCHEDULE = [
  "Alternate Workout A and Workout B with one full rest day between lifting days.",
  "Typical schedule: Mon A · Wed B · Fri A, then B · A · B the following week.",
  "Do all sets of one lift, then move to the next.",
  "Rest 2–3 minutes between sets (up to 5 minutes between exercises if needed).",
];

export const BASIC_BEGINNER_PROGRESSION = [
  "Upper body (Row, Bench, OHP, Chin-up): add 2.5 lb / 1.25 kg each session.",
  "Lower body (Squat, Deadlift): add 5 lb / 2.5 kg each session.",
  "Weight is added to the total bar — not per side.",
  "If you get more than 10 reps on your last set, add 5 lb / 2.5 kg (upper) or 10 lb / 5 kg (lower) instead.",
  "If you fail to hit 15 total reps for a lift, deload 10% next time and build back up.",
];

export const BASIC_BEGINNER_CARDIO = [
  "Do at least 2 days of cardio per week, on any days you like.",
  "One lower-intensity day — brisk walk, light jog, easy cycling (15–30 min).",
  "One higher-intensity day — intervals, circuits, or anything that feels challenging (10–15 min).",
  "If cardio is on a lifting day, do it after the weights.",
];

export const BASIC_BEGINNER_FAQ = [
  {
    question: "How do I find starting weights?",
    answer:
      "Start with an empty bar for 5 reps. If it’s easy with good form, add 10–20 lb and go again. Keep adding until form breaks down or the bar slows — that’s your starting weight. Be conservative.",
  },
  {
    question: "What if I can’t do chin-ups?",
    answer:
      "Use a lat pulldown machine or an assisted chin-up machine. Log the weight you use.",
  },
  {
    question: "How do I add 2.5 lb without micro plates?",
    answer:
      "Bring your own 1.25 lb plates, add 5 lb every other session, or add a fourth set at the same weight.",
  },
];

export const BASIC_BEGINNER_LIFTS: BasicBeginnerLift[] = [
  {
    id: "barbellRow",
    name: "Barbell Row",
    workout: "A",
    setsReps: "3 × 5+",
    progression: "Add 2.5 lb / 1.25 kg when you complete all sets.",
  },
  {
    id: "benchPress",
    name: "Bench Press",
    workout: "A",
    setsReps: "3 × 5+",
    progression: "Add 2.5 lb / 1.25 kg when you complete all sets.",
  },
  {
    id: "squat",
    name: "Squat",
    workout: "A",
    setsReps: "3 × 5+",
    progression: "Add 5 lb / 2.5 kg when you complete all sets.",
  },
  {
    id: "chinup",
    name: "Chin-ups (or equivalent)",
    workout: "B",
    setsReps: "3 × 5+",
    progression:
      "Add 2.5 lb / 1.25 kg (assisted weight) or reps when you complete all sets.",
  },
  {
    id: "overheadPress",
    name: "Overhead Press",
    workout: "B",
    setsReps: "3 × 5+",
    progression: "Add 2.5 lb / 1.25 kg when you complete all sets.",
  },
  {
    id: "deadlift",
    name: "Deadlift",
    workout: "B",
    setsReps: "3 × 5+",
    progression: "Add 5 lb / 2.5 kg when you complete all sets.",
  },
];

export const EMPTY_BASIC_BEGINNER_WEIGHTS: BasicBeginnerWeights = {
  barbellRow: "",
  benchPress: "",
  squat: "",
  chinup: "",
  overheadPress: "",
  deadlift: "",
};

export const BASIC_BEGINNER_TIPS = [
  "This is meant to be simple — focus on form and showing up consistently.",
  "The last set is not to absolute failure — leave 1–2 reps in the tank.",
  "Log your weights here after each gym visit.",
  "It’s normal if the workout feels short — that’s by design.",
];

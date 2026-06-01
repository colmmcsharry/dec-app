export type TwoDayBeginnerWeights = {
  squat: string;
  benchPress: string;
  rows: string;
  deadlift: string;
  latPulldownOrChinup: string;
  standingPress: string;
};

export type TwoDayBeginnerLift = {
  id: keyof TwoDayBeginnerWeights;
  name: string;
  setsReps: string;
};

export type ExerciseAlternative = {
  primary: string;
  options: string[];
};

export const TWO_DAY_BEGINNER_PDF_KEY = "two-day-beginner-routine";

export const TWO_DAY_BEGINNER_INTRO = {
  title: "2 Day Basic Beginner Routine",
  subtitle: "One full-body workout, twice a week",
  summary:
    "Do the same workout twice a week with 2–3 rest days between sessions (e.g. Monday and Thursday). Every lift is trained both days — so each movement gets hit twice per week. Use a weight where you can get 8–12 reps on your work sets; when you hit 12 reps on all 3 sets, add the smallest amount of weight next time.",
};

export const TWO_DAY_BEGINNER_SCHEDULE = [
  "Train 2 days per week with 2–3 rest days between sessions.",
  "Same workout both days — e.g. Monday and Thursday, or Monday and Friday.",
  "Each lift is done twice per week (once per session).",
  "Rest 2–3 minutes between work sets.",
];

export const TWO_DAY_BEGINNER_WORKOUT = [
  "Squat — 3 × 8–12",
  "Bench Press — 3 × 8–12",
  "Rows — 3 × 8–12",
  "Deadlift — 1 × 5",
  "Lat Pulldown OR Chin-ups — 3 × 8–12",
  "Standing Barbell Press — 3 × 8–12",
];

export const TWO_DAY_BEGINNER_WARMUP = [
  "Do 2 warm-up sets for each exercise before your work sets.",
  "Set 1: lightest possible weight for 10 easy reps.",
  "Set 2: add a little weight and do 5 reps.",
  "Then add more weight and begin your work sets as listed above.",
];

export const TWO_DAY_BEGINNER_REPS_EXPLAINED = [
  "3 × 8–12 means 3 sets of 8 to 12 reps.",
  "If you can’t get 8 reps, the weight is too heavy — go lighter until you can hit 8+ on all 3 sets.",
  "When you get 12 reps on all 3 sets, increase by the smallest amount and use that weight next session.",
];

export const TWO_DAY_BEGINNER_SUPERSET_TIP = [
  "Optionally superset opposing exercises — e.g. bench press then rows, alternating sets with very little rest in between.",
  "Your chest works while your back rests, and vice versa.",
  "This may not be practical in a busy gym.",
];

export const TWO_DAY_BEGINNER_STARTING_TIPS = [
  "Start lighter than you think — too light beats too heavy on your first sessions.",
  "Many people can’t lift a 20 kg barbell at first. Use 5, 10, or 15 kg bars if your gym has them.",
  "If you substitute an exercise, stick with it for several months — don’t swap every week.",
  "Wait until you plateau before changing movements.",
];

export const TWO_DAY_BEGINNER_ALTERNATIVES: ExerciseAlternative[] = [
  {
    primary: "Bench Press",
    options: [
      "Dumbbell Bench Press",
      "Chest Machine Press",
      "Push-ups or Dips (add weight if strong enough)",
    ],
  },
  {
    primary: "Rows",
    options: ["Barbell Row", "Machine Row", "TRX Row"],
  },
  {
    primary: "Standing Barbell Press",
    options: [
      "Standing or Seated Dumbbell Press",
      "Machine Shoulder Press",
    ],
  },
  {
    primary: "Squat",
    options: [
      "Lunges (add weight)",
      "Leg Press Machine",
      "Step-ups (add weight)",
    ],
  },
  {
    primary: "Deadlift",
    options: ["Hamstring Curl Machine"],
  },
];

export const TWO_DAY_BEGINNER_LIFTS: TwoDayBeginnerLift[] = [
  {
    id: "squat",
    name: "Squat",
    setsReps: "3 × 8–12",
  },
  {
    id: "benchPress",
    name: "Bench Press",
    setsReps: "3 × 8–12",
  },
  {
    id: "rows",
    name: "Rows",
    setsReps: "3 × 8–12",
  },
  {
    id: "deadlift",
    name: "Deadlift",
    setsReps: "1 × 5",
  },
  {
    id: "latPulldownOrChinup",
    name: "Lat Pulldown or Chin-ups",
    setsReps: "3 × 8–12",
  },
  {
    id: "standingPress",
    name: "Standing Barbell Press",
    setsReps: "3 × 8–12",
  },
];

export const EMPTY_TWO_DAY_BEGINNER_WEIGHTS: TwoDayBeginnerWeights = {
  squat: "",
  benchPress: "",
  rows: "",
  deadlift: "",
  latPulldownOrChinup: "",
  standingPress: "",
};

export const TWO_DAY_BEGINNER_TIPS = [
  "This program hits every major and minor muscle group in each session.",
  "Log your weights here after each gym visit.",
  "Pick one chin-up or lat pulldown option and stay consistent with it.",
];

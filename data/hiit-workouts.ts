export const HIIT_WORKOUTS_INTRO = {
  title: "HIIT Workouts",
  subtitle: "5 30-min workouts that can be done anywhere, no equipment needed.",
  excerpt:
    "Five circuits to choose from — superset each exercise pair for 3 rounds.",
};

export const HIIT_WORKOUTS_INSTRUCTIONS = [
  "For each exercise pair, work for 30 seconds, then rest for 30.",
  "Eg. Plank Jacks 30 secs on, 30 secs rest, then Squat Jumps 30 secs on, 30 secs off, and repeat that 3 times. Then take 1 min rest, then onto the next pair.",
  "Remember, each exercise is scalable. So if you can't do full push ups, do them on your knees or partial reps.",
  "If you want to make it extra challenging, increase the time on, decrease the time off! Eg. 40 secs on, 20 secs off.",
];

export const HIIT_PAIR_PROTOCOL =
  "Superset 3 rounds — 30 seconds on, 30 seconds off for each exercise.";

export const HIIT_FINISHER_PROTOCOL =
  "Final round — one exercise, 3 times, 30 seconds on / 30 seconds off.";

export const HIIT_REST_BETWEEN_PAIRS = "1 min rest";

export type HiitWorkoutPair = {
  exerciseA: string;
  exerciseB: string;
};

export type HiitWorkout = {
  id: string;
  title: string;
  /** Full description — truncated on list cards, shown in full on detail page */
  description: string;
  pairs: HiitWorkoutPair[];
  /** Single exercise for the last round (3×30s on / 30s off) */
  finisher: string;
};

export const HIIT_WORKOUTS: HiitWorkout[] = [
  {
    id: "daily-refuel",
    title: "The Daily Refuel",
    description:
      "A quick, high-intensity daily spark designed to recharge your battery and spike your metabolism.",
    pairs: [
      { exerciseA: "Plank Jacks", exerciseB: "Squat Jumps" },
      { exerciseA: "Plank Ups", exerciseB: "Forward Lunges" },
      { exerciseA: "Burpees", exerciseB: "Hip Taps" },
    ],
    finisher: "Frog Squat",
  },
  {
    id: "turbocharge",
    title: "Turbocharge",
    description:
      "A fast and furious interval session focused on explosive movements to shift your energy into overdrive.",
    pairs: [
      { exerciseA: "Seal Jacks", exerciseB: "Push Ups to Row" },
      { exerciseA: "Reverse Lunges", exerciseB: "Shoulder Taps" },
      { exerciseA: "Squat Pulses", exerciseB: "Plank Hold" },
    ],
    finisher: "Mountain Climbers",
  },
  {
    id: "premium-unleaded",
    title: "Premium Unleaded",
    description:
      "A high-octane, bodyweight-only circuit that proves you do not need extra equipment to burn major fuel.",
    pairs: [
      { exerciseA: "Burpee Hops", exerciseB: "Walking Push Up" },
      { exerciseA: "Plyometric Lunges", exerciseB: "Bird Dog" },
      { exerciseA: "Sit Through", exerciseB: "Squat Hold" },
    ],
    finisher: "Bear Walk",
  },
  {
    id: "ignition-circuit",
    title: "The Ignition Circuit",
    description:
      "A fiery, heart-pumping warm-up or short HIIT block engineered to jump-start motivation on sluggish days.",
    pairs: [
      { exerciseA: "Jumping Jacks", exerciseB: "Push Ups" },
      { exerciseA: "Squats", exerciseB: "Jump Ins" },
      { exerciseA: "Lateral Lunges", exerciseB: "Plank Rotations" },
    ],
    finisher: "Grasshoppers",
  },
  {
    id: "zero-to-sixty",
    title: "Zero to Sixty",
    description:
      "A progressive interval workout where the speed and intensity crank up higher with every passing round.",
    pairs: [
      { exerciseA: "Walking Lunges", exerciseB: "Squat Thrusters" },
      { exerciseA: "Push Ups to Tap", exerciseB: "Reverse Lunge & Kick" },
      { exerciseA: "Side Planks", exerciseB: "Split Squat Hold" },
    ],
    finisher: "Crab Walk / Reverse Plank",
  },
];

export const HIIT_IMAGE_FOOTER =
  "Want all these workouts in one image? Download or Print this!";

export const HIIT_WORKOUTS_IMAGE = require("@/assets/images/hiit-workouts.png");

export function getHiitWorkout(id: string): HiitWorkout | undefined {
  return HIIT_WORKOUTS.find((workout) => workout.id === id);
}

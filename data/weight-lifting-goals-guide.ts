export type WeightUnit = "kg" | "lb";

export type GuideLift = {
  name: string;
  multiplier: number;
};

export type GuideExample = {
  bodyWeightLabel: string;
  timeframe: string;
  bullets: string[];
};

export type GuideGenderSection = {
  title: string;
  intro: string;
  repNote: string;
  lifts: GuideLift[];
  example: Record<WeightUnit, GuideExample>;
};

export type GuideLevel = {
  id: string;
  male: GuideGenderSection;
  female: GuideGenderSection;
};

export const WEIGHT_LIFTING_GUIDE_SOURCE_URL =
  "https://caliberstrong.com/blog/weight-lifting-goals/";

export const WEIGHT_LIFTING_GUIDE_REP_NOTE =
  "Note: each of these strength goals is for just 1 rep – NOT a set of multiple reps.";

export const WEIGHT_LIFTING_GUIDE_INTRO = [
  "As fitness professionals, we are often asked about long-term weight lifting goals.",
  "That is, how much should you aim to lift in each of your major exercises – such as the squat, bench press, deadlift, and military press – and how long should it take for you to get there?",
  "These are good questions, since these numbers can serve as important markers of your progress as you continue to get bigger and stronger, allowing you to gauge whether you're on track with everything.",
  "As far as weight lifting goals go, one of the best indicators of your progress is something called relative strength.",
  "This is a measure of how much you are able to lift for certain core exercises, relative to your current body weight.",
  "In this guide, you'll find benchmarks to assess where you currently are, which areas (if any) are lagging behind – and most importantly, what you can expect going forward.",
];

export const WEIGHT_LIFTING_GUIDE_BOTTOM_LINE = [
  "While the above standards should serve as useful guidelines to help gauge your progress, they should not be taken as absolute.",
  "Every person is different, and some people are naturally better suited for certain exercises, and are comparatively weaker in others.",
  "For example, guys with longer arms will often excel at deadlifting as opposed to bench pressing. In turn, guys with shorter arms will generally have a stronger bench press relative to their deadlift.",
  "Squatting is often easier for guys with shorter femurs compared to guys with longer femurs.",
  "And heavier guys, with higher percentages of body fat, may find pull-ups particularly challenging compared to the other 4 exercises.",
  "That being said, these standards should serve as a useful ideal – and also help you figure out if you have certain muscle groups that are disproportionately weaker or stronger.",
  "Finally, don't feel that you have to reach the Advanced or Highly Advanced levels to have a lean, muscular physique.",
  "In fact, most guys will look very muscular after they have reached the Intermediate level, which can be done in just 1–2 years.",
];

function liftLine(lift: GuideLift): string {
  return `${lift.name}: body weight × ${lift.multiplier}`;
}

const BEGINNER_MALE_LIFTS: GuideLift[] = [
  { name: "Barbell Squat", multiplier: 1.2 },
  { name: "Barbell Bench Press", multiplier: 0.9 },
  { name: "Barbell Deadlift", multiplier: 1.5 },
  { name: "Pull-up / Chin-up", multiplier: 0.9 },
  { name: "Seated Military Press", multiplier: 0.6 },
];

const BEGINNER_FEMALE_LIFTS: GuideLift[] = [
  { name: "Barbell Squat", multiplier: 0.79 },
  { name: "Barbell Bench Press", multiplier: 0.48 },
  { name: "Barbell Deadlift", multiplier: 0.97 },
  { name: "Pull-up / Chin-up", multiplier: 0.9 },
  { name: "Seated Military Press", multiplier: 0.28 },
];

const INTERMEDIATE_MALE_LIFTS: GuideLift[] = [
  { name: "Barbell Squat", multiplier: 1.5 },
  { name: "Barbell Bench Press", multiplier: 1.1 },
  { name: "Barbell Deadlift", multiplier: 1.75 },
  { name: "Pull-up / Chin-up", multiplier: 1.1 },
  { name: "Seated Military Press", multiplier: 0.75 },
];

const INTERMEDIATE_FEMALE_LIFTS: GuideLift[] = [
  { name: "Barbell Squat", multiplier: 1.19 },
  { name: "Barbell Bench Press", multiplier: 0.78 },
  { name: "Barbell Deadlift", multiplier: 1.43 },
  { name: "Pull-up / Chin-up", multiplier: 1.1 },
  { name: "Seated Military Press", multiplier: 0.51 },
];

const ADVANCED_MALE_LIFTS: GuideLift[] = [
  { name: "Barbell Squat", multiplier: 2 },
  { name: "Barbell Bench Press", multiplier: 1.5 },
  { name: "Barbell Deadlift", multiplier: 2.4 },
  { name: "Pull-up / Chin-up", multiplier: 1.5 },
  { name: "Seated Military Press", multiplier: 0.9 },
];

const ADVANCED_FEMALE_LIFTS: GuideLift[] = [
  { name: "Barbell Squat", multiplier: 1.68 },
  { name: "Barbell Bench Press", multiplier: 1.14 },
  { name: "Barbell Deadlift", multiplier: 1.97 },
  { name: "Pull-up / Chin-up", multiplier: 1.41 },
  { name: "Seated Military Press", multiplier: 0.79 },
];

const HIGHLY_ADVANCED_MALE_LIFTS: GuideLift[] = [
  { name: "Barbell Squat", multiplier: 2.5 },
  { name: "Barbell Bench Press", multiplier: 1.9 },
  { name: "Barbell Deadlift", multiplier: 3 },
  { name: "Pull-up / Chin-up", multiplier: 1.9 },
  { name: "Seated Military Press", multiplier: 1.15 },
];

const HIGHLY_ADVANCED_FEMALE_LIFTS: GuideLift[] = [
  { name: "Barbell Squat", multiplier: 2.22 },
  { name: "Barbell Bench Press", multiplier: 1.56 },
  { name: "Barbell Deadlift", multiplier: 2.57 },
  { name: "Pull-up / Chin-up", multiplier: 1.7 },
  { name: "Seated Military Press", multiplier: 1.12 },
];

export const WEIGHT_LIFTING_GUIDE_LEVELS: GuideLevel[] = [
  {
    id: "beginner",
    male: {
      title: "Beginner Weightlifting Goals (Male)",
      intro:
        "Within 6–12 months of proper training, the average guy should be able to achieve the following levels of strength in these core exercises:",
      repNote:
        "Note: each of these strength goals is for just 1 rep – NOT a set of multiple reps.",
      lifts: BEGINNER_MALE_LIFTS,
      example: {
        lb: {
          bodyWeightLabel: "180 lbs",
          timeframe: "6–12 months",
          bullets: [
            "Squat 215 lbs (for 1 rep)",
            "Bench press 160 lbs (for 1 rep)",
            "Deadlift 270 lbs (for 1 rep)",
            "Do 1 assisted pull-up with 160 lbs of total weight (body weight – 20 lbs)",
            "Seated military press 110 lbs (for 1 rep)",
          ],
        },
        kg: {
          bodyWeightLabel: "80 kg",
          timeframe: "6–12 months",
          bullets: [
            "Squat 95 kg (for 1 rep)",
            "Bench press 70 kg (for 1 rep)",
            "Deadlift 120 kg (for 1 rep)",
            "Do 1 assisted pull-up with 70 kg of total weight (body weight – 10 kg)",
            "Seated military press 50 kg (for 1 rep)",
          ],
        },
      },
    },
    female: {
      title: "Beginner Weightlifting Goals (Female)",
      intro:
        "Within 6–12 months of proper training, the average woman should be able to achieve the following levels of strength in these core exercises:",
      repNote:
        "Note: each of these strength goals is for just 1 rep – NOT a set of multiple reps.",
      lifts: BEGINNER_FEMALE_LIFTS,
      example: {
        lb: {
          bodyWeightLabel: "120 lbs",
          timeframe: "6–12 months",
          bullets: [
            "Squat 95 lbs (for 1 rep)",
            "Bench press 58 lbs (for 1 rep)",
            "Deadlift 117 lbs (for 1 rep)",
            "Do 1 assisted pull-up with 109 lbs of total weight (body weight – 11 lbs)",
            "Seated military press 34 lbs (for 1 rep)",
          ],
        },
        kg: {
          bodyWeightLabel: "55 kg",
          timeframe: "6–12 months",
          bullets: [
            "Squat 43 kg (for 1 rep)",
            "Bench press 26 kg (for 1 rep)",
            "Deadlift 53 kg (for 1 rep)",
            "Do 1 assisted pull-up with 50 kg of total weight (body weight – 5 kg)",
            "Seated military press 15 kg (for 1 rep)",
          ],
        },
      },
    },
  },
  {
    id: "intermediate",
    male: {
      title: "Intermediate Weightlifting Goals (Male)",
      intro:
        "Within 1–2 years of proper training, the average guy should be able to achieve the following levels of strength in these core exercises:",
      repNote:
        "Note: each of these strength goals is for just 1 rep – NOT a set of multiple reps.",
      lifts: INTERMEDIATE_MALE_LIFTS,
      example: {
        lb: {
          bodyWeightLabel: "180 lbs",
          timeframe: "1–2 years",
          bullets: [
            "Squat 270 lbs (for 1 rep)",
            "Bench press 200 lbs (for 1 rep)",
            "Deadlift 315 lbs (for 1 rep)",
            "Do 1 pull-up with 200 lbs of total weight (body weight + 20 lbs on dip belt)",
            "Seated military press 135 lbs (for 1 rep)",
          ],
        },
        kg: {
          bodyWeightLabel: "80 kg",
          timeframe: "1–2 years",
          bullets: [
            "Squat 120 kg (for 1 rep)",
            "Bench press 90 kg (for 1 rep)",
            "Deadlift 140 kg (for 1 rep)",
            "Do 1 pull-up with 90 kg of total weight (body weight + 10 kg on dip belt)",
            "Seated military press 60 kg (for 1 rep)",
          ],
        },
      },
    },
    female: {
      title: "Intermediate Weightlifting Goals (Female)",
      intro:
        "Within 1–2 years of proper training, the average woman should be able to achieve the following levels of strength in these core exercises:",
      repNote:
        "Note: each of these strength goals is for just 1 rep – NOT a set of multiple reps.",
      lifts: INTERMEDIATE_FEMALE_LIFTS,
      example: {
        lb: {
          bodyWeightLabel: "120 lbs",
          timeframe: "1–2 years",
          bullets: [
            "Squat 143 lbs (for 1 rep)",
            "Bench press 93 lbs (for 1 rep)",
            "Deadlift 171 lbs (for 1 rep)",
            "Do 1 pull-up with 138 lbs of total weight (body weight + 18 lbs on dip belt)",
            "Seated military press 61 lbs (for 1 rep)",
          ],
        },
        kg: {
          bodyWeightLabel: "55 kg",
          timeframe: "1–2 years",
          bullets: [
            "Squat 65 kg (for 1 rep)",
            "Bench press 43 kg (for 1 rep)",
            "Deadlift 79 kg (for 1 rep)",
            "Do 1 pull-up with 63 kg of total weight (body weight + 8 kg on dip belt)",
            "Seated military press 28 kg (for 1 rep)",
          ],
        },
      },
    },
  },
  {
    id: "advanced",
    male: {
      title: "Advanced Weight Lifting Goals (Male)",
      intro:
        "Within 5 years of proper training, the average guy should be able to achieve the following levels of strength in these core exercises:",
      repNote:
        "Note: each of these strength goals is for just 1 rep – NOT a set of multiple reps.",
      lifts: ADVANCED_MALE_LIFTS,
      example: {
        lb: {
          bodyWeightLabel: "180 lbs",
          timeframe: "5 years",
          bullets: [
            "Squat 360 lbs (for 1 rep)",
            "Bench press 270 lbs (for 1 rep)",
            "Deadlift 430 lbs (for 1 rep)",
            "Do 1 pull-up with 270 lbs of total weight (body weight + 90 lbs on dip belt)",
            "Seated military press 160 lbs (for 1 rep)",
          ],
        },
        kg: {
          bodyWeightLabel: "80 kg",
          timeframe: "5 years",
          bullets: [
            "Squat 160 kg (for 1 rep)",
            "Bench press 120 kg (for 1 rep)",
            "Deadlift 190 kg (for 1 rep)",
            "Do 1 pull-up with 120 kg of total weight (body weight + 40 kg on dip belt)",
            "Seated military press 70 kg (for 1 rep)",
          ],
        },
      },
    },
    female: {
      title: "Advanced Weight Lifting Goals (Female)",
      intro:
        "Within 5 years of proper training, the average woman should be able to achieve the following levels of strength in these core exercises:",
      repNote:
        "Note: each of these strength goals is for just 1 rep – NOT a set of multiple reps.",
      lifts: ADVANCED_FEMALE_LIFTS,
      example: {
        lb: {
          bodyWeightLabel: "120 lbs",
          timeframe: "5 years",
          bullets: [
            "Squat 202 lbs (for 1 rep)",
            "Bench press 137 lbs (for 1 rep)",
            "Deadlift 237 lbs (for 1 rep)",
            "Do 1 pull-up with 170 lbs of total weight (body weight + 50 lbs on dip belt)",
            "Seated military press 95 lbs (for 1 rep)",
          ],
        },
        kg: {
          bodyWeightLabel: "55 kg",
          timeframe: "5 years",
          bullets: [
            "Squat 92 kg (for 1 rep)",
            "Bench press 63 kg (for 1 rep)",
            "Deadlift 108 kg (for 1 rep)",
            "Do 1 pull-up with 78 kg of total weight (body weight + 23 kg on dip belt)",
            "Seated military press 43 kg (for 1 rep)",
          ],
        },
      },
    },
  },
  {
    id: "highly-advanced",
    male: {
      title: "Highly Advanced Weightlifting Goals (Male)",
      intro:
        "Within 10 years of proper training, the average guy should be able to achieve the following levels of strength in these core exercises.",
      repNote:
        "Note: each of these strength goals is for just 1 rep – NOT a set of multiple reps.",
      lifts: HIGHLY_ADVANCED_MALE_LIFTS,
      example: {
        lb: {
          bodyWeightLabel: "180 lbs",
          timeframe: "10 years",
          bullets: [
            "Squat 450 lbs (for 1 rep)",
            "Bench press 340 lbs (for 1 rep)",
            "Deadlift 540 lbs (for 1 rep)",
            "Do 1 pull-up with 340 lbs of total weight (body weight + 160 lbs on dip belt)",
            "Seated military press 205 lbs (for 1 rep)",
          ],
        },
        kg: {
          bodyWeightLabel: "80 kg",
          timeframe: "10 years",
          bullets: [
            "Squat 200 kg (for 1 rep)",
            "Bench press 150 kg (for 1 rep)",
            "Deadlift 240 kg (for 1 rep)",
            "Do 1 pull-up with 150 kg of total weight (body weight + 70 kg on dip belt)",
            "Seated military press 90 kg (for 1 rep)",
          ],
        },
      },
    },
    female: {
      title: "Highly Advanced Weightlifting Goals (Female)",
      intro:
        "Within 10 years of proper training, the average woman should be able to achieve the following levels of strength in these core exercises.",
      repNote:
        "Note: each of these strength goals is for just 1 rep – NOT a set of multiple reps.",
      lifts: HIGHLY_ADVANCED_FEMALE_LIFTS,
      example: {
        lb: {
          bodyWeightLabel: "120 lbs",
          timeframe: "10 years",
          bullets: [
            "Squat 267 lbs (for 1 rep)",
            "Bench press 187 lbs (for 1 rep)",
            "Deadlift 308 lbs (for 1 rep)",
            "Do 1 pull-up with 200 lbs of total weight (body weight + 80 lbs on dip belt)",
            "Seated military press 135 lbs (for 1 rep)",
          ],
        },
        kg: {
          bodyWeightLabel: "55 kg",
          timeframe: "10 years",
          bullets: [
            "Squat 122 kg (for 1 rep)",
            "Bench press 86 kg (for 1 rep)",
            "Deadlift 141 kg (for 1 rep)",
            "Do 1 pull-up with 94 kg of total weight (body weight + 39 kg on dip belt)",
            "Seated military press 62 kg (for 1 rep)",
          ],
        },
      },
    },
  },
];

export function getGuideGenderContent(
  section: GuideGenderSection,
  unit: WeightUnit
) {
  return {
    title: section.title,
    intro: section.intro,
    repNote: section.repNote,
    liftLines: section.lifts.map((lift) => liftLine(lift)),
    example: section.example[unit],
  };
}

export function getExampleIntro(example: GuideExample): string {
  return `This means that if you weigh ${example.bodyWeightLabel}, within ${example.timeframe} of proper training you should be able to:`;
}

import {
  BASIC_BEGINNER_INTRO,
  BASIC_BEGINNER_PDF_KEY,
} from "@/data/basic-beginner-program";
import { GZCLP_INTRO, GZCLP_PDF_KEY } from "@/data/gzclp-program";
import {
  TWO_DAY_BEGINNER_INTRO,
  TWO_DAY_BEGINNER_PDF_KEY,
} from "@/data/two-day-beginner-program";

export type GymRoutineLevel = "Beginner" | "Intermediate";

export type GymRoutine = {
  id: string;
  title: string;
  subtitle: string;
  level: GymRoutineLevel;
  description: string;
  pdfKey: string;
};

export const GYM_ROUTINES: GymRoutine[] = [
  {
    id: "basic-beginner",
    title: BASIC_BEGINNER_INTRO.title,
    subtitle: BASIC_BEGINNER_INTRO.subtitle,
    level: "Beginner",
    description:
      "The simplest way to start — 2 workouts, 6 lifts, 3 days per week. View the guide and log your weights.",
    pdfKey: BASIC_BEGINNER_PDF_KEY,
  },
  {
    id: "two-day-beginner",
    title: TWO_DAY_BEGINNER_INTRO.title,
    subtitle: TWO_DAY_BEGINNER_INTRO.subtitle,
    level: "Beginner",
    description:
      "Only 2 gym days per week — one full-body workout repeated twice, with 8–12 rep progression.",
    pdfKey: TWO_DAY_BEGINNER_PDF_KEY,
  },
  {
    id: "gzclp",
    title: GZCLP_INTRO.title,
    subtitle: GZCLP_INTRO.subtitle,
    level: "Intermediate",
    description:
      "4 rotating workouts with tiered progression — for when you’re ready to move beyond the basics.",
    pdfKey: GZCLP_PDF_KEY,
  },
];

export function getFeaturedGymRoutine(): GymRoutine {
  return GYM_ROUTINES[0];
}

export function getGymRoutine(id: string): GymRoutine | undefined {
  return GYM_ROUTINES.find((routine) => routine.id === id);
}

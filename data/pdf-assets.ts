/**
 * Static require() registry for bundled PDF files.
 * Each module's PDFs are keyed by a human-readable id.
 */

export interface PdfEntry {
  id: string;
  title: string;
  asset: number; // return type of require() for assets
}

export type ModulePdfs = Record<string, PdfEntry[]>;

export const MODULE_PDFS: ModulePdfs = {
  sleep: [
    {
      id: "1-week-for-better-sleep",
      title: "1 Week for Better Sleep",
      asset: require("../assets/pdfs/module1/1-week-for-better-sleep.pdf"),
    },
    {
      id: "evening-time-audit",
      title: "Evening-Time Audit",
      asset: require("../assets/pdfs/module1/Evening-time-audit.pdf"),
    },
    {
      id: "journaling-made-simple",
      title: "Journaling Made Simple",
      asset: require("../assets/pdfs/module1/Journaling-made-simple.pdf"),
    },
  ],

  "morning-routines": [
    {
      id: "today-priorities",
      title: "Today's Priorities",
      asset: require("../assets/pdfs/module2/Today-priorities.pdf"),
    },
    {
      id: "rise-and-shine-routine",
      title: "Your Go-To Rise & Shine Routine",
      asset: require("../assets/pdfs/module2/Your-go-to-Rise-and-Shine-routine.pdf"),
    },
  ],

  "energy-management": [
    {
      id: "track-your-energy",
      title: "Track Your Energy",
      asset: require("../assets/pdfs/module3/Track-your-energy.pdf"),
    },
    {
      id: "email-cheatsheet",
      title: "Your Email Cheatsheet",
      asset: require("../assets/pdfs/module3/Your-email-cheatsheet.pdf"),
    },
    {
      id: "email-templates",
      title: "Time-Saving Email Templates",
      asset: require("../assets/pdfs/module3/Time_saving_email-templates.pdf"),
    },
    {
      id: "plan-time-wisely",
      title: "Plan & Use Your Time Wisely",
      asset: require("../assets/pdfs/module3/Plan-use-your-time-wisely.pdf"),
    },
    {
      id: "stay-energized",
      title: "Stay Energized",
      asset: require("../assets/pdfs/module3/Stay-energized.pdf"),
    },
    {
      id: "procrastination-buster",
      title: "Procrastination Buster",
      asset: require("../assets/pdfs/module3/Procrastination-buster.pdf"),
    },
    {
      id: "weekly-review",
      title: "Weekly Review",
      asset: require("../assets/pdfs/module3/Weekly_Review.pdf"),
    },
  ],

  mindfulness: [
    {
      id: "nine-dot-problem",
      title: "The 9-Dot Problem",
      asset: require("../assets/pdfs/module4/The-nine-dot-problem.pdf"),
    },
    {
      id: "best-creative-solutions",
      title: "Your Best Creative Solutions",
      asset: require("../assets/pdfs/module4/Your-best-creative-solutions.pdf"),
    },
    {
      id: "difficult-decisions",
      title: "How to Make Difficult Decisions",
      asset: require("../assets/pdfs/module4/How-to-make-difficult-decisions.pdf"),
    },
  ],

  "move-2-perform": [
    {
      id: "evening-downtime-plan",
      title: "Evening Downtime Plan",
      asset: require("../assets/pdfs/module5/Evening-downtime-plan.pdf"),
    },
    {
      id: "outsource-or-not",
      title: "To Outsource or Not to Outsource",
      asset: require("../assets/pdfs/module5/To-outsource-or-not-to-outsource.pdf"),
    },
    {
      id: "holiday-reflection",
      title: "Holiday Reflection",
      asset: require("../assets/pdfs/module5/Holiday-reflection.pdf"),
    },
  ],

  "thinking-2-perform": [
    {
      id: "healthy-thinking",
      title: "Healthy Thinking",
      asset: require("../assets/pdfs/module6/Healthy-thinking.pdf"),
    },
  ],

  recovery: [
    {
      id: "make-exercise-a-habit",
      title: "Make Exercise a Habit",
      asset: require("../assets/pdfs/module7/Make-exercise-a-habit.pdf"),
    },
  ],

  "fuel-2-perform": [
    {
      id: "eating-for-performance",
      title: "Eating for Performance",
      asset: require("../assets/pdfs/module8/Eating-for-performance.pdf"),
    },
    {
      id: "macronutrients",
      title: "Macronutrients",
      asset: require("../assets/pdfs/module8/Macronutrients.pdf"),
    },
    {
      id: "food-diary",
      title: "Food Diary",
      asset: require("../assets/pdfs/module8/Food-diary.pdf"),
    },
    {
      id: "food-journal-continuation",
      title: "Food Journal Continuation Plan",
      asset: require("../assets/pdfs/module8/Food-journal-continuation-plan.pdf"),
    },
    {
      id: "hydrating-for-performance",
      title: "Hydrating for Performance",
      asset: require("../assets/pdfs/module8/Hydrating-for-performance.pdf"),
    },
    {
      id: "wild-side-shopping",
      title: "Eating on the Wild Side — Shopping List",
      asset: require("../assets/pdfs/module8/EatingOnWildSide_ShoppingList_2020.pdf"),
    },
  ],

  "stress-management": [
    {
      id: "public-speaking-tips",
      title: "Public Speaking Improvement Tips",
      asset: require("../assets/pdfs/module9/Public-speaking-improvement-tips.pdf"),
    },
    {
      id: "assertiveness-action-plan",
      title: "Assertiveness Action Plan",
      asset: require("../assets/pdfs/module9/Assertiveness-action-plan.pdf"),
    },
    {
      id: "assertive-rights",
      title: "Assertive Rights",
      asset: require("../assets/pdfs/module9/Assertive-rights.pdf"),
    },
    {
      id: "confidence-building",
      title: "Confidence Building",
      asset: require("../assets/pdfs/module9/Confidence-building.pdf"),
    },
  ],

  habits: [
    {
      id: "weekly-key-3",
      title: "Weekly Key 3",
      asset: require("../assets/pdfs/module10/Weekly-Key-3.pdf"),
    },
    {
      id: "wheel-of-life",
      title: "Wheel of Life",
      asset: require("../assets/pdfs/module10/Wheel-of-life.pdf"),
    },
  ],
};

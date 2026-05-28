/**
 * Worksheet PDFs keyed by module slug.
 * Files are hosted remotely — see data/pdf-catalog.ts and extra.pdfBaseUrl.
 */

export interface PdfEntry {
  id: string;
  title: string;
}

export type ModulePdfs = Record<string, PdfEntry[]>;

export const MODULE_PDFS: ModulePdfs = {
  sleep: [
    {
      id: "1-week-for-better-sleep",
      title: "1 Week for Better Sleep",
    },
    {
      id: "evening-time-audit",
      title: "Evening-Time Audit",
    },
    {
      id: "journaling-made-simple",
      title: "Journaling Made Simple",
    },
  ],

  "morning-routines": [
    {
      id: "today-priorities",
      title: "Today's Priorities",
    },
    {
      id: "rise-and-shine-routine",
      title: "Your Go-To Rise & Shine Routine",
    },
  ],

  "energy-management": [
    {
      id: "track-your-energy",
      title: "Track Your Energy",
    },
    {
      id: "email-cheatsheet",
      title: "Your Email Cheatsheet",
    },
    {
      id: "email-templates",
      title: "Time-Saving Email Templates",
    },
    {
      id: "plan-time-wisely",
      title: "Plan & Use Your Time Wisely",
    },
    {
      id: "stay-energized",
      title: "Stay Energized",
    },
    {
      id: "procrastination-buster",
      title: "Procrastination Buster",
    },
    {
      id: "weekly-review",
      title: "Weekly Review",
    },
  ],

  mindfulness: [
    {
      id: "nine-dot-problem",
      title: "The 9-Dot Problem",
    },
    {
      id: "best-creative-solutions",
      title: "Your Best Creative Solutions",
    },
    {
      id: "difficult-decisions",
      title: "How to Make Difficult Decisions",
    },
  ],

  "move-2-perform": [
    {
      id: "evening-downtime-plan",
      title: "Evening Downtime Plan",
    },
    {
      id: "outsource-or-not",
      title: "To Outsource or Not to Outsource",
    },
    {
      id: "holiday-reflection",
      title: "Holiday Reflection",
    },
  ],

  "thinking-2-perform": [
    {
      id: "healthy-thinking",
      title: "Healthy Thinking",
    },
  ],

  recovery: [
    {
      id: "make-exercise-a-habit",
      title: "Make Exercise a Habit",
    },
  ],

  "fuel-2-perform": [
    {
      id: "eating-for-performance",
      title: "Eating for Performance",
    },
    {
      id: "macronutrients",
      title: "Macronutrients",
    },
    {
      id: "food-diary",
      title: "Food Diary",
    },
    {
      id: "food-journal-continuation",
      title: "Food Journal Continuation Plan",
    },
    {
      id: "hydrating-for-performance",
      title: "Hydrating for Performance",
    },
    {
      id: "wild-side-shopping",
      title: "Eating on the Wild Side — Shopping List",
    },
  ],

  "stress-management": [
    {
      id: "public-speaking-tips",
      title: "Public Speaking Improvement Tips",
    },
    {
      id: "assertiveness-action-plan",
      title: "Assertiveness Action Plan",
    },
    {
      id: "assertive-rights",
      title: "Assertive Rights",
    },
    {
      id: "confidence-building",
      title: "Confidence Building",
    },
  ],

  habits: [
    {
      id: "weekly-key-3",
      title: "Weekly Key 3",
    },
    {
      id: "wheel-of-life",
      title: "Wheel of Life",
    },
  ],
};

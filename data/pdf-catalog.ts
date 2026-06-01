/**
 * Remote PDF catalog — fetched from extra.pdfBaseUrl and cached on device.
 * Host files at: {pdfBaseUrl}/{remotePath}
 */
export type PdfCatalogEntry = {
  id: string;
  title: string;
  remotePath: string;
  /** First download can take 15–20+ seconds on slow connections. */
  large?: boolean;
};

export const PDF_CATALOG: Record<string, PdfCatalogEntry> = {
  "1-week-for-better-sleep": {
    id: "1-week-for-better-sleep",
    title: "1 Week for Better Sleep",
    remotePath: "pdfs/module1/1-week-for-better-sleep.pdf",
  },
  "10-step-guide-peak-performance": {
    id: "10-step-guide-peak-performance",
    title: "10-Step Guide to Peak Performance",
    remotePath: "pdfs/downloads/10-step-guide-peak-performance.pdf",
  },
  "10-tips-healthy-at-work": {
    id: "10-tips-healthy-at-work",
    title: "10 Tips to Stay Healthy at Work",
    remotePath: "pdfs/downloads/10-tips-healthy-at-work.pdf",
  },
  "30-day-detox": {
    id: "30-day-detox",
    title: "30 Day Detox",
    remotePath: "pdfs/downloads/30-day-detox.pdf",
  },
  "31-day-challenge-diet-dos-donts": {
    id: "31-day-challenge-diet-dos-donts",
    title: "31 Day Challenge — Diet Do's and Don'ts",
    remotePath: "pdfs/downloads/31-day-challenge-diet-dos-donts.pdf",
  },
  "31-days-drop-a-jean-size": {
    id: "31-days-drop-a-jean-size",
    title: "31 Days Drop a Jean Size — Vital Info",
    remotePath: "pdfs/downloads/31-days-drop-a-jean-size.pdf",
  },
  "7-days-kick-start-weight-loss": {
    id: "7-days-kick-start-weight-loss",
    title: "7 Days to Kick-Start Your Weight Loss Journey",
    remotePath: "pdfs/downloads/7-days-kick-start-weight-loss.pdf",
  },
  "assertive-rights": {
    id: "assertive-rights",
    title: "Assertive Rights",
    remotePath: "pdfs/module9/Assertive-rights.pdf",
  },
  "assertiveness-action-plan": {
    id: "assertiveness-action-plan",
    title: "Assertiveness Action Plan",
    remotePath: "pdfs/module9/Assertiveness-action-plan.pdf",
  },
  "best-creative-solutions": {
    id: "best-creative-solutions",
    title: "Your Best Creative Solutions",
    remotePath: "pdfs/module4/Your-best-creative-solutions.pdf",
  },
  "confidence-building": {
    id: "confidence-building",
    title: "Confidence Building",
    remotePath: "pdfs/module9/Confidence-building.pdf",
  },
  "course-book": {
    id: "course-book",
    title: "Course Book",
    remotePath: "documents/course-leaflet.pdf",
    large: true,
  },
  "difficult-decisions": {
    id: "difficult-decisions",
    title: "How to Make Difficult Decisions",
    remotePath: "pdfs/module4/How-to-make-difficult-decisions.pdf",
  },
  "eating-for-performance": {
    id: "eating-for-performance",
    title: "Eating for Performance",
    remotePath: "pdfs/module8/Eating-for-performance.pdf",
  },
  "email-cheatsheet": {
    id: "email-cheatsheet",
    title: "Your Email Cheatsheet",
    remotePath: "pdfs/module3/Your-email-cheatsheet.pdf",
  },
  "email-templates": {
    id: "email-templates",
    title: "Time-Saving Email Templates",
    remotePath: "pdfs/module3/Time_saving_email-templates.pdf",
  },
  "evening-downtime-plan": {
    id: "evening-downtime-plan",
    title: "Evening Downtime Plan",
    remotePath: "pdfs/module5/Evening-downtime-plan.pdf",
  },
  "evening-time-audit": {
    id: "evening-time-audit",
    title: "Evening-Time Audit",
    remotePath: "pdfs/module1/Evening-time-audit.pdf",
  },
  "food-diary": {
    id: "food-diary",
    title: "Food Diary",
    remotePath: "pdfs/module8/Food-diary.pdf",
  },
  "food-journal-continuation": {
    id: "food-journal-continuation",
    title: "Food Journal Continuation Plan",
    remotePath: "pdfs/module8/Food-journal-continuation-plan.pdf",
  },
  "healthy-thinking": {
    id: "healthy-thinking",
    title: "Healthy Thinking",
    remotePath: "pdfs/module6/Healthy-thinking.pdf",
  },
  "holiday-reflection": {
    id: "holiday-reflection",
    title: "Holiday Reflection",
    remotePath: "pdfs/module5/Holiday-reflection.pdf",
  },
  "how-to-lose-fat": {
    id: "how-to-lose-fat",
    title: "How to Lose Fat — A Definitive Guide",
    remotePath: "pdfs/downloads/how-to-lose-fat.pdf",
  },
  "hydrating-for-performance": {
    id: "hydrating-for-performance",
    title: "Hydrating for Performance",
    remotePath: "pdfs/module8/Hydrating-for-performance.pdf",
  },
  "journaling-made-simple": {
    id: "journaling-made-simple",
    title: "Journaling Made Simple",
    remotePath: "pdfs/module1/Journaling-made-simple.pdf",
  },
  "macronutrients": {
    id: "macronutrients",
    title: "Macronutrients",
    remotePath: "pdfs/module8/Macronutrients.pdf",
  },
  "magic-movement-guide": {
    id: "magic-movement-guide",
    title: "Magic Movement Guide",
    remotePath: "pdfs/downloads/magic-movement-guide.pdf",
  },
  "make-exercise-a-habit": {
    id: "make-exercise-a-habit",
    title: "Make Exercise a Habit",
    remotePath: "pdfs/module7/Make-exercise-a-habit.pdf",
  },
  "module-10-sheet1": {
    id: "module-10-sheet1",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module10/Module-10_sheet1.pdf",
  },
  "module-10-sheet2": {
    id: "module-10-sheet2",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module10/Module-10_sheet2.pdf",
  },
  "module-2-sheet1": {
    id: "module-2-sheet1",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module2/Module-2_sheet1.pdf",
  },
  "module-2-sheet2": {
    id: "module-2-sheet2",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module2/Module-2_sheet2.pdf",
  },
  "module-3-sheet1": {
    id: "module-3-sheet1",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module3/Module-3_sheet1.pdf",
  },
  "module-3-sheet2": {
    id: "module-3-sheet2",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module3/Module-3_sheet2.pdf",
  },
  "module-4-sheet1": {
    id: "module-4-sheet1",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module4/Module-4_sheet1.pdf",
  },
  "module-4-sheet2": {
    id: "module-4-sheet2",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module4/Module-4_sheet2.pdf",
  },
  "module-5-sheet1": {
    id: "module-5-sheet1",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module5/Module-5_sheet1.pdf",
  },
  "module-5-sheet2": {
    id: "module-5-sheet2",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module5/Module-5_sheet2.pdf",
  },
  "module-6-sheet1": {
    id: "module-6-sheet1",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module6/Module-6_sheet1.pdf",
  },
  "module-6-sheet2": {
    id: "module-6-sheet2",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module6/Module-6_sheet2.pdf",
  },
  "module-7-sheet1": {
    id: "module-7-sheet1",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module7/Module-7_sheet1.pdf",
  },
  "module-7-sheet2": {
    id: "module-7-sheet2",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module7/Module-7_sheet2.pdf",
  },
  "module-8-sheet1": {
    id: "module-8-sheet1",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module8/Module-8_sheet1.pdf",
  },
  "module-8-sheet2": {
    id: "module-8-sheet2",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module8/Module-8_sheet2.pdf",
  },
  "module-9-sheet1": {
    id: "module-9-sheet1",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module9/Module-9_sheet1.pdf",
  },
  "module-9-sheet2": {
    id: "module-9-sheet2",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module9/Module-9_sheet2.pdf",
  },
  "nine-dot-problem": {
    id: "nine-dot-problem",
    title: "The 9-Dot Problem",
    remotePath: "pdfs/module4/The-nine-dot-problem.pdf",
  },
  "outsource-or-not": {
    id: "outsource-or-not",
    title: "To Outsource or Not to Outsource",
    remotePath: "pdfs/module5/To-outsource-or-not-to-outsource.pdf",
  },
  "plan-time-wisely": {
    id: "plan-time-wisely",
    title: "Plan & Use Your Time Wisely",
    remotePath: "pdfs/module3/Plan-use-your-time-wisely.pdf",
  },
  "procrastination-buster": {
    id: "procrastination-buster",
    title: "Procrastination Buster",
    remotePath: "pdfs/module3/Procrastination-buster.pdf",
  },
  "public-speaking-tips": {
    id: "public-speaking-tips",
    title: "Public Speaking Improvement Tips",
    remotePath: "pdfs/module9/Public-speaking-improvement-tips.pdf",
  },
  "rise-and-shine-routine": {
    id: "rise-and-shine-routine",
    title: "Your Go-To Rise & Shine Routine",
    remotePath: "pdfs/module2/Your-go-to-Rise-and-Shine-routine.pdf",
  },
  "stay-energized": {
    id: "stay-energized",
    title: "Stay Energized",
    remotePath: "pdfs/module3/Stay-energized.pdf",
  },
  "today-priorities": {
    id: "today-priorities",
    title: "Today's Priorities",
    remotePath: "pdfs/module2/Today-priorities.pdf",
  },
  "track-your-energy": {
    id: "track-your-energy",
    title: "Track Your Energy",
    remotePath: "pdfs/module3/Track-your-energy.pdf",
  },
  "weekly-key-3": {
    id: "weekly-key-3",
    title: "Weekly Key 3",
    remotePath: "pdfs/module10/Weekly-Key-3.pdf",
  },
  "weekly-review": {
    id: "weekly-review",
    title: "Weekly Review",
    remotePath: "pdfs/module3/Weekly_Review.pdf",
  },
  "wheel-of-life": {
    id: "wheel-of-life",
    title: "Wheel of Life",
    remotePath: "pdfs/module10/Wheel-of-life.pdf",
  },
  "wild-side-shopping": {
    id: "wild-side-shopping",
    title: "Eating on the Wild Side — Shopping List",
    remotePath: "pdfs/module8/EatingOnWildSide_ShoppingList_2020.pdf",
  },
  "your-go-to-rise-shine-routine": {
    id: "your-go-to-rise-shine-routine",
    title: "Additional Resource",
    remotePath: "documents/module-resources/Module2/Your-go-to-Rise-&-Shine-routine.pdf",
  },
  "gzclp-training-guide": {
    id: "gzclp-training-guide",
    title: "GZCLP — Intermediate Routine",
    remotePath: "documents/gzclp-training-guide.pdf",
  },
  "basic-beginner-routine": {
    id: "basic-beginner-routine",
    title: "3 Day Basic Beginner Routine",
    remotePath: "documents/basic-beginner-routine.pdf",
  },
  "two-day-beginner-routine": {
    id: "two-day-beginner-routine",
    title: "2 Day Basic Beginner Routine",
    remotePath: "documents/two-day-beginner-routine.pdf",
  },
};

export function getPdfCatalogEntry(pdfKey: string): PdfCatalogEntry | undefined {
  return PDF_CATALOG[pdfKey];
}

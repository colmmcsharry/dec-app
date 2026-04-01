export interface WorkbookPlanSection {
  id: string;
  title: string;
  prompt: string;
}

export interface WorkbookAuditRow {
  time: string;
  activity: string;
}

export interface WorkbookPlanSectionData {
  action: string;
  dayNotes: string[];
}

export interface ModuleWorkbookData {
  weeklyPlan: Record<string, WorkbookPlanSectionData>;
  eveningAudits: {
    rows: WorkbookAuditRow[];
  }[];
  journalEntry: string;
}

export interface ModuleWorkbookDefinition {
  slug: string;
  title: string;
  moduleNumber: number;
  color: string;
  intro: string;
  weeklyPlanSections: WorkbookPlanSection[];
  journalPrompts: string[];
}

const DAY_COUNT = 7;
const AUDIT_BLOCKS = 2;
const AUDIT_ROWS_PER_BLOCK = 8;

export const MODULE_WORKBOOKS: Record<string, ModuleWorkbookDefinition> = {
  sleep: {
    slug: "sleep",
    title: "Peaceful & Restorative Sleep",
    moduleNumber: 1,
    color: "#E5D9F2",
    intro:
      "This digital workbook helps you apply the sleep module in the app instead of printing the leaflet. Your answers save automatically on your device.",
    weeklyPlanSections: [
      {
        id: "duringDay",
        title: "During the Day",
        prompt: "To improve my sleep, during the day I will:",
      },
      {
        id: "afterWork",
        title: "When I Get Home",
        prompt: "To improve my sleep, when I get home I will:",
      },
      {
        id: "sleepRunway",
        title: "Sleep Runway",
        prompt: "To improve my sleep, during my sleep runway (30-60 min. before bed) I will:",
      },
    ],
    journalPrompts: [
      "How did today go? How did I feel emotionally and energetically?",
      "Describe one thing that happened today which put a smile on your face.",
      "Are there 2-3 people or events which influenced your day for the better?",
      "Did you encounter any difficult situations today?",
      "Do you think that something happened today which you will never forget?",
    ],
  },
};

export function createInitialWorkbookData(
  definition: ModuleWorkbookDefinition
): ModuleWorkbookData {
  return {
    weeklyPlan: Object.fromEntries(
      definition.weeklyPlanSections.map((section) => [
        section.id,
        {
          action: "",
          dayNotes: Array.from({ length: DAY_COUNT }, () => ""),
        },
      ])
    ),
    eveningAudits: Array.from({ length: AUDIT_BLOCKS }, () => ({
      rows: Array.from({ length: AUDIT_ROWS_PER_BLOCK }, () => ({
        time: "",
        activity: "",
      })),
    })),
    journalEntry: "",
  };
}

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
  /** One flag per day — tap to tick off in the workbook UI. */
  daysCompleted: boolean[];
}

/** A block of educational reading content from the course PDFs. */
export interface ContentSection {
  heading: string;
  body: string;
}

/** A fill-in worksheet that lives alongside the reading content. */
export interface WorksheetField {
  id: string;
  label: string;
  placeholder?: string;
  /** Default true — use false for short single-line answers (e.g. 1–5 rating chips). */
  multiline?: boolean;
  /** `rating1to5` shows five horizontal tap chips (Module 3 energy check-ins). */
  inputKind?: "text" | "rating1to5";
}

/** An interactive worksheet card (free-text fields saved locally). */
export interface WorksheetDefinition {
  id: string;
  title: string;
  description: string;
  fields: WorksheetField[];
  /**
   * When set on the first worksheet of a PDF, the workbook shows a page divider.
   * Leave unset on follow-on sheets that belong to the same PDF.
   */
  digitalPageLabel?: string;
}

export interface ModuleWorkbookData {
  weeklyPlan: Record<string, WorkbookPlanSectionData>;
  eveningAudits: {
    rows: WorkbookAuditRow[];
  }[];
  journalEntry: string;
  worksheets: Record<string, Record<string, string>>;
}

export interface ModuleWorkbookDefinition {
  slug: string;
  title: string;
  moduleNumber: number;
  color: string;
  intro: string;
  workbookCardTeaser: string;

  /** Educational reading sections extracted from the course PDFs. */
  contentSections: ContentSection[];

  weeklyPlanCardTitle: string;
  weeklyPlanCardDescription: string;
  weeklyPlanSections: WorkbookPlanSection[];

  includeEveningAudit: boolean;
  eveningAuditCardTitle: string;
  eveningAuditCardDescription: string;
  auditBlockLabel: (index: number) => string;

  /** Interactive worksheets that replace the paper fill-in PDFs. */
  worksheetDefinitions: WorksheetDefinition[];

  journalCardTitle: string;
  journalCardDescription: string;
  journalPrompts: string[];
}

const DAY_COUNT = 7;
const AUDIT_BLOCKS_SLEEP = 2;
const AUDIT_ROWS_PER_BLOCK = 8;

/**
 * Evening audit presets: start 6 AM, ~every 3–4 hours, end 1 AM (7 rows).
 * Shown without “:00” to save horizontal space in the time column.
 */
export const EVENING_AUDIT_PRESET_TIMES = [
  "6 AM",
  "9 AM",
  "12 PM",
  "3 PM",
  "6 PM",
  "9 PM",
  "1 AM",
] as const;

/** Older stored workbooks used “6:00 AM” style labels — map to compact presets. */
const EVENING_AUDIT_LEGACY_TIME_TO_COMPACT: Record<string, string> = {
  "6:00 AM": "6 AM",
  "9:00 AM": "9 AM",
  "12:00 PM": "12 PM",
  "3:00 PM": "3 PM",
  "6:00 PM": "6 PM",
  "9:00 PM": "9 PM",
  "1:00 AM": "1 AM",
};

function compactEveningAuditTimeLabel(raw: string): string {
  const t = raw.trim();
  return EVENING_AUDIT_LEGACY_TIME_TO_COMPACT[t] ?? t;
}

function defaultEveningAuditTimeForRow(rowIndex: number): string {
  if (rowIndex <= 0) return "";
  const slot = rowIndex - 1;
  const labels = EVENING_AUDIT_PRESET_TIMES;
  return labels[slot % labels.length]!;
}

/**
 * Previous default row times (2h from 6:00 AM). If stored data still matches
 * these, we upgrade to {@link EVENING_AUDIT_PRESET_TIMES} on merge.
 */
const LEGACY_EVENING_AUDIT_ROW_DEFAULTS = [
  "6:00 AM",
  "8:00 AM",
  "10:00 AM",
  "12:00 PM",
  "2:00 PM",
  "4:00 PM",
  "6:00 PM",
] as const;

export function createInitialWorkbookData(
  definition: ModuleWorkbookDefinition,
): ModuleWorkbookData {
  const auditBlocks = definition.includeEveningAudit ? AUDIT_BLOCKS_SLEEP : 0;
  const worksheets: Record<string, Record<string, string>> = {};
  for (const ws of definition.worksheetDefinitions) {
    worksheets[ws.id] = Object.fromEntries(ws.fields.map((f) => [f.id, ""]));
  }
  return {
    weeklyPlan: Object.fromEntries(
      definition.weeklyPlanSections.map((s) => [
        s.id,
        {
          action: "",
          daysCompleted: Array.from({ length: DAY_COUNT }, () => false),
        },
      ]),
    ),
    eveningAudits: Array.from({ length: auditBlocks }, () => ({
      rows: Array.from({ length: AUDIT_ROWS_PER_BLOCK }, (_, ri) => ({
        time: defaultEveningAuditTimeForRow(ri),
        activity: "",
      })),
    })),
    journalEntry: "",
    worksheets,
  };
}

export function mergeModuleWorkbookData(
  stored: ModuleWorkbookData | undefined,
  fallback: ModuleWorkbookData,
): ModuleWorkbookData {
  if (!stored) return fallback;

  const weeklyPlan: Record<string, WorkbookPlanSectionData> = {
    ...fallback.weeklyPlan,
  };
  for (const id of Object.keys(weeklyPlan)) {
    const s = stored.weeklyPlan?.[id];
    if (s) {
      weeklyPlan[id] = mergePlanSection(s, fallback.weeklyPlan[id]);
    }
  }

  const eveningAudits = fallback.eveningAudits.map((block, bi) => ({
    rows: block.rows.map((row, ri) => {
      /** Row 0 is column headers in the UI — not user-editable. */
      if (ri === 0) {
        return { time: "", activity: "" };
      }
      return {
        time: (() => {
          const st = stored.eveningAudits?.[bi]?.rows?.[ri]?.time;
          const actRaw = stored.eveningAudits?.[bi]?.rows?.[ri]?.activity;
          const sa = typeof actRaw === "string" ? actRaw : "";
          const slot = ri - 1;
          if (typeof st === "string" && st !== "") {
            if (
              slot >= 0 &&
              slot < LEGACY_EVENING_AUDIT_ROW_DEFAULTS.length &&
              st === LEGACY_EVENING_AUDIT_ROW_DEFAULTS[slot]
            ) {
              return row.time;
            }
            return compactEveningAuditTimeLabel(st);
          }
          if (st === "" && sa.trim() !== "") return "";
          return row.time;
        })(),
        activity:
          stored.eveningAudits?.[bi]?.rows?.[ri]?.activity ?? row.activity,
      };
    }),
  }));

  const worksheets: Record<string, Record<string, string>> = {};
  for (const wsId of Object.keys(fallback.worksheets)) {
    worksheets[wsId] = { ...fallback.worksheets[wsId] };
    if (stored.worksheets?.[wsId]) {
      for (const fId of Object.keys(worksheets[wsId])) {
        if (stored.worksheets[wsId][fId] !== undefined) {
          worksheets[wsId][fId] = stored.worksheets[wsId][fId];
        }
      }
    }
  }

  return {
    weeklyPlan,
    eveningAudits,
    journalEntry: stored.journalEntry ?? "",
    worksheets,
  };
}

function mergePlanSection(
  storedSection: unknown,
  fallback: WorkbookPlanSectionData,
): WorkbookPlanSectionData {
  if (!storedSection || typeof storedSection !== "object") {
    return {
      action: fallback.action,
      daysCompleted: [...fallback.daysCompleted],
    };
  }
  const s = storedSection as Record<string, unknown>;
  const action = typeof s.action === "string" ? s.action : fallback.action;

  if (Array.isArray(s.daysCompleted)) {
    const arr = s.daysCompleted;
    return {
      action,
      daysCompleted: fallback.daysCompleted.map((_, i) => arr[i] === true),
    };
  }

  /** Legacy: per-day free-text — non-empty note becomes checked. */
  if (Array.isArray(s.dayNotes)) {
    const notes = s.dayNotes;
    return {
      action,
      daysCompleted: fallback.daysCompleted.map((_, i) => {
        const note = notes[i];
        return typeof note === "string" && note.trim().length > 0;
      }),
    };
  }

  return { action, daysCompleted: [...fallback.daysCompleted] };
}

/** Times printed on the Module 3 “Track your energy” PDF (per work day). */
const ENERGY_TRACKER_TIMES = [
  "5:00am",
  "6:30am",
  "8:00am",
  "9:30am",
  "11:00am",
  "12:30pm",
  "2:00pm",
  "3:30pm",
  "5:00pm",
  "6:30pm",
  "8:00pm",
  "9:30pm",
  "11:00pm",
  "12:30am",
  "2:00am",
  "3:30am",
] as const;

function energyTrackerFieldsForOneDay(): WorksheetField[] {
  return ENERGY_TRACKER_TIMES.map((time, i) => ({
    id: `t${String(i).padStart(2, "0")}`,
    label: time,
    inputKind: "rating1to5" as const,
  }));
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  MODULE DEFINITIONS                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

export const MODULE_WORKBOOKS: Record<string, ModuleWorkbookDefinition> = {
  /* ── Module 1 — Sleep ─────────────────────────────────────────────────── */
  sleep: {
    slug: "sleep",
    title: "Peaceful & Restorative Sleep",
    moduleNumber: 1,
    color: "#E5D9F2",
    intro:
      "This digital workbook can be used instead of the printed worksheets. Read the key ideas, complete the exercises, and your answers save automatically on your device.",
    workbookCardTeaser:
      "Read the course content, complete your sleep plan, evening audit, and journal—no printing required.",

    contentSections: [
      {
        heading: "Myth Busting",
        body: "Sleep is not a luxury but a necessity for prolonged peak performance. Why else would Roger Federer be sleeping 10 hours per night and playing top level tennis at 37.\n\nLuckily for us—as we may not have the lifestyle where 10 hours of sleep is possible—there are also ways to improve our sleep quality which will enable us to perform better and feel more energised.\n\nIf you suffer from a chronic lack of sleep, the research shows that we actually stop recognising the negative impact it has on performance.",
      },
      {
        heading: "Useful Thought Experiments",
        body: "Do you need an alarm to wake you? Do you fall asleep in front of the TV? Does a low dose of alcohol make you feel drowsy? Does a warm room make you sleepy? Do you feel like nodding off in a boring meeting?\n\nThe more you answer yes, the more sleep-deprived you are.\n\nThe last time you were on holiday, can you remember how long you slept each night? This is a good indicator of your ideal sleep length. If you can't remember, trial this on your next holiday—but use the second night's sleep as your barometer, as the first is often a 'catch up' sleep.",
      },
      {
        heading: "Important New Outlook",
        body: "Improving your quantity and quality of sleep begins a lot earlier in the day than most of us recognise. Simple decisions like trying to move more, eat better and access sunlight all have a significant role to play.\n\nAudit your evening with the exercise below to see where your time sinks are that stop you getting to bed earlier—e.g. you might notice 30 minutes of Facebook newsfeed browsing every evening that can be eliminated.",
      },
      {
        heading: "Sleep Cave & Runway",
        body: "Have you taken action to ensure where you sleep is dark, cool, quiet, clean and cosy? Investments from cheaper to more expensive: ear plugs, face mask, white noise machine, comfy linens and PJs, blackout blinds, soundproof windows.\n\nTry and get that room temperature around 18°C for optimal sleep.\n\nTry and make the last hour before bed something you look forward to by incorporating pleasurable things like scent (candles or diffuser), reading, stretching or deep breathing.",
      },
    ],

    weeklyPlanCardTitle: "1 Week for Better Sleep",
    weeklyPlanCardDescription:
      "Do not try to do too much at once. Choose one relatively easy tip in each category and track your progress over seven days. Commit to filling in progress at the end of each day.",
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
        prompt:
          "To improve my sleep, during my sleep runway (30–60 min. before bed) I will:",
      },
    ],

    includeEveningAudit: true,
    eveningAuditCardTitle: "Evening-Time Audit",
    eveningAuditCardDescription:
      "Analyse two evenings over the next week. Write down all activities from the moment you finish work until you get into bed. Be honest and go about your usual evening first—only with the true information will you see evident time sinks.",
    auditBlockLabel: (i) => `Evening ${i + 1}`,

    worksheetDefinitions: [],

    journalCardTitle: "Journaling Made Simple",
    journalCardDescription:
      "Writing—aka 'thinking in ink'—can be a powerful tool for self-development. Pick one prompt and write for as little as 1–2 minutes, or longer if you wish.",
    journalPrompts: [
      "How did today go? How did I feel emotionally and energetically?",
      "Describe one thing that happened today which put a smile on your face.",
      "Are there 2–3 people or events which influenced your day for the better?",
      "Did you encounter any difficult situations today? Any thoughts on dealing well with this in future?",
      "Do you think that something happened today which you will never forget?",
    ],
  },

  /* ── Module 2 — Morning Routines ──────────────────────────────────────── */
  "morning-routines": {
    slug: "morning-routines",
    title: "Rise & Shine Morning Routine",
    moduleNumber: 2,
    color: "#FFF3DC",
    intro:
      "The content from the course sheets—myth busting, what to cut, what to include—plus your interactive planning exercises. Saves automatically.",
    workbookCardTeaser:
      "Read the morning routine guidance, plan your mornings, set your priorities, and journal—all saved digitally.",

    contentSections: [
      {
        heading: "Myth Busting",
        body: "A good start is more than half the battle. Many of you might think that you have a missing ingredient from your morning routine in order to arrive at the office like 'annoyingly chirpy' early bird Alice. However, we will begin this journey with a different outlook.\n\nThe Dalai Lama describes the pursuit of happiness as not only pursuing the things that make us happy but eliminating the things which make us unhappy. We often make the mistake in the Western world of overly focusing on the former outlook—we will take the Dalai Lama's advice by placing more importance on what we can cut from your morning routine which is causing stress.\n\nResearch shows that cutting the usual (alarming) news from the earliest part of your day and replacing it with a more empowering/uplifting news clip gives you an 88% greater likelihood of reporting a good day 8 hours later. Mull over that for a few moments.",
      },
      {
        heading: "Useful Thought Experiments",
        body: "Are you making the morning process more difficult than it needs to be? Do you always put your keys back in the same place? Could you prepare your overnight oats the evening before? A successful morning routine looks to minimise decisions and distractions to keep energy stores nice and high.\n\nAngela Merkel, Barack Obama and Mark Zuckerberg all reduced their wardrobe options—eliminating yet another decision from their mornings.\n\nIf you want to get up earlier, ask yourself: if I had an hour which nobody else had in the morning but I had to use it on a passion project, what would it be? Even 15 minutes a day adds up to something amazing.",
      },
      {
        heading: "What To Cut Out?",
        body: "Three things to cut out as much as possible: an alarming alarm, social media/email and news.\n\nConsider a dawn simulator or linking a nice song via Bluetooth as your alarm—an infinitely more pleasurable way to wake up. Email and social media make us feel immediately under pressure, like time is shrinking with many decisions to make—this is energy depleting.\n\nAccording to IDC research, 80% of smartphone users check their phones within 15 minutes of waking up. Could these moments be spent more positively and productively?",
      },
      {
        heading: "Meaningful Few Things To Include",
        body: "Think in terms of MnM's—movement, mindfulness and motivation. It could be as simple as dedicating 5 minutes to just one of these.\n\nAmy Cuddy's research shows that stretching our arms out and expanding our physical space influences our feelings and thoughts, making us more positive.\n\nBefore launching into your day, rate the tasks you would like to complete on a scale of importance—where it is unclear, ask yourself a question based around a key determinant, e.g. 'how much does this task contribute to my promotion prospects?'",
      },
    ],

    weeklyPlanCardTitle: "Your Go-To Rise & Shine Routine",
    weeklyPlanCardDescription:
      "Plan your morning commitments for the week—movement, mindfulness and motivation—then note how each day went.",
    weeklyPlanSections: [
      {
        id: "movement",
        title: "Movement & body",
        prompt: "To feel ready for the day, I will move my body by:",
      },
      {
        id: "mindset",
        title: "Mindfulness & mindset",
        prompt: "To start with clarity, I will pause or reflect by:",
      },
      {
        id: "priorities",
        title: "Priorities & motivation",
        prompt: "Before launching into work, I will protect what matters by:",
      },
    ],

    includeEveningAudit: false,
    eveningAuditCardTitle: "",
    eveningAuditCardDescription: "",
    auditBlockLabel: () => "",

    worksheetDefinitions: [
      {
        id: "todaysPriorities",
        title: "Today's Priorities",
        description:
          "Keep your long-term goals in mind to ensure you prioritise the right things during your days.",
        fields: [
          {
            id: "target1",
            label: "Target 1 (most important)",
            placeholder: "For the next 6 months to be successful, I will…",
          },
          {
            id: "target2",
            label: "Target 2",
            placeholder: "Second-most important target",
          },
          {
            id: "target3",
            label: "Target 3",
            placeholder: "Third target",
          },
          {
            id: "topQuestion",
            label:
              "How important is achieving this task in accomplishing your top target?",
            placeholder:
              "Use this question to assess and prioritise your tomorrow list.",
          },
          {
            id: "common",
            label: "Do targets 1 and 2 have something in common?",
            placeholder: "Note any overlap",
          },
        ],
      },
    ],

    journalCardTitle: "Morning Reflection Journal",
    journalCardDescription:
      "Use the prompts below or free-write about how your mornings are shifting.",
    journalPrompts: [
      "What is one thing that made this morning easier than yesterday?",
      "Where did I rush—and what would I do differently tomorrow?",
      "Who or what deserves my best energy first thing?",
      "What am I grateful for before the day gets noisy?",
      "One word for how I want tomorrow morning to feel:",
    ],
  },

  /* ── Module 3 — Energy Management ─────────────────────────────────────── */
  "energy-management": {
    slug: "energy-management",
    title: "More Time & Higher Energy",
    moduleNumber: 3,
    color: "#D4F1E8",
    intro:
      "Everything from the energy management course sheets—myth busting, distraction tips, email cheatsheet—plus your digital trackers and weekly review.",
    workbookCardTeaser:
      "Read the energy management content and complete energy tracking, email review, and weekly planning exercises.",

    contentSections: [
      {
        heading: "Myth Busting",
        body: "We are limited to 2–3 high-potential hours per day. Many people suffer from hubris by believing their high-potential hours are infinite. All our energy levels fluctuate so we need to match tasks to the energy levels most suitable to them—e.g. easier admin during lower-potential hours.\n\nSaying 'yes' all the time is positive? Actually not. By learning to say 'no' strategically we protect our calendars and energy. It can also exchange popularity for respect.\n\nThere is a false belief that motivation is necessary for action. The truth: we need to do things even when unmotivated—often motivation follows after the initial forced action.",
      },
      {
        heading: "Useful Thought Experiments",
        body: "Am I matching my high-potential hours to my high-focus tasks? Consider blocking them in your calendar.\n\nCould I keep energy levels topped up better? Leverage exercise, breaks, healthy food and napping. Google, Zappos and Nike embrace napping facilities because they recognise a productivity return—research shows it can increase focus, ideally 6–7.5 hours after waking.\n\nAm I procrastinating because this task scares me, seems boring, or is unclear? Once you identify why, you can build willpower to act.",
      },
      {
        heading: "Protecting Your Calendar",
        body: "If you're committing too easily to events and meetings, start using a stock phrase like 'let me check my calendar and get back to you'. This saves you from time-wasting commitments you will later regret.\n\nAvoid time-wasting meetings with clear goals, agendas, and flexibility to let pressed speakers deliver their parts and leave.",
      },
      {
        heading: "Dealing With Distraction",
        body: "Internal distractions like buying things on Amazon or checking last night's scores can be boxed off to a certain point in your day. External distractions like a colleague popping over can be handled: 'sure I can help but I'm in the middle of something important—can I come find you in 20 minutes?'\n\nCognitive distortions like multitasking masquerade as productive—but Vanderbilt University research shows it leads to a 30% delay in work completion with twice as many errors.",
      },
      {
        heading: "Your Email Cheatsheet",
        body: "Enter your inbox with a mindset of action, not curiosity. Treat emails as:\n\n• Reply if it takes less than 2 minutes\n• Put in @Action folder if it needs more thought (reply briefly to say thanks)\n• Put in @WaitingFor folder if you're in CC or tracking\n• Delete or file if not relevant\n\nBe ruthless with unsubscribe. Install Boomerang to pause your inbox. Create a personalised signature. Save reusable templates.",
      },
    ],

    weeklyPlanCardTitle: "Protecting High-Energy Hours",
    weeklyPlanCardDescription:
      "Set intentions for how you will use your best hours and handle drains this week.",
    weeklyPlanSections: [
      {
        id: "peak",
        title: "Peak Windows",
        prompt: "When my energy is highest, I will spend that time on:",
      },
      {
        id: "drains",
        title: "Distractions & Drains",
        prompt:
          "The biggest stealers of focus this week—and I will handle them by:",
      },
      {
        id: "recovery",
        title: "Recovery & Renewal",
        prompt: "To stay energised, I will recover during the day by:",
      },
    ],

    includeEveningAudit: false,
    eveningAuditCardTitle: "",
    eveningAuditCardDescription: "",
    auditBlockLabel: () => "",

    worksheetDefinitions: [
      {
        id: "energyWorkDay1",
        digitalPageLabel: "Track Your Energy",
        title: "Work day 1 — energy check-ins",
        description:
          "For each time, tap how your energy felt from 1 (very low) to 5 (high). Only tap a rating when you were awake at that time.",
        fields: energyTrackerFieldsForOneDay(),
      },
      {
        id: "energyWorkDay2",
        title: "Work day 2 — energy check-ins",
        description:
          "Same times as day 1 — tap 1–5 at each slot when you were awake; keep logging honestly.",
        fields: energyTrackerFieldsForOneDay(),
      },
      {
        id: "energyWorkDay3",
        title: "Work day 3 — energy check-ins",
        description:
          "Final day of the three-day sample — same 1–5 chips; only rate times you were actually awake.",
        fields: energyTrackerFieldsForOneDay(),
      },
      {
        id: "energyPattern",
        title: "Energy pattern",
        description: "Step back and name what you saw across the three days.",
        fields: [
          {
            id: "insight",
            label:
              "What pattern did you spot? (early bird, midday bear, night owl, or something else?)",
            placeholder: "e.g. strong 9–11am, crash after lunch unless I walk…",
          },
          {
            id: "taskMatching",
            label:
              "Which high-focus tasks will you place in your best windows next week?",
            placeholder: "Match demanding work to your peaks",
          },
        ],
      },
      {
        id: "emailCheatsheet",
        digitalPageLabel: "Your Email Cheatsheet",
        title: "Your inbox rules",
        description:
          "Personalise the cheatsheet: how you will treat mail this week so the inbox stays an action zone, not a curiosity trap.",
        fields: [
          {
            id: "actionMindset",
            label: "How I will enter my inbox (action, not curiosity)",
            placeholder: "e.g. 2 focused passes per day, no scroll…",
          },
          {
            id: "twoMinute",
            label: "My two-minute reply rule in practice",
            placeholder: "What counts as ‘under two minutes’ for me?",
          },
          {
            id: "actionFolder",
            label: "@Action folder — what goes here and when I process it",
            placeholder: "e.g. needs thought; batch 20 minutes at 4pm…",
          },
          {
            id: "waitingFolder",
            label: "@WaitingFor folder — what I track and how I review it",
            placeholder: "CC threads, outstanding replies I’m monitoring…",
          },
          {
            id: "unsubscribe",
            label:
              "Newsletters or senders I will unsubscribe / filter this week",
            placeholder: "Be ruthless",
          },
          {
            id: "boomerangOrPause",
            label:
              "How I will pause or batch the inbox (e.g. Boomerang, scheduled focus)",
            placeholder: "When I pause, when I unpause",
          },
          {
            id: "signature",
            label: "Signature or closing line I will reuse to save typing",
            placeholder: "Paste or draft your default sign-off",
          },
        ],
      },
      {
        id: "emailTemplates",
        digitalPageLabel: "Time-Saving Email Templates",
        title: "Reusable email drafts",
        description:
          "Capture a few templates you send often (intro, follow-up, decline politely, scheduling). Paste or paraphrase; edit on the fly in real email later.",
        fields: [
          {
            id: "tpl1Name",
            label: "Template 1 — when I use it",
            placeholder: "e.g. Warm intro requesting a 20-min call",
          },
          {
            id: "tpl1Body",
            label: "Template 1 — draft",
            placeholder: "Write the skeleton you can copy/paste",
          },
          {
            id: "tpl2Name",
            label: "Template 2 — when I use it",
            placeholder: "e.g. Friendly ‘not this week’",
          },
          {
            id: "tpl2Body",
            label: "Template 2 — draft",
            placeholder: "",
          },
          {
            id: "tpl3Name",
            label: "Template 3 — when I use it",
            placeholder: "e.g. Chasing a reply after no response",
          },
          {
            id: "tpl3Body",
            label: "Template 3 — draft",
            placeholder: "",
          },
        ],
      },
      {
        id: "planTimeWisely",
        digitalPageLabel: "Plan & Use Your Time Wisely",
        title: "Calendar protection",
        description:
          "Turn the ‘protect your calendar’ ideas into concrete phrases and commitments (pairs with the printed planner if you have it).",
        fields: [
          {
            id: "stockPhrase",
            label:
              "Stock phrase I will use before saying yes to new commitments",
            placeholder: "e.g. Let me check the calendar and get back to you…",
          },
          {
            id: "meetingsFix",
            label: "Meetings I will shorten, clarify, or decline — and how",
            placeholder: "Goal, agenda, or polite exit",
          },
          {
            id: "focusBlocks",
            label: "High-potential hours I am blocking for deep work",
            placeholder: "Days / times on the calendar",
          },
          {
            id: "timeLeaks",
            label: "Biggest calendar or commitment leak right now",
            placeholder: "What steals focused time?",
          },
          {
            id: "nextWeekBoundary",
            label: "One boundary I will hold next week to protect those hours",
            placeholder: "",
          },
        ],
      },
      {
        id: "stayEnergized",
        digitalPageLabel: "Stay Energized",
        title: "Energy habits",
        description:
          "Exercise, breaks, fuel, and naps — note what you will actually do on busy weeks.",
        fields: [
          {
            id: "movement",
            label: "Movement or exercise I will schedule",
            placeholder: "Walks, gym, stretch blocks…",
          },
          {
            id: "fuel",
            label: "Food and hydration choices that support steady energy",
            placeholder: "",
          },
          {
            id: "napOrReset",
            label: "Nap or reset window that fits my day (if any)",
            placeholder: "e.g. 20 min ~7h after waking",
          },
          {
            id: "deskBreaks",
            label: "Breaks away from the desk",
            placeholder: "Frequency / ritual",
          },
          {
            id: "drains",
            label: "What drains me and the replacement habit",
            placeholder: "",
          },
          {
            id: "commitment",
            label: "One non-negotiable recovery habit for the next 7 days",
            placeholder: "",
          },
        ],
      },
      {
        id: "procrastinationBuster",
        digitalPageLabel: "Procrastination Buster",
        title: "Break the stall",
        description:
          "Name the task, why you’re dodging it, and the smallest step — same structure as the paper exercise.",
        fields: [
          {
            id: "task",
            label: "Task or decision I am putting off",
            placeholder: "",
          },
          {
            id: "why",
            label: "Why am I avoiding it? (scary, boring, unclear, or other)",
            placeholder: "",
          },
          {
            id: "clarify",
            label: "What needs to be clearer before I can start?",
            placeholder: "If ‘unclear’, outline the first question to answer",
          },
          {
            id: "smallestStep",
            label: "Smallest next action I will do in under 10 minutes",
            placeholder: "",
          },
          {
            id: "distanceTrick",
            label:
              "‘Outsource to a friend’ trick — what would I tell them to do A–Z?",
            placeholder: "Creates psychological distance",
          },
          {
            id: "when",
            label: "When I will do that smallest step (time / day)",
            placeholder: "",
          },
        ],
      },
      {
        id: "weeklyReview",
        digitalPageLabel: "Weekly Review",
        title: "Weekly Review",
        description:
          "Turn off distractions for ~30 minutes. Ideal time: Friday afternoon or Sunday — mirror the PDF checklist.",
        fields: [
          {
            id: "complete",
            label:
              "1. Tasks completed this week (tick off / list from your capture list)",
            placeholder: "",
          },
          {
            id: "carryForward",
            label: "2. Incomplete activities to move forward or delete",
            placeholder: "Transfer to next week or drop",
          },
          {
            id: "clearEmails",
            label: "3. Clear out emails — what you processed or filed",
            placeholder: "Inbox zero or ‘good enough’ note",
          },
          {
            id: "meetingNotes",
            label: "4. Meeting notes — follow-ups captured and next actions",
            placeholder: "",
          },
          {
            id: "priorities",
            label:
              "5. Key priorities in time slots (match task type to high-potential hours)",
            placeholder: "",
          },
          {
            id: "appointments",
            label: "6. Appointments for next week — all in the calendar?",
            placeholder: "Yes / fixes needed",
          },
          {
            id: "dropIfOverwhelmed",
            label: "7. If overwhelmed: what do I need to drop for balance?",
            placeholder: "Health, wellness, productivity trade-offs",
          },
          {
            id: "doubleBooked",
            label:
              "8. If double-booked: how I resolve using my real priorities",
            placeholder: "",
          },
          {
            id: "exercise",
            label: "9a. Time included for exercise and breaks?",
            placeholder: "Yes / no — calendar tweaks",
          },
          {
            id: "threeWins",
            label: "9b. Three things that went well this week",
            placeholder: "Celebrate them",
          },
          {
            id: "learning",
            label: "9c. Biggest learning this week",
            placeholder: "What would you do differently?",
          },
          {
            id: "care",
            label: "10. How can I finish this week by showing somebody I care?",
            placeholder: "e.g. donation, time, loved one, neighbour…",
          },
        ],
      },
    ],

    journalCardTitle: "Weekly Review Notes",
    journalCardDescription:
      "Free-form space for reflections from your energy tracking and weekly review.",
    journalPrompts: [
      "When did I feel most 'in flow' this week?",
      "What habit cost me the most energy?",
      "One boundary I will set next week to protect focus:",
      "What is one small change to my environment that would help?",
      "What will I celebrate next Friday if I stick to the plan?",
    ],
  },

  /* ── Module 4 — Creativity (Creative Solutions) ───────────────────────── */
  mindfulness: {
    slug: "mindfulness",
    title: "Creative Solutions & Difficult Conversations",
    moduleNumber: 4,
    color: "#EADBF7",
    intro:
      "The full creative thinking course content—myth busting, thought experiments, impasse tips—plus your interactive worksheets.",
    workbookCardTeaser:
      "Read the creative thinking guidance and complete decision-making and idea-capture exercises.",

    contentSections: [
      {
        heading: "Myth Busting",
        body: "Creativity is for artists? Creativity is actually for anybody who needs solutions to everyday issues.\n\nCreativity is genetic? Not true—the best creative solutions come from those bold enough to believe there is a better way.\n\nNot allowing breaks will result in quicker solutions? Simply not true. We often hit an impasse and working through it just for completion can hold us back from excellent work.\n\nIf a difficult conversation scares us, we should avoid it? This is a mistake—by overemphasising short-term emotions we may cause ourselves great anxiety long-term.",
      },
      {
        heading: "Useful Thought Experiments for Better Decisions",
        body: "For a difficult decision needing a quick response: what would I advise my friend to do given all the details?\n\nIf you're avoiding an important conversation: how will I feel 10 minutes, 10 months, and 10 years after having this conversation?\n\nIf there appear to be only 2 options on the table: am I missing a creative third solution?\n\nWhen pressed to buy something: do I feel completely comfortable? Could I give myself a few hours to reassess? German researchers showed we are better at spotting liars once we step out of the situation.",
      },
      {
        heading: "What To Do When You Hit A Creative Impasse",
        body: "Give yourself permission to step away. Beethoven went for walks, Einstein played the violin, Woody Allen took showers—to spike productivity and creative thinking.\n\nWalking outdoors is optimal for creative thinking—new inputs while moving, reduced stress, elevated wellbeing.\n\nPlaces like bars, cafés and large spaces (museums) can help—a low dose of background noise supports diffuse attention which stops us zeroing in on minutiae.",
      },
    ],

    weeklyPlanCardTitle: "Creative Practice Week",
    weeklyPlanCardDescription:
      "Turn insight into action: one focus per block, seven days of quick notes.",
    weeklyPlanSections: [
      {
        id: "reframe",
        title: "See Differently",
        prompt:
          "This week I will practise looking at problems from a new angle by:",
      },
      {
        id: "ideas",
        title: "Generate Options",
        prompt: "When I feel stuck, I will use this prompt or technique:",
      },
      {
        id: "decide",
        title: "Decide With Clarity",
        prompt: "Before a tough decision, I will ask myself:",
      },
    ],

    includeEveningAudit: false,
    eveningAuditCardTitle: "",
    eveningAuditCardDescription: "",
    auditBlockLabel: () => "",

    worksheetDefinitions: [
      {
        id: "nineDot",
        title: "The 9-Dot Problem",
        description:
          "Connect 9 dots by drawing no more than 4 lines without lifting your pen. What did you learn about assumptions?",
        fields: [
          {
            id: "attempt",
            label: "What approach did you try?",
            placeholder: "Describe your attempt",
          },
          {
            id: "learning",
            label: "What did this teach you about thinking beyond constraints?",
            placeholder: "Reflect on the experience",
          },
        ],
      },
      {
        id: "bestSolutions",
        title: "Your Best Creative Solutions",
        description:
          "Capture and refine creative solutions you've come up with.",
        fields: [
          {
            id: "problem",
            label: "The problem or challenge",
            placeholder: "What were you trying to solve?",
          },
          {
            id: "solution",
            label: "Your creative solution",
            placeholder: "What did you come up with?",
          },
          {
            id: "next",
            label: "Next step to act on it",
            placeholder: "How will you move this forward?",
          },
        ],
      },
      {
        id: "difficultDecision",
        title: "How to Make Difficult Decisions",
        description:
          "Use the 10-10-10 framework and friend test to work through a tough call.",
        fields: [
          {
            id: "decision",
            label: "The decision I'm facing",
            placeholder: "Describe the choice",
          },
          {
            id: "friendAdvice",
            label: "What would I advise a friend?",
            placeholder: "Step outside yourself",
          },
          {
            id: "ten10",
            label: "How will I feel in 10 minutes, 10 months, 10 years?",
            placeholder: "Short vs long-term perspective",
          },
          {
            id: "thirdOption",
            label: "Is there a creative third option?",
            placeholder: "Look beyond the obvious two",
          },
        ],
      },
    ],

    journalCardTitle: "Ideas & Reflections",
    journalCardDescription:
      "Dump ideas, doodle in words, or reflect after the exercises.",
    journalPrompts: [
      "A problem I reframed this week and what shifted:",
      "The boldest idea I allowed myself to write down:",
      "Where did 'diffuse attention' help me?",
      "A decision I'm sitting with and what I still need:",
      "What would I try if failure were cheap?",
    ],
  },

  /* ── Module 5 — Move 2 Perform (Downtime) ─────────────────────────────── */
  "move-2-perform": {
    slug: "move-2-perform",
    title: "Rejuvenating Downtime",
    moduleNumber: 5,
    color: "#DBE9F7",
    intro:
      "The downtime course content—evening, weekend & holiday advice—plus your interactive planning worksheets.",
    workbookCardTeaser:
      "Read the downtime guidance and plan your evenings, weekends, and holiday reflection.",

    contentSections: [
      {
        heading: "Myth Busting",
        body: "Downtime is a luxury? Complete fallacy—to perform over a sustained period without burnout we need to take downtime every bit as seriously as work.\n\nNot taking holidays helps promotion prospects? In the US, people who take all their holiday days versus those who left 11+ unused were still 7% more likely to get promoted.\n\nWorking longer means getting more done? We reach diminishing returns when thinking halts, motivation dips, and mistakes increase. On average, the tipping point is around 50 hours per week.",
      },
      {
        heading: "Downtime In The Evening",
        body: "Avoid or strictly moderate: online shopping, web surfing, and TV bingeing—they deplete rejuvenation and morale.\n\nInclude activities (great if they involve others): family rituals, movement like a jog with a friend, and reading (a proven stress reliever). It's much easier to go from 100 km/h at the office to 60 km/h in a different direction at home.\n\nBe deliberate about not allowing email or phones to take over your evening. Smartphone use has been shown to make us more selfish and deplete quality of interactions.",
      },
      {
        heading: "Downtime On Weekends",
        body: "Try not to let chores take over by considering outsourcing things like shopping or cleaning—or do them during high-potential hours when freshest.\n\nPlan your weekend earlier in the week so it's not left to the last minute.\n\nArt Aron found that couples still passionately in love after many years threw themselves into hobbies together—the weekend is a good opportunity for hiking or salsa with your partner.",
      },
      {
        heading: "Downtime On Holidays",
        body: "Many positive vibes from holidays come from the planning phase—dedicate good quality time to this.\n\nPlan exciting activities (lovely meals, a ski class, a hike, wine tasting) to accumulate great memories—it will feel longer in hindsight.\n\nHolidays offer a good opportunity to be a visitor, not just a tourist—immerse yourself in a new culture.\n\nLeaving a one-day runway (return home day off) can really reduce stress around your holiday.",
      },
    ],

    weeklyPlanCardTitle: "Recovery & Home Energy",
    weeklyPlanCardDescription:
      "Commit to how you will rest, move, and reset across the week.",
    weeklyPlanSections: [
      {
        id: "downtime",
        title: "Downtime",
        prompt: "To recover properly, I will protect downtime by:",
      },
      {
        id: "load",
        title: "Load & Chores",
        prompt: "To reduce drain at home, I will change or outsource:",
      },
      {
        id: "movement",
        title: "Movement",
        prompt:
          "To support performance, I will move on these days / in this way:",
      },
    ],

    includeEveningAudit: false,
    eveningAuditCardTitle: "",
    eveningAuditCardDescription: "",
    auditBlockLabel: () => "",

    worksheetDefinitions: [
      {
        id: "holidayReflection",
        title: "Holiday Reflection",
        description:
          "When on holiday, reflect from afar on the trajectory of your life and where you want to go on return.",
        fields: [
          {
            id: "achievement",
            label: "Biggest achievement since my last holiday",
            placeholder: "What am I proud of?",
          },
          {
            id: "direction",
            label:
              "Am I happy with my direction professionally and personally?",
            placeholder: "Honest assessment",
          },
          {
            id: "nextGoal",
            label: "Next meaningful goal in the next 6–12 months",
            placeholder: "What am I aiming for?",
          },
          {
            id: "threeActions",
            label: "Three things I can do immediately on return to get started",
            placeholder: "Action 1, Action 2, Action 3",
          },
        ],
      },
    ],

    journalCardTitle: "Body & Recovery Journal",
    journalCardDescription:
      "Notice how movement and downtime affect mood and energy.",
    journalPrompts: [
      "Where did I feel physically tense this week?",
      "What recovery habit actually happened (even briefly)?",
      "What would 'good enough' movement look like next week?",
      "A chore I could drop, delegate, or simplify:",
      "How did I feel after the best recovery moment?",
    ],
  },

  /* ── Module 6 — Thinking 2 Perform ────────────────────────────────────── */
  "thinking-2-perform": {
    slug: "thinking-2-perform",
    title: "The Inner Game & Improved Self-Talk",
    moduleNumber: 6,
    color: "#F7DBF0",
    intro:
      "Myth busting on mindfulness, self-talk strategies, framing techniques—plus your interactive thought journal.",
    workbookCardTeaser:
      "Read the inner game content and work through healthy thinking exercises digitally.",

    contentSections: [
      {
        heading: "Myth Busting",
        body: "Mindfulness and meditation are long and boring? Completely untrue. Mindfulness is a way of living—turning focus and attention to the inner and outer world in the present moment.\n\nMy thoughts are all real? Simply not true. Sometimes we call ourselves terrible things like 'you're a loser', but we can challenge this by forcing ourselves to define a loser and think of a time we did something correctly.\n\nHigh performers have a higher level of positive thinking I'll never tap into? Not true—we can retrain our minds to frame scenarios as opportunities to grow.",
      },
      {
        heading: "Self-Talk",
        body: "If you talk to yourself in a way that you would never allow yourself to talk to a friend, you need to work on your self-talk. Negative self-talk affects how we look, feel and behave.\n\nGo through the distorted types of thinking in the module and use them to identify future negative patterns. Then think: how could I talk back to this thought in a more optimal way?\n\nExample: changing 'I should lose weight' to 'I could lose weight'—working from self-determination instead of guilt.",
      },
      {
        heading: "Framing",
        body: "Top performers work through adversity with powerful framing. 75% of job successes are predicted by optimism levels, social support, and an ability to frame stress as a challenge, not a threat.\n\nMusician Eimear McGeown told negative thoughts to go away and come back later before big performances.\n\nPat Spillane used negative media to say 'I'll prove them wrong' and positive media to say 'I'll prove them right'—win-win thinking.",
      },
      {
        heading: "Mindfulness",
        body: "Mindfulness is defined by expert Padraig O'Morain as 'returning, with acceptance, to what your senses are bringing you.'\n\nIt's simply noticing things you used to let float into the background—the feel of your footsteps, the smell of flowers, the freshness of wind on your face.\n\nIt helps us not focus on past injustices by inflicting the 'double arrow'—the first being the event itself, the second being the arrow we inflict by replaying incidents over and over.",
      },
    ],

    weeklyPlanCardTitle: "Inner Dialogue Week",
    weeklyPlanCardDescription:
      "Set intentions for catching, naming, and upgrading your thoughts.",
    weeklyPlanSections: [
      {
        id: "notice",
        title: "Notice",
        prompt: "When stress rises, I will notice my self-talk by:",
      },
      {
        id: "reframe",
        title: "Reframe",
        prompt: "A healthier way I will talk to myself under pressure:",
      },
      {
        id: "anchor",
        title: "Anchor",
        prompt: "A phrase or question I will return to is:",
      },
    ],

    includeEveningAudit: false,
    eveningAuditCardTitle: "",
    eveningAuditCardDescription: "",
    auditBlockLabel: () => "",

    worksheetDefinitions: [
      {
        id: "healthyThinking",
        title: "Healthy Thinking",
        description:
          "Identify a distorted thought, challenge it, and replace it with something healthier.",
        fields: [
          {
            id: "situation",
            label: "The situation",
            placeholder: "What happened?",
          },
          {
            id: "thought",
            label: "The automatic thought",
            placeholder: "What did I tell myself?",
          },
          {
            id: "distortion",
            label: "Which distortion is this?",
            placeholder: "e.g. all-or-nothing, catastrophising, labelling…",
          },
          {
            id: "challenge",
            label: "Evidence against this thought",
            placeholder: "What facts contradict it?",
          },
          {
            id: "healthier",
            label: "A healthier replacement thought",
            placeholder: "What's a more balanced way to see this?",
          },
        ],
      },
    ],

    journalCardTitle: "Thought Journal",
    journalCardDescription:
      "Use the prompts or write freely after the video exercises.",
    journalPrompts: [
      "A recurring thought that is not serving me:",
      "Evidence for and against that thought:",
      "A kinder, more accurate sentence I can practise:",
      "When did I pause and breathe before reacting?",
      "What would I tell a friend in the same situation?",
    ],
  },

  /* ── Module 7 — Recovery (Exercise) ───────────────────────────────────── */
  recovery: {
    slug: "recovery",
    title: "Move To Perform With Exercise & Physical Activity",
    moduleNumber: 7,
    color: "#D9E9F7",
    intro:
      "The full exercise module content—myth busting, the habit loop, mini habits—plus your interactive exercise planner.",
    workbookCardTeaser:
      "Read the exercise guidance and build your movement habit with tracked commitments.",

    contentSections: [
      {
        heading: "Myth Busting",
        body: "Work and physical activity are mutually exclusive? Not true—when we step away for a quick walk or stretch, we benefit from 'task reorientation' and return to work with fresh, clearer eyes.\n\n5,000 steps or less per day is sedentary behaviour—linked with 35 chronic health conditions. 75 minutes per week of brisk walking could add almost two more years to your life. Get moving!",
      },
      {
        heading: "The Habit Loop",
        body: "Relying on willpower and motivation for exercise is a bad idea—these are finite. Creating it into a habit like washing your teeth is a much better strategy.\n\nRemember the 3 R's:\n• Reminder: e.g. a calendar reminder at 10:55 AM to get up and stretch\n• Routine: what stretching movements or stroll you will do\n• Reward: appreciate the benefit—feeling spritelier and less tense",
      },
      {
        heading: "Make It Fun",
        body: "Exercise doesn't have to be long and arduous—as little as 20 minutes is enough for much of the benefit.\n\nWhat exercise, movement or physical activities do you enjoy? Basing exercise around what you enjoy makes it infinitely easier. If you enjoy very little, pair stretching with a TV programme.\n\nFind accountability—it's much harder to give up on a friend or coach than on yourself.",
      },
      {
        heading: "Silly Little Efforts Make A Big Difference",
        body: "Do not underestimate the power of mini habits. 3 minutes of stretching your hips in the morning could result in a lot more comfort as you age.\n\nBuild a new habit: see the elevator as a death trap and take the stairs the majority of the time.\n\nHow to start: 1) Start small (one push-up a day) 2) Take ownership—stop saying 'I don't have time' and admit 'I'm choosing not to give it my time' 3) Make it easy—leave your yoga mat in view 4) Use the 3 R's consistently.",
      },
    ],

    weeklyPlanCardTitle: "Movement Plan",
    weeklyPlanCardDescription:
      "Choose realistic actions for training, recovery, and fitting activity into work.",
    weeklyPlanSections: [
      {
        id: "sessions",
        title: "Sessions",
        prompt:
          "This week I will complete these movement sessions (type, time, place):",
      },
      {
        id: "habit",
        title: "Habit Hooks",
        prompt: "I will anchor movement to this existing habit:",
      },
      {
        id: "workblend",
        title: "Work & Life",
        prompt: "To blend exercise with a busy schedule, I will:",
      },
    ],

    includeEveningAudit: false,
    eveningAuditCardTitle: "",
    eveningAuditCardDescription: "",
    auditBlockLabel: () => "",

    worksheetDefinitions: [
      {
        id: "makeHabit",
        title: "Make Exercise A Habit",
        description: "Set up your own 3 R's for movement this week.",
        fields: [
          {
            id: "reminder",
            label: "My reminder",
            placeholder:
              "e.g. phone alarm at 10:55, yoga mat in the sitting room…",
          },
          {
            id: "routine",
            label: "My routine",
            placeholder: "e.g. 5-min stretch, walk around the block…",
          },
          {
            id: "reward",
            label: "My reward / the benefit I notice",
            placeholder: "e.g. less stiffness, better energy…",
          },
          {
            id: "miniHabit",
            label: "My mini habit to start with",
            placeholder:
              "e.g. one push-up a day, get off the bus one stop early…",
          },
        ],
      },
    ],

    journalCardTitle: "Training Journal",
    journalCardDescription:
      "Short notes after key sessions or at the end of the week.",
    journalPrompts: [
      "What type of movement felt best in my body?",
      "What got in the way—and how can I plan around it?",
      "How did sleep and stress interact with training?",
      "A win from this week, however small:",
      "Next week I want to feel:",
    ],
  },

  /* ── Module 8 — Fuel 2 Perform (Nutrition) ────────────────────────────── */
  "fuel-2-perform": {
    slug: "fuel-2-perform",
    title: "Fuel To Perform With Nutrition & Hydration",
    moduleNumber: 8,
    color: "#FFDDD9",
    intro:
      "The nutrition course content—myth busting, the triangle of focus, transforming principles—plus your food diary and mindful eating exercises.",
    workbookCardTeaser:
      "Read the nutrition guidance and complete your food journal and meal-planning exercises.",

    contentSections: [
      {
        heading: "Myth Busting",
        body: "Eating to live longer will be enough motivation? It's better to eat for short-term productivity—a healthy super food salad at lunch to stay at the top of your game for an important afternoon.\n\nFat makes you fat? We need between 15–35% of total calorie intake from fat—it's important for healthy immune function and absorbing certain vitamins.",
      },
      {
        heading: "The Triangle of Focus",
        body: "Do you want mostly performance, health, or body composition? Perhaps somewhere in the middle of all three?\n\nWhat you eat, how much you eat and when you eat should be tailored towards your life goals—e.g. a marathon-training office worker needs more carbohydrates than a sedentary one.\n\nFor weight loss, you need a calorie deficit. For a generally healthy lifestyle, consider ethically sourced foods and a Vitamin D3 supplement in winter.",
      },
      {
        heading: "Transforming Principles",
        body: "Track your food for some period—using an app, notes on your phone, or pen and paper. Note the effect food decisions have on you—e.g. 'I feel constantly sluggish after an Irish fry for breakfast.'\n\nSurround yourself with good food. Cornell University found people with breakfast cereals on their counters weighed 20 lbs more than those who didn't—while those with a fruit bowl out weighed nearly 13 lbs less.\n\nTarget simple swaps that work for you and your goal.",
      },
      {
        heading: "Reconnect With Your Food",
        body: "Eating mindfully can improve digestion and reduce unnecessary eating.\n\n• Have one meal a week on your own and eat slower (chew more)\n• Start with a mindful tea—really feel the warm mug and soothing liquid\n• Don't eat and send emails or read memos—this adds stress\n• Take the first few minutes of a nice meal to appreciate the flavours and those who prepared it",
      },
    ],

    weeklyPlanCardTitle: "Fuel For The Week",
    weeklyPlanCardDescription:
      "Set intentions for meals, snacks, and hydration—then note what happened each day.",
    weeklyPlanSections: [
      {
        id: "meals",
        title: "Meals & Timing",
        prompt: "To fuel well, I will structure meals and snacks by:",
      },
      {
        id: "quality",
        title: "Quality & Balance",
        prompt: "I will improve balance (protein, plants, portions) by:",
      },
      {
        id: "hydration",
        title: "Hydration",
        prompt: "I will stay hydrated by:",
      },
    ],

    includeEveningAudit: false,
    eveningAuditCardTitle: "",
    eveningAuditCardDescription: "",
    auditBlockLabel: () => "",

    worksheetDefinitions: [
      {
        id: "foodJournal",
        title: "Food Journal Continuation",
        description:
          "Follow on from three days of journaling and reflect on patterns.",
        fields: [
          {
            id: "zapping",
            label: "What foods appear to be zapping your energy?",
            placeholder: "Foods that left you sluggish",
          },
          {
            id: "reduceUnhealthy",
            label: "How will you make less healthy options harder to reach?",
            placeholder: "Out of sight, out of mind",
          },
          {
            id: "energising",
            label:
              "Which meals and snacks are having a more energising effect?",
            placeholder: "Foods that gave you steady energy",
          },
          {
            id: "moreAvailable",
            label: "How will you make energising foods more available?",
            placeholder: "Staple foods to keep stocked",
          },
        ],
      },
    ],

    journalCardTitle: "Food & Mood Notes",
    journalCardDescription:
      "Space for reflections that replace scattered paper diary pages.",
    journalPrompts: [
      "When did I eat in a way that matched my energy needs?",
      "A craving pattern I observed:",
      "How did water intake correlate with focus?",
      "One meal I could prepare or simplify:",
      "What would 'good enough' nutrition look like this week?",
    ],
  },

  /* ── Module 9 — Most Authentic You (Confidence) ──────────────────────── */
  "stress-management": {
    slug: "stress-management",
    title: "Most Authentic You: Confidence, Charisma & Assertiveness",
    moduleNumber: 9,
    color: "#F7EADB",
    intro:
      "Full course content on confidence, charisma, assertiveness—plus your interactive action plans.",
    workbookCardTeaser:
      "Read the confidence content and complete your assertiveness plan and speaking goals.",

    contentSections: [
      {
        heading: "Myth Busting",
        body: "Feeling anxious in public settings is unique to me? This is one of the most common sources of anxiety in the world. You are not alone!\n\nWe fear people's reactions when we communicate our needs clearly—but the more we conceal them, the more painful life can be.\n\nCharisma is a god-given gift? Think about a friend with whom you're completely yourself—that's an example of your unique charisma, unfiltered.",
      },
      {
        heading: "Speaking Confidently",
        body: "We are all on a different point of the journey. Baby steps matter: small talk with your boss → suggesting an improvement → requesting an appraisal → leading a meeting → speaking at a conference.\n\nLearn from musician Eimear McGeown who used the 3 P's: Plan (organise practices), Prepare (execute meticulously), Perform (take confidence knowing you've done your best in the lead up).",
      },
      {
        heading: "Your Unique Charisma",
        body: "We don't need alcohol to be ourselves—it involves being a little more vulnerable in communication with potentially great returns.\n\nStart by: smiling at people more (puts them at ease), a firm handshake, and having pre-prepared conversation openers.\n\nOpen up conversations with good questions. If someone says their weekend was 'just ok', pry further: 'do you like those boring kinds of weekends?' This lets them open up.",
      },
      {
        heading: "Assertiveness",
        body: "Sometimes we're too quick to go for impulsive, unhelpful communication—e.g. receiving a compliment about your suit: 'ah this aul thing' instead of 'thanks, I really like it too.' The latter is much more self-appreciating.\n\nWhen overwhelmed at work, try: 'I'm at capacity right now so can't do this task unless we can discuss moving something else down on the priority list.'\n\nRemember your assertive rights: the right to ask for what you want, to express opinions, to say no, to change your mind, to make mistakes, and to be successful and acknowledge it.",
      },
    ],

    weeklyPlanCardTitle: "Presence & Boundaries Week",
    weeklyPlanCardDescription:
      "Commit to how you will show up in conversations and stressful moments.",
    weeklyPlanSections: [
      {
        id: "situations",
        title: "Situations",
        prompt: "This week I want to handle these situations more clearly:",
      },
      {
        id: "assert",
        title: "Assertive Moves",
        prompt: "I will practise saying (tone, words, timing):",
      },
      {
        id: "care",
        title: "Self-Care",
        prompt:
          "Before or after hard conversations, I will stabilise myself by:",
      },
    ],

    includeEveningAudit: false,
    eveningAuditCardTitle: "",
    eveningAuditCardDescription: "",
    auditBlockLabel: () => "",

    worksheetDefinitions: [
      {
        id: "assertivenessPlan",
        title: "Assertiveness Action Plan",
        description:
          "Identify areas where you want to be more assertive. Rate each 0–10 for difficulty and start with the easiest.",
        fields: [
          {
            id: "step1",
            label: "Step 1 (easiest)",
            placeholder: "e.g. Invite the neighbour round for a drink — 2/10",
          },
          {
            id: "step2",
            label: "Step 2",
            placeholder: "e.g. Say no to extra hours at work — 4/10",
          },
          {
            id: "step3",
            label: "Step 3",
            placeholder: "e.g. Return something to a shop — 5/10",
          },
          {
            id: "step4",
            label: "Step 4",
            placeholder: "e.g. Send food back in a restaurant — 7/10",
          },
          {
            id: "step5",
            label: "Step 5 (hardest)",
            placeholder: "e.g. Ask boss for a pay rise — 9/10",
          },
        ],
      },
      {
        id: "speakingSteps",
        title: "Public Speaking Improvement",
        description:
          "Baby steps from very afraid to confidently presenting. Adapt these to your situation.",
        fields: [
          {
            id: "current",
            label: "Where I am now",
            placeholder: "e.g. I avoid speaking up in meetings",
          },
          {
            id: "nextSmall",
            label: "My next small step",
            placeholder: "e.g. Initiate small talk with my manager",
          },
          {
            id: "medium",
            label: "A medium challenge to aim for",
            placeholder: "e.g. Speak up in a larger meeting",
          },
          {
            id: "stretch",
            label: "My stretch goal",
            placeholder: "e.g. Present at a team event or join toastmasters",
          },
        ],
      },
    ],

    journalCardTitle: "Confidence Journal",
    journalCardDescription:
      "Process nerves, wins, and lessons after social or high-stakes moments.",
    journalPrompts: [
      "A moment I spoke up—what worked?",
      "Where did I stay silent and wish I hadn't?",
      "Physical signs I noticed when anxiety rose:",
      "A script I can reuse next time:",
      "Someone whose presence I admire—and what I can borrow:",
    ],
  },

  /* ── Module 10 — Building Habits ──────────────────────────────────────── */
  habits: {
    slug: "habits",
    title: "Mapping For Success & Laser Focus",
    moduleNumber: 10,
    color: "#DBF7EA",
    intro:
      "The full module content—the 4 questions, 4 spheres, focus boosters—plus your weekly key 3 and goal planning worksheets.",
    workbookCardTeaser:
      "Read the mapping-for-success content and complete your goal-setting and focus exercises.",

    contentSections: [
      {
        heading: "All Begins With 4 Questions",
        body: "1. What do I really want from my life? You'd be amazed how many people never ask themselves this.\n\n2. What am I willing to give up to get there? People know what they want but aren't willing to give up their social life, for example.\n\n3. How will I set my mind to this? Do you have a plan to ensure you mentally stick? Pat Spillane used visualisation on the way to football matches.\n\n4. What's my next action? Amazingly, some people get through the first three questions and then don't take enough positive, assertive action.",
      },
      {
        heading: "4 Spheres",
        body: "Think in ink—write down your goal using SMART or OKR models. Fail to plan then plan to fail.\n\nLike a horse running a race, keep your blinkers on—install social media blocking apps, turn off notifications, lock yourself away for 2–3 hours of highly focused work.\n\nHave in-built reviews to assess whether you're on course, need help, and can course-correct.\n\nKeep it to one main goal for each of the four spheres: family, extracurricular, work, and personal. Neglect any sphere for too long and imbalance follows.",
      },
      {
        heading: "Focus For Success Boosters",
        body: "Use the 3 R's for work quality: Receive the task requirements clearly (ask clarifying questions if unclear), Review the resources at your disposal, then Respond with action.\n\nDedicate time to meditation—it helps you focus on one thing for a prolonged period, with crossover benefits to your work.\n\nAllow yourself occasional rewards—hit a milestone and treat yourself to a lovely latté, enjoyed mindfully and peacefully.",
      },
    ],

    weeklyPlanCardTitle: "Clarity & Key Three",
    weeklyPlanCardDescription:
      "Name what matters, pick three weekly wins, and check in daily.",
    weeklyPlanSections: [
      {
        id: "vision",
        title: "Direction",
        prompt: "Over the next few months I am steering toward:",
      },
      {
        id: "key3",
        title: "This Week's Key 3",
        prompt: "The three outcomes that must happen this week are:",
      },
      {
        id: "focus",
        title: "Focus Boosters",
        prompt: "When I drift, I will reset using:",
      },
    ],

    includeEveningAudit: false,
    eveningAuditCardTitle: "",
    eveningAuditCardDescription: "",
    auditBlockLabel: () => "",

    worksheetDefinitions: [
      {
        id: "weeklyKey3",
        title: "Weekly Key 3",
        description:
          "Keep your personal ambitions and your team's goals in mind as you choose your three priorities.",
        fields: [
          {
            id: "key1what",
            label: "Key 1 — What?",
            placeholder: "The outcome",
          },
          {
            id: "key1why",
            label: "Key 1 — Why?",
            placeholder: "Why does this matter?",
          },
          {
            id: "key1how",
            label: "Key 1 — How & When?",
            placeholder: "Steps and timeline",
          },
          {
            id: "key2what",
            label: "Key 2 — What?",
            placeholder: "The outcome",
          },
          {
            id: "key2why",
            label: "Key 2 — Why?",
            placeholder: "Why does this matter?",
          },
          {
            id: "key2how",
            label: "Key 2 — How & When?",
            placeholder: "Steps and timeline",
          },
          {
            id: "key3what",
            label: "Key 3 — What?",
            placeholder: "The outcome",
          },
          {
            id: "key3why",
            label: "Key 3 — Why?",
            placeholder: "Why does this matter?",
          },
          {
            id: "key3how",
            label: "Key 3 — How & When?",
            placeholder: "Steps and timeline",
          },
        ],
      },
      {
        id: "fourQuestions",
        title: "4 Questions Reflection",
        description:
          "Work through the four questions that begin every goal-setting journey.",
        fields: [
          {
            id: "q1",
            label: "What do I really want from my life?",
            placeholder: "What ties in with your values?",
          },
          {
            id: "q2",
            label: "What am I willing to give up to get there?",
            placeholder: "What's the trade-off?",
          },
          {
            id: "q3",
            label: "How will I set my mind to this?",
            placeholder: "Your mental strategy",
          },
          {
            id: "q4",
            label: "What's my next action?",
            placeholder: "The very next step",
          },
        ],
      },
    ],

    journalCardTitle: "Goal & Focus Reflection",
    journalCardDescription:
      "Note scores or feelings for life areas, or answer the four questions in prose.",
    journalPrompts: [
      "Which life area needs the most attention right now?",
      "What would a 1% improvement look like there?",
      "What am I avoiding naming out loud?",
      "Who can support me with accountability?",
      "What will I do in the next 24 hours toward that improvement?",
    ],
  },
};

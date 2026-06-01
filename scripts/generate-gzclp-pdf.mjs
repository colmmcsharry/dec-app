import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(
  __dirname,
  "../assets/documents/gzclp-training-guide.pdf"
);

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 16;
const TITLE_SIZE = 22;
const HEADING_SIZE = 14;
const BODY_SIZE = 11;

function wrapText(text, font, size, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawLines(page, lines, x, y, font, size, color = rgb(0.12, 0.14, 0.18)) {
  let cursorY = y;
  for (const line of lines) {
    page.drawText(line, { x, y: cursorY, size, font, color });
    cursorY -= LINE_HEIGHT;
  }
  return cursorY;
}

function drawHeading(page, text, x, y, font) {
  page.drawText(text, {
    x,
    y,
    size: HEADING_SIZE,
    font,
    color: rgb(0.35, 0.22, 0.55),
  });
  return y - LINE_HEIGHT - 4;
}

const WORKOUTS = [
  {
    label: "Day 1",
    lines: [
      "T1: Squat — 5 x 3+",
      "T2: Bench Press — 3 x 10",
      "T3: Lat Pulldown — 3 x 15+",
    ],
  },
  {
    label: "Day 2",
    lines: [
      "T1: Overhead Press — 5 x 3+",
      "T2: Deadlift — 3 x 10",
      "T3: Bent-Over Row — 3 x 15+",
    ],
  },
  {
    label: "Day 3",
    lines: [
      "T1: Bench Press — 5 x 3+",
      "T2: Squat — 3 x 10",
      "T3: Lat Pulldown — 3 x 15+",
    ],
  },
  {
    label: "Day 4",
    lines: [
      "T1: Deadlift — 5 x 3+",
      "T2: Overhead Press — 3 x 10",
      "T3: Bent-Over Row — 3 x 15+",
    ],
  },
];

async function main() {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  page.drawText("GZCLP — Intermediate Routine", {
    x: MARGIN,
    y,
    size: TITLE_SIZE,
    font: bold,
    color: rgb(0.2, 0.12, 0.35),
  });
  y -= 28;

  page.drawText("Linear progression after your first few months in the gym", {
    x: MARGIN,
    y,
    size: 12,
    font: regular,
    color: rgb(0.35, 0.22, 0.55),
  });
  y -= 28;

  const intro =
    "GZCLP trains 3 days per week using 4 different workouts. Rotate Day 1 through Day 4 — each main lift is trained twice per rotation: once heavy (T1) and once lighter (T2). Back work uses lat pulldowns and bent-over rows. The \"+\" means your last set is as many good reps as you can manage.";
  y = drawLines(
    page,
    wrapText(intro, regular, BODY_SIZE, CONTENT_WIDTH),
    MARGIN,
    y,
    regular,
    BODY_SIZE
  );
  y -= 10;

  y = drawHeading(page, "How the Tiers Work", MARGIN, y, bold);
  for (const line of [
    "T1 — heaviest main lift (5 x 3+ with AMRAP on the last set).",
    "T2 — same lifts, lighter weight (3 x 10).",
    "T3 — back support work (3 x 15+ with AMRAP on the last set).",
  ]) {
    y = drawLines(page, [`• ${line}`], MARGIN + 8, y, regular, BODY_SIZE);
  }
  y -= 8;

  for (const workout of WORKOUTS) {
    y = drawHeading(page, workout.label, MARGIN, y, bold);
    for (const line of workout.lines) {
      y = drawLines(page, [line], MARGIN + 12, y, regular, BODY_SIZE);
    }
    y -= 6;
  }

  y = drawHeading(page, "Weekly Schedule (3 days per week)", MARGIN, y, bold);
  for (const line of [
    "Week 1: Mon Day 1 · Wed Day 2 · Fri Day 3",
    "Week 2: Mon Day 4 · Wed Day 1 · Fri Day 2",
    "Week 3: Mon Day 3 · Wed Day 4 · Fri Day 1",
    "Keep rotating through all 4 days.",
  ]) {
    y = drawLines(page, [line], MARGIN + 12, y, regular, BODY_SIZE);
  }
  y -= 8;

  y = drawHeading(page, "Progression", MARGIN, y, bold);
  const progression = [
    "Squat & Deadlift (T1/T2): Add 5 kg / 10 lb when all sets are completed.",
    "Bench & Overhead Press (T1/T2): Add 2.5 kg / 5 lb when all sets are completed.",
    "Lat Pulldown & Bent-Over Row (T3): Add 2.5 kg / 5 lb when you get 25+ reps on the last set.",
    "If you miss reps, repeat the same weight next session.",
  ];
  for (const line of progression) {
    const wrapped = wrapText(`• ${line}`, regular, BODY_SIZE, CONTENT_WIDTH - 12);
    y = drawLines(page, wrapped, MARGIN + 8, y, regular, BODY_SIZE);
  }

  page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  y = PAGE_HEIGHT - MARGIN;

  y = drawHeading(page, "Weight Log", MARGIN, y, bold);
  y -= 6;

  const columns = ["Date", "Day", "Lift", "Weight", "Notes"];
  const colWidths = [72, 48, 120, 64, CONTENT_WIDTH - 304];
  let x = MARGIN;

  for (let i = 0; i < columns.length; i += 1) {
    page.drawText(columns[i], {
      x,
      y,
      size: BODY_SIZE,
      font: bold,
      color: rgb(0.2, 0.12, 0.35),
    });
    x += colWidths[i];
  }
  y -= 10;

  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 1,
    color: rgb(0.75, 0.75, 0.8),
  });
  y -= 18;

  for (let row = 0; row < 22; row += 1) {
    if (y < MARGIN + 20) break;
    page.drawLine({
      start: { x: MARGIN, y: y - 6 },
      end: { x: PAGE_WIDTH - MARGIN, y: y - 6 },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.88),
    });
    y -= 22;
  }

  page.drawText("Daily Diesel · GZCLP beginner guide", {
    x: MARGIN,
    y: MARGIN - 10,
    size: 9,
    font: regular,
    color: rgb(0.55, 0.55, 0.6),
  });

  const bytes = await pdf.save();
  writeFileSync(outputPath, bytes);
  console.log(`Wrote ${outputPath} (${bytes.length} bytes)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(
  __dirname,
  "../assets/documents/two-day-beginner-routine.pdf"
);

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 14;
const TITLE_SIZE = 21;
const HEADING_SIZE = 12;
const BODY_SIZE = 9.5;

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
  return y - LINE_HEIGHT - 3;
}

function drawBullets(page, items, x, y, font, maxWidth) {
  let cursorY = y;
  for (const item of items) {
    const wrapped = wrapText(`• ${item}`, font, BODY_SIZE, maxWidth - 8);
    cursorY = drawLines(page, wrapped, x + 8, cursorY, font, BODY_SIZE);
    cursorY -= 1;
  }
  return cursorY;
}

async function main() {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  page.drawText("2 Day Basic Beginner Routine", {
    x: MARGIN,
    y,
    size: TITLE_SIZE,
    font: bold,
    color: rgb(0.2, 0.12, 0.35),
  });
  y -= 24;

  page.drawText("One full-body workout, twice a week", {
    x: MARGIN,
    y,
    size: 11,
    font: regular,
    color: rgb(0.35, 0.22, 0.55),
  });
  y -= 22;

  const intro =
    "Do the same workout twice a week with 2–3 rest days between sessions (e.g. Monday and Thursday). Every lift is trained both days. Rest 2–3 minutes between work sets.";
  y = drawLines(
    page,
    wrapText(intro, regular, BODY_SIZE, CONTENT_WIDTH),
    MARGIN,
    y,
    regular,
    BODY_SIZE
  );
  y -= 6;

  y = drawHeading(page, "The Workout (both days)", MARGIN, y, bold);
  y = drawBullets(
    page,
    [
      "Squat — 3 x 8–12",
      "Bench Press — 3 x 8–12",
      "Rows — 3 x 8–12",
      "Deadlift — 1 x 5",
      "Lat Pulldown OR Chin-ups — 3 x 8–12",
      "Standing Barbell Press — 3 x 8–12",
    ],
    MARGIN,
    y,
    regular,
    CONTENT_WIDTH
  );
  y -= 4;

  y = drawHeading(page, "Warm Up", MARGIN, y, bold);
  y = drawBullets(
    page,
    [
      "2 warm-up sets per exercise before work sets.",
      "Set 1: lightest weight, 10 easy reps.",
      "Set 2: add weight, 5 reps. Then begin work sets.",
    ],
    MARGIN,
    y,
    regular,
    CONTENT_WIDTH
  );
  y -= 4;

  y = drawHeading(page, "3 x 8–12 Explained", MARGIN, y, bold);
  y = drawBullets(
    page,
    [
      "3 sets of 8 to 12 reps.",
      "Under 8 reps = too heavy. Go lighter.",
      "12 reps on all 3 sets = add smallest weight increment next time.",
    ],
    MARGIN,
    y,
    regular,
    CONTENT_WIDTH
  );
  y -= 4;

  y = drawHeading(page, "Superset Option", MARGIN, y, bold);
  y = drawLines(
    page,
    wrapText(
      "Optionally alternate bench and rows — one set each, back and forth. May not work in a busy gym.",
      regular,
      BODY_SIZE,
      CONTENT_WIDTH
    ),
    MARGIN,
    y,
    regular,
    BODY_SIZE
  );
  y -= 8;

  y = drawHeading(page, "Exercise Alternatives", MARGIN, y, bold);
  const alts = [
    "Bench Press: Dumbbell Bench, Chest Machine, Push-ups/Dips",
    "Rows: Barbell Row, Machine Row, TRX Row",
    "Standing Press: Dumbbell Press, Machine Shoulder Press",
    "Squat: Lunges, Leg Press, Step-ups",
    "Deadlift: Hamstring Curl Machine",
  ];
  y = drawBullets(page, alts, MARGIN, y, regular, CONTENT_WIDTH);
  y -= 4;

  y = drawHeading(page, "Starting Out", MARGIN, y, bold);
  y = drawBullets(
    page,
    [
      "Start lighter than you think.",
      "Use smaller bars (5–15 kg) if a 20 kg bar is too heavy.",
      "Pick one alternative and stick with it for months.",
    ],
    MARGIN,
    y,
    regular,
    CONTENT_WIDTH
  );

  page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  y = PAGE_HEIGHT - MARGIN;

  y = drawHeading(page, "Weight Log", MARGIN, y, bold);
  y -= 6;

  const columns = ["Date", "Day", "Lift", "Weight", "Notes"];
  const colWidths = [72, 48, 112, 64, CONTENT_WIDTH - 304];
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

  for (let row = 0; row < 24; row += 1) {
    if (y < MARGIN + 20) break;
    page.drawLine({
      start: { x: MARGIN, y: y - 6 },
      end: { x: PAGE_WIDTH - MARGIN, y: y - 6 },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.88),
    });
    y -= 22;
  }

  page.drawText("Peak Performance Code · 2 Day Basic Beginner Routine", {
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

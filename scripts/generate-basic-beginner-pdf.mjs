import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(
  __dirname,
  "../assets/documents/basic-beginner-routine.pdf"
);

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 15;
const TITLE_SIZE = 22;
const HEADING_SIZE = 13;
const BODY_SIZE = 10;

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

function drawBullets(page, items, x, y, font, maxWidth) {
  let cursorY = y;
  for (const item of items) {
    const wrapped = wrapText(`• ${item}`, font, BODY_SIZE, maxWidth - 8);
    cursorY = drawLines(page, wrapped, x + 8, cursorY, font, BODY_SIZE);
    cursorY -= 2;
  }
  return cursorY;
}

async function main() {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  page.drawText("3 Day Basic Beginner Routine", {
    x: MARGIN,
    y,
    size: TITLE_SIZE,
    font: bold,
    color: rgb(0.2, 0.12, 0.35),
  });
  y -= 26;

  page.drawText("Simple barbell training to get started", {
    x: MARGIN,
    y,
    size: 12,
    font: regular,
    color: rgb(0.35, 0.22, 0.55),
  });
  y -= 24;

  const intro =
    "Alternate Workout A and B, 3 days per week, with a rest day between lifting days. Each lift is 3 sets of 5 reps — the \"+\" means your last set is as many good reps as you can manage. Stop when form breaks down or the bar slows.";
  y = drawLines(
    page,
    wrapText(intro, regular, BODY_SIZE, CONTENT_WIDTH),
    MARGIN,
    y,
    regular,
    BODY_SIZE
  );
  y -= 8;

  y = drawHeading(page, "Workout A", MARGIN, y, bold);
  y = drawBullets(
    page,
    ["Barbell Row — 3 x 5+", "Bench Press — 3 x 5+", "Squat — 3 x 5+"],
    MARGIN,
    y,
    regular,
    CONTENT_WIDTH
  );
  y -= 6;

  y = drawHeading(page, "Workout B", MARGIN, y, bold);
  y = drawBullets(
    page,
    [
      "Chin-ups (or equivalent) — 3 x 5+",
      "Overhead Press — 3 x 5+",
      "Deadlift — 3 x 5+",
    ],
    MARGIN,
    y,
    regular,
    CONTENT_WIDTH
  );
  y -= 6;

  y = drawHeading(page, "Schedule", MARGIN, y, bold);
  y = drawBullets(
    page,
    [
      "Mon A · Wed B · Fri A, then rotate B · A · B.",
      "Do all sets of one lift, then move to the next.",
      "Rest 2–3 minutes between sets.",
    ],
    MARGIN,
    y,
    regular,
    CONTENT_WIDTH
  );
  y -= 6;

  y = drawHeading(page, "Progression", MARGIN, y, bold);
  y = drawBullets(
    page,
    [
      "Upper body: add 2.5 lb / 1.25 kg each session.",
      "Lower body: add 5 lb / 2.5 kg each session.",
      "If you get 10+ reps on the last set, add double the usual increment.",
      "If you fail to hit 15 total reps, deload 10% next time.",
    ],
    MARGIN,
    y,
    regular,
    CONTENT_WIDTH
  );
  y -= 6;

  y = drawHeading(page, "Cardio (2 days per week)", MARGIN, y, bold);
  y = drawBullets(
    page,
    [
      "One easy day — walk, jog, light cycling (15–30 min).",
      "One hard day — intervals or circuits (10–15 min).",
      "Do cardio after lifting if on the same day.",
    ],
    MARGIN,
    y,
    regular,
    CONTENT_WIDTH
  );
  y -= 6;

  y = drawHeading(page, "How Long?", MARGIN, y, bold);
  y = drawLines(
    page,
    wrapText(
      "Run for up to 3 months, then move to a more comprehensive program like GZCLP.",
      regular,
      BODY_SIZE,
      CONTENT_WIDTH
    ),
    MARGIN,
    y,
    regular,
    BODY_SIZE
  );

  page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  y = PAGE_HEIGHT - MARGIN;

  y = drawHeading(page, "Weight Log", MARGIN, y, bold);
  y -= 6;

  const columns = ["Date", "Workout", "Lift", "Weight", "Notes"];
  const colWidths = [72, 56, 112, 64, CONTENT_WIDTH - 304];
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

  page.drawText("Peak Performance Code · 3 Day Basic Beginner Routine", {
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

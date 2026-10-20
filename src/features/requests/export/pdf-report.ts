import "server-only";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

export interface PdfSection {
  heading: string;
  entries: Array<{ label: string; value: string }>;
}

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BODY_COLOR = rgb(0.12, 0.18, 0.24);
const MUTED_COLOR = rgb(0.38, 0.44, 0.5);
const ACCENT_COLOR = rgb(0.07, 0.31, 0.29);
const LIGHT_ACCENT = rgb(0.93, 0.96, 0.95);
const RULE_COLOR = rgb(0.85, 0.88, 0.88);
const ROW_COLOR = rgb(0.97, 0.98, 0.98);
const FOOTER_LIMIT = 66;
const BODY_TOP = 660;

function printable(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, "?").trim();
}

function wrapText(
  value: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const words = printable(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
      continue;
    }

    if (line) lines.push(line);
    line = "";
    for (const character of word) {
      if (font.widthOfTextAtSize(`${line}${character}`, size) > maxWidth && line) {
        lines.push(line);
        line = "";
      }
      line += character;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : ["-"];
}

export async function generatePdfReport(
  title: string,
  subtitle: string,
  sections: PdfSection[],
): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  let page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const pages: PDFPage[] = [page];
  let y = BODY_TOP;

  const drawHeader = (target: PDFPage, continued: boolean) => {
    target.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - 8,
      width: PAGE_WIDTH,
      height: 8,
      color: ACCENT_COLOR,
    });
    target.drawText("MUCITIZEN  /  MURANG'A COUNTY", {
      x: MARGIN,
      y: PAGE_HEIGHT - 38,
      size: 9,
      font: bold,
      color: ACCENT_COLOR,
    });
    target.drawText("MURANG'A COUNTY SERVICES", {
      x: MARGIN,
      y: PAGE_HEIGHT - 53,
      size: 7,
      font: regular,
      color: MUTED_COLOR,
    });

    const documentMark = continued ? "CONTINUED" : "OFFICIAL RECORD";
    const markWidth = bold.widthOfTextAtSize(documentMark, 7);
    target.drawText(documentMark, {
      x: PAGE_WIDTH - MARGIN - markWidth,
      y: PAGE_HEIGHT - 43,
      size: 7,
      font: bold,
      color: ACCENT_COLOR,
    });

    target.drawText(printable(title), {
      x: MARGIN,
      y: PAGE_HEIGHT - 91,
      size: 19,
      font: bold,
      color: BODY_COLOR,
      maxWidth: CONTENT_WIDTH,
    });
    target.drawText(printable(subtitle), {
      x: MARGIN,
      y: PAGE_HEIGHT - 110,
      size: 8,
      font: regular,
      color: MUTED_COLOR,
      maxWidth: CONTENT_WIDTH,
    });
    target.drawLine({
      start: { x: MARGIN, y: PAGE_HEIGHT - 125 },
      end: { x: PAGE_WIDTH - MARGIN, y: PAGE_HEIGHT - 125 },
      thickness: 0.8,
      color: RULE_COLOR,
    });
  };

  const createPage = (continued: boolean) => {
    page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push(page);
    drawHeader(page, continued);
    y = BODY_TOP;
  };

  const drawSectionHeading = (heading: string) => {
    page.drawRectangle({
      x: MARGIN,
      y: y - 22,
      width: CONTENT_WIDTH,
      height: 24,
      color: LIGHT_ACCENT,
    });
    page.drawRectangle({
      x: MARGIN,
      y: y - 22,
      width: 3,
      height: 24,
      color: ACCENT_COLOR,
    });
    page.drawText(printable(heading), {
      x: MARGIN + 12,
      y: y - 14,
      size: 9,
      font: bold,
      color: ACCENT_COLOR,
      maxWidth: CONTENT_WIDTH - 24,
    });
    y -= 34;
  };

  drawHeader(page, false);

  for (const section of sections) {
    if (y < FOOTER_LIMIT + 48) createPage(true);
    drawSectionHeading(section.heading);

    for (const entry of section.entries) {
      const label = printable(entry.label);
      const labelWidth = 112;
      const valueX = MARGIN + labelWidth + 16;
      const valueWidth = PAGE_WIDTH - MARGIN - valueX;
      const remainingLines = wrapText(entry.value, regular, 8.5, valueWidth);
      let isContinuation = false;

      while (remainingLines.length) {
        if (y < FOOTER_LIMIT + 28) {
          createPage(true);
          drawSectionHeading(`${section.heading} (continued)`);
        }

        const availableLines = Math.max(
          1,
          Math.floor((y - FOOTER_LIMIT - 18) / 11),
        );
        const currentLines = remainingLines.splice(0, availableLines);
        const rowHeight = Math.max(27, currentLines.length * 11 + 15);
        const rowBottom = y - rowHeight;

        page.drawRectangle({
          x: MARGIN,
          y: rowBottom,
          width: CONTENT_WIDTH,
          height: rowHeight,
          color: ROW_COLOR,
        });

        page.drawText(isContinuation ? `${label} (continued)` : label, {
          x: MARGIN + 10,
          y: y - 16,
          size: 7.5,
          font: bold,
          color: MUTED_COLOR,
          maxWidth: labelWidth,
        });
        currentLines.forEach((line, index) => {
          page.drawText(line, {
            x: valueX,
            y: y - 16 - index * 11,
            size: 8.5,
            font: regular,
            color: BODY_COLOR,
            maxWidth: valueWidth,
          });
        });

        y = rowBottom;
        if (remainingLines.length) {
          y -= 3;
          isContinuation = true;
        }
      }
    }
    y -= 12;
  }

  pages.forEach((currentPage, index) => {
    currentPage.drawLine({
      start: { x: MARGIN, y: 49 },
      end: { x: PAGE_WIDTH - MARGIN, y: 49 },
      thickness: 0.7,
      color: RULE_COLOR,
    });
    currentPage.drawText("muCitizen  |  Murang'a County service record", {
      x: MARGIN,
      y: 34,
      size: 7,
      font: regular,
      color: MUTED_COLOR,
    });
    const pageLabel = `Page ${index + 1} of ${pages.length}`;
    const pageLabelWidth = regular.widthOfTextAtSize(pageLabel, 7);
    currentPage.drawText(pageLabel, {
      x: PAGE_WIDTH - MARGIN - pageLabelWidth,
      y: 34,
      size: 7,
      font: regular,
      color: MUTED_COLOR,
    });
  });

  return document.save();
}

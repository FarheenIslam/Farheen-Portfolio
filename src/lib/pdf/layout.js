import { PDFDocument, StandardFonts, rgb, PDFName, PDFArray } from "pdf-lib";

/**
 * Small typographic layout toolkit built on pdf-lib.
 *
 * pdf-lib is pure JavaScript: it embeds the standard PDF fonts itself and never
 * touches the filesystem, so the documents render inside a Cloudflare Worker.
 * (@react-pdf/renderer loads fonts through Node package imports and cannot.)
 */

export const PAGE = { width: 595.28, height: 841.89 };
export const MARGIN = 48;
export const CONTENT_WIDTH = PAGE.width - MARGIN * 2;

export const COLORS = {
  navy: rgb(15 / 255, 42 / 255, 74 / 255),
  ink: rgb(22 / 255, 35 / 255, 58 / 255),
  body: rgb(61 / 255, 74 / 255, 95 / 255),
  muted: rgb(104 / 255, 117 / 255, 138 / 255),
  accent: rgb(37 / 255, 99 / 255, 235 / 255),
  line: rgb(223 / 255, 230 / 255, 240 / 255),
  wash: rgb(244 / 255, 247 / 255, 252 / 255),
  white: rgb(1, 1, 1),
  coverInk: rgb(201 / 255, 216 / 255, 238 / 255),
  coverMuted: rgb(159 / 255, 182 / 255, 216 / 255),
  coverLine: rgb(51 / 255, 84 / 255, 124 / 255),
};

const CHAR_MAP = {
  "\u2018": "'",
  "\u2019": "'",
  "\u201C": '"',
  "\u201D": '"',
  "\u2013": "-",
  "\u2014": "-",
  "\u2026": "...",
  "\u00A0": " ",
  "\u2022": "-",
  "\u2192": "->",
  "\u00B7": "-",
};

/** Standard PDF fonts only cover WinAnsi, so normalise and drop anything else. */
export function clean(value) {
  return String(value ?? "")
    .replace(/[\u2018\u2019\u201C\u201D\u2013\u2014\u2026\u00A0\u2022\u2192\u00B7]/g, (character) => CHAR_MAP[character])
    .replace(/[^\t\n\r\x20-\x7E\u00A1-\u00FF]/g, "");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function monthYear(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return clean(value);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function yearRange(start, end, current) {
  if (current) return end ? `Expected ${end}` : "Present";
  if (start && end) return String(start) === String(end) ? String(start) : `${start} — ${end}`;
  return start ? `${start} —` : end ? `${end}` : "";
}

export async function createWriter({ title, author, subject, keywords = "" }) {
  const doc = await PDFDocument.create();
  if (title) doc.setTitle(clean(title));
  if (author) doc.setAuthor(clean(author));
  if (subject) doc.setSubject(clean(subject));
  if (keywords) doc.setKeywords(keywords.split(",").map((keyword) => keyword.trim()));
  doc.setCreator("Portfolio CMS");
  doc.setProducer("Portfolio CMS");

  const fonts = {
    body: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    italic: await doc.embedFont(StandardFonts.HelveticaOblique),
    serif: await doc.embedFont(StandardFonts.TimesRoman),
    serifBold: await doc.embedFont(StandardFonts.TimesRomanBold),
  };

  return new Writer(doc, fonts);
}

class Writer {
  constructor(doc, fonts) {
    this.doc = doc;
    this.fonts = fonts;
    this.page = null;
    this.y = 0;
    this.pages = [];
  }

  get bottom() {
    return 64;
  }

  addPage({ cover = false } = {}) {
    const page = this.doc.addPage([PAGE.width, PAGE.height]);
    if (cover) {
      page.drawRectangle({ x: 0, y: 0, width: PAGE.width, height: PAGE.height, color: COLORS.navy });
    }
    this.page = page;
    this.pages.push(page);
    this.y = cover ? PAGE.height : PAGE.height - MARGIN;
    return page;
  }

  ensure(height) {
    if (!this.page || this.y - height < this.bottom) this.addPage();
  }

  wrap(text, font, size, maxWidth) {
    const words = clean(text).replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
    if (words.length === 0) return [];

    const lines = [];
    let line = "";

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      if (font.widthOfTextAtSize(word, size) <= maxWidth) {
        line = word;
        continue;
      }
      // A single word longer than the column: break it by characters.
      let chunk = "";
      for (const character of word) {
        if (chunk && font.widthOfTextAtSize(chunk + character, size) > maxWidth) {
          lines.push(chunk);
          chunk = character;
        } else {
          chunk += character;
        }
      }
      line = chunk;
    }
    if (line) lines.push(line);
    return lines;
  }

  /** Draw already-wrapped lines, starting new pages as needed. */
  flowLines(lines, { font, size, color = COLORS.body, x = MARGIN, lineHeight = 1.5, gapAfter = 0 }) {
    const step = size * lineHeight;
    for (const line of lines) {
      if (this.y - step < this.bottom) this.addPage();
      this.page.drawText(line, { x, y: this.y - size * 0.82, size, font, color });
      this.y -= step;
    }
    this.y -= gapAfter;
  }

  paragraph(text, { size = 9.5, font = this.fonts.body, color = COLORS.body, lineHeight = 1.55, gap = 0, x = MARGIN, maxWidth = CONTENT_WIDTH } = {}) {
    const lines = this.wrap(text, font, size, maxWidth);
    if (lines.length === 0) return;
    const step = size * lineHeight;
    for (const line of lines) {
      if (this.y - step < this.bottom) this.addPage();
      this.page.drawText(line, { x, y: this.y - size * 0.82, size, font, color });
      this.y -= step;
    }
    this.y -= gap;
  }

  heading(text, { gapBefore = 6, gapAfter = 12 } = {}) {
    this.ensure(gapBefore + 40 + gapAfter);
    this.y -= gapBefore;
    this.page.drawText(clean(text), {
      x: MARGIN,
      y: this.y - 15,
      size: 15.5,
      font: this.fonts.serif,
      color: COLORS.navy,
    });
    this.y -= 24;
    this.rule();
    this.y -= gapAfter;
  }

  eyebrow(text) {
    this.ensure(16);
    this.page.drawText(clean(text).toUpperCase(), {
      x: MARGIN,
      y: this.y - 8,
      size: 7.6,
      font: this.fonts.bold,
      color: COLORS.accent,
    });
    this.y -= 15;
  }

  rule({ gap = 8 } = {}) {
    this.ensure(gap + 1);
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: MARGIN + CONTENT_WIDTH, y: this.y },
      thickness: 0.7,
      color: COLORS.line,
    });
    this.y -= gap;
  }

  empty(text) {
    this.paragraph(text, { size: 8.5, color: COLORS.muted, gap: 4 });
  }

  /**
   * A content card. When the whole card fits on one page it gets a washed
   * background and an accent bar; otherwise it degrades to flowing text so a
   * long description can continue across pages.
   */
  entry({ title, meta = [], body, tags = [], links = [], gap = 6 }) {
    const pad = 10;
    const inner = CONTENT_WIDTH - pad * 2;
    const titleLines = this.wrap(title, this.fonts.bold, 10.5, inner);
    const metaLines = meta.filter(Boolean).map((line) => this.wrap(line, this.fonts.body, 8.2, inner));
    const bodyLines = body ? this.wrap(body, this.fonts.body, 9, inner) : [];
    const tagLines = tags.length ? this.wrap(tags.join("  ·  "), this.fonts.body, 8, inner) : [];
    const linkRows = links.filter((link) => link?.url);

    const titleHeight = titleLines.length * 13;
    const metaHeight = metaLines.reduce((total, lines) => total + lines.length * 10.6, 0);
    const bodyHeight = bodyLines.length * 13.2 + (bodyLines.length ? 3 : 0);
    const tagHeight = tagLines.length * 10.6 + (tagLines.length ? 4 : 0);
    const linkHeight = linkRows.length * 12 + (linkRows.length ? 3 : 0);
    const height = pad * 2 + titleHeight + metaHeight + bodyHeight + tagHeight + linkHeight;

    const area = PAGE.height - MARGIN - this.bottom;

    if (height <= area) {
      if (this.y - height < this.bottom) this.addPage();
      const top = this.y;
      this.page.drawRectangle({
        x: MARGIN,
        y: top - height,
        width: CONTENT_WIDTH,
        height,
        color: COLORS.wash,
      });
      this.page.drawRectangle({ x: MARGIN, y: top - height, width: 2, height, color: COLORS.accent });

      this.y = top - pad;
      for (const line of titleLines) {
        this.page.drawText(line, {
          x: MARGIN + pad,
          y: this.y - 10.5 * 0.82,
          size: 10.5,
          font: this.fonts.bold,
          color: COLORS.ink,
        });
        this.y -= 13;
      }
      for (const lines of metaLines) {
        for (const line of lines) {
          this.page.drawText(line, {
            x: MARGIN + pad,
            y: this.y - 8.2 * 0.82,
            size: 8.2,
            font: this.fonts.body,
            color: COLORS.muted,
          });
          this.y -= 10.6;
        }
      }
      if (bodyLines.length) {
        this.y -= 3;
        for (const line of bodyLines) {
          this.page.drawText(line, {
            x: MARGIN + pad,
            y: this.y - 9 * 0.82,
            size: 9,
            font: this.fonts.body,
            color: COLORS.body,
          });
          this.y -= 13.2;
        }
      }
      if (tagLines.length) {
        this.y -= 4;
        for (const line of tagLines) {
          this.page.drawText(line, {
            x: MARGIN + pad,
            y: this.y - 8 * 0.82,
            size: 8,
            font: this.fonts.body,
            color: COLORS.accent,
          });
          this.y -= 10.6;
        }
      }
      if (linkRows.length) {
        this.y -= 3;
        for (const link of linkRows) {
          const label = clean(link.label || link.url);
          const width = Math.min(
            this.fonts.body.widthOfTextAtSize(label, 8),
            CONTENT_WIDTH - pad * 2
          );
          const baseline = this.y - 8 * 0.82;
          this.page.drawText(label, {
            x: MARGIN + pad,
            y: baseline,
            size: 8,
            font: this.fonts.body,
            color: COLORS.accent,
          });
          this.addLink({
            x: MARGIN + pad,
            y: baseline - 2,
            width,
            height: 11,
            url: link.url,
          });
          this.y -= 12;
        }
      }
      this.y = top - height - gap;
      return;
    }

    // Tall entry: no background, content flows and can split across pages.
    this.flowLines(titleLines, { font: this.fonts.bold, size: 10.5, color: COLORS.ink, x: MARGIN, lineHeight: 1.3 });
    for (const lines of metaLines) {
      this.flowLines(lines, { font: this.fonts.body, size: 8.2, color: COLORS.muted, lineHeight: 1.35 });
    }
    if (bodyLines.length) {
      this.y -= 3;
      this.flowLines(bodyLines, { font: this.fonts.body, size: 9, color: COLORS.body, lineHeight: 1.5 });
    }
    if (tagLines.length) {
      this.y -= 4;
      this.flowLines(tagLines, { font: this.fonts.body, size: 8, color: COLORS.accent, lineHeight: 1.35 });
    }
    this.y -= gap;
  }

  chips(items, { size = 7.6, height = 15 } = {}) {
    const padX = 7;
    const gapX = 5;
    const gapY = 5;
    let x = MARGIN;
    let rowHeight = 0;

    this.ensure(height + gapY);

    for (const item of items) {
      const label = clean(item);
      const width = this.fonts.body.widthOfTextAtSize(label, size) + padX * 2;
      if (x + width > MARGIN + CONTENT_WIDTH) {
        x = MARGIN;
        this.y -= rowHeight + gapY;
        rowHeight = 0;
        if (this.y - height < this.bottom) this.addPage();
      }
      this.page.drawRectangle({
        x,
        y: this.y - height,
        width,
        height,
        borderColor: COLORS.line,
        borderWidth: 0.7,
        color: COLORS.white,
      });
      this.page.drawText(label, {
        x: x + padX,
        y: this.y - height + (height - size) / 2 + 0.8,
        size,
        font: this.fonts.body,
        color: COLORS.ink,
      });
      x += width + gapX;
      rowHeight = height;
    }
    this.y -= rowHeight + gapY;
  }

  bullets(items, { size = 9, gap = 3 } = {}) {
    for (const item of items) {
      const lines = this.wrap(item, this.fonts.body, size, CONTENT_WIDTH - 14);
      if (lines.length === 0) continue;
      const step = size * 1.5;
      if (this.y - step < this.bottom) this.addPage();
      this.page.drawCircle({
        x: MARGIN + 2.6,
        y: this.y - size * 0.6,
        size: 1.4,
        color: COLORS.accent,
      });
      for (const line of lines) {
        if (this.y - step < this.bottom) this.addPage();
        this.page.drawText(line, {
          x: MARGIN + 14,
          y: this.y - size * 0.82,
          size,
          font: this.fonts.body,
          color: COLORS.body,
        });
        this.y -= step;
      }
      this.y -= gap;
    }
  }

  /** A single-line clickable link in the body column. */
  linkRow(label, url, { size = 8.5, gap = 3, color = COLORS.accent } = {}) {
    if (!url) return;
    const text = clean(label || url);
    const step = size * 1.5;
    this.ensure(step);
    const baseline = this.y - size * 0.82;
    const width = Math.min(this.fonts.body.widthOfTextAtSize(text, size), CONTENT_WIDTH);
    this.page.drawText(text, { x: MARGIN, y: baseline, size, font: this.fonts.body, color });
    this.addLink({ x: MARGIN, y: baseline - 2, width, height: size + 4, url });
    this.y -= step + gap;
  }

  addLink({ x, y, width, height, url }) {
    const context = this.doc.context;
    const annotation = context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [x, y, x + width, y + height],
      Border: [0, 0, 0],
      A: { Type: "Action", S: "URI", URI: url },
    });
    const reference = context.register(annotation);
    let annotations = this.page.node.lookup(PDFName.of("Annots"), PDFArray);
    if (!annotations) {
      annotations = context.obj([]);
      this.page.node.set(PDFName.of("Annots"), annotations);
    }
    annotations.push(reference);
  }

  finish(footerLabel) {
    const total = this.pages.length;
    this.pages.forEach((page, index) => {
      if (index === 0) return;
      const y = 30;
      page.drawLine({
        start: { x: MARGIN, y: y + 12 },
        end: { x: MARGIN + CONTENT_WIDTH, y: y + 12 },
        thickness: 0.6,
        color: COLORS.line,
      });
      page.drawText(clean(footerLabel), {
        x: MARGIN,
        y,
        size: 7.5,
        font: this.fonts.body,
        color: COLORS.muted,
      });
      const counter = `${index + 1} / ${total}`;
      const width = this.fonts.body.widthOfTextAtSize(counter, 7.5);
      page.drawText(counter, {
        x: MARGIN + CONTENT_WIDTH - width,
        y,
        size: 7.5,
        font: this.fonts.body,
        color: COLORS.muted,
      });
    });
    return this.doc.save();
  }
}

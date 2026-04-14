import type { LanguageDef } from "./languages.js";

export type LineCounts = {
  code: number;
  comment: number;
  blank: number;
  total: number;
};

export function emptyCounts(): LineCounts {
  return { code: 0, comment: 0, blank: 0, total: 0 };
}

export function addCounts(a: LineCounts, b: LineCounts): LineCounts {
  return {
    code: a.code + b.code,
    comment: a.comment + b.comment,
    blank: a.blank + b.blank,
    total: a.total + b.total,
  };
}

export function countLines(content: string, lang: LanguageDef): LineCounts {
  const lines = content.replace(/\r\n/g, "\n").split("\n");

  let blockEnd: string | null = null;
  let stringEnd: string | null = null;
  let stringEscape: string | null = null;
  let stringMultiline = false;

  const counts = emptyCounts();

  for (const line of lines) {
    let hasCode = false;
    let hasComment = false;
    const trimmed = line.length === 0 || /^\s*$/.test(line);

    if (blockEnd !== null) hasComment = true;
    if (stringEnd !== null) hasCode = true;

    let i = 0;
    const len = line.length;

    while (i < len) {
      if (blockEnd !== null) {
        if (line.startsWith(blockEnd, i)) {
          i += blockEnd.length;
          blockEnd = null;
        } else {
          i++;
        }
        continue;
      }

      if (stringEnd !== null) {
        const ch = line[i];
        if (stringEscape && ch === stringEscape && i + 1 < len) {
          i += 2;
          continue;
        }
        if (line.startsWith(stringEnd, i)) {
          i += stringEnd.length;
          stringEnd = null;
          stringEscape = null;
          stringMultiline = false;
        } else {
          i++;
        }
        continue;
      }

      const ch = line[i];
      if (ch === " " || ch === "\t") {
        i++;
        continue;
      }

      let matched = false;
      for (const marker of lang.line) {
        if (line.startsWith(marker, i)) {
          hasComment = true;
          i = len;
          matched = true;
          break;
        }
      }
      if (matched) continue;

      for (const [start, end] of lang.block) {
        if (line.startsWith(start, i)) {
          hasComment = true;
          blockEnd = end;
          i += start.length;
          matched = true;
          break;
        }
      }
      if (matched) continue;

      for (const rule of lang.strings) {
        if (line.startsWith(rule.start, i)) {
          hasCode = true;
          stringEnd = rule.end;
          stringEscape = rule.escape ?? null;
          stringMultiline = rule.multiline ?? false;
          i += rule.start.length;
          matched = true;
          break;
        }
      }
      if (matched) continue;

      hasCode = true;
      i++;
    }

    if (stringEnd !== null && !stringMultiline) {
      stringEnd = null;
      stringEscape = null;
    }

    counts.total++;
    if (hasCode) counts.code++;
    else if (hasComment) counts.comment++;
    else if (trimmed) counts.blank++;
    else counts.blank++;
  }

  return counts;
}

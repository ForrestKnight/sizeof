export type Comparison = {
  label: string;
  value: string;
  detail?: string;
};

const CHARS_PER_PAPERBACK = 480_000;
const CHARS_PER_WAR_AND_PEACE = 3_500_000;
const CHARS_PER_BIBLE = 4_700_000;
const CHARS_PER_LOTR_TRILOGY = 2_900_000;
const READ_CHARS_PER_MINUTE = 1500;
const LINES_PER_PRINTED_PAGE = 50;
const TWEET_CHARS = 280;

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function generateComparisons(totalBytes: number, totalLines: number): Comparison[] {
  const out: Comparison[] = [];

  const paperbacks = totalBytes / CHARS_PER_PAPERBACK;
  out.push({
    label: "Paperback novels",
    value:
      paperbacks < 1
        ? `${(paperbacks * 100).toFixed(0)}% of one`
        : paperbacks < 10
          ? paperbacks.toFixed(2)
          : fmt(Math.round(paperbacks)),
    detail: "≈ 80,000 words each",
  });

  const wap = (totalBytes / CHARS_PER_WAR_AND_PEACE) * 100;
  out.push({
    label: "War and Peace",
    value: wap < 0.01 ? "<0.01%" : `${wap.toFixed(2)}%`,
    detail: "Tolstoy, 1869",
  });

  const lotr = (totalBytes / CHARS_PER_LOTR_TRILOGY) * 100;
  out.push({
    label: "Lord of the Rings",
    value: lotr < 0.01 ? "<0.01%" : `${lotr.toFixed(2)}%`,
    detail: "the full trilogy",
  });

  const bible = (totalBytes / CHARS_PER_BIBLE) * 100;
  out.push({
    label: "The Bible",
    value: bible < 0.01 ? "<0.01%" : `${bible.toFixed(2)}%`,
    detail: "King James, 783k words",
  });

  const minutes = Math.round(totalBytes / READ_CHARS_PER_MINUTE);
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  out.push({
    label: "Read aloud",
    value: hours > 24 ? `${Math.floor(hours / 24)}d ${hours % 24}h` : hours > 0 ? `${hours}h ${remMin}m` : `${minutes}m`,
    detail: "at 250 words per minute",
  });

  const pages = Math.ceil(totalLines / LINES_PER_PRINTED_PAGE);
  out.push({
    label: "Printed pages",
    value: fmt(pages),
    detail: "single-spaced source",
  });

  const tweets = Math.round(totalBytes / TWEET_CHARS);
  out.push({
    label: "Tweets to type",
    value: fmt(tweets),
    detail: "280 chars each",
  });

  out.push({
    label: "Total weight",
    value: fmtBytes(totalBytes),
    detail: "raw source bytes",
  });

  return out;
}

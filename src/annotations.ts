export type AnnotationKind = "TODO" | "FIXME" | "HACK" | "XXX" | "NOTE" | "BUG" | "OPTIMIZE" | "REVIEW";

export type Annotation = {
  kind: AnnotationKind;
  file: string;
  line: number;
  text: string;
};

const ANNOTATION_RE = /\b(TODO|FIXME|HACK|XXX|NOTE|BUG|OPTIMIZE|REVIEW)\b\s*[:\-]?\s*(.*)/;

export function harvestAnnotations(file: string, content: string): Annotation[] {
  const out: Annotation[] = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = ANNOTATION_RE.exec(line);
    if (!m) continue;
    const kind = m[1] as AnnotationKind;
    const text = (m[2] ?? "").trim().slice(0, 200);
    out.push({ kind, file, line: i + 1, text });
  }
  return out;
}

export function summarizeAnnotations(items: Annotation[]): Record<AnnotationKind, number> {
  const summary: Record<AnnotationKind, number> = {
    TODO: 0,
    FIXME: 0,
    HACK: 0,
    XXX: 0,
    NOTE: 0,
    BUG: 0,
    OPTIMIZE: 0,
    REVIEW: 0,
  };
  for (const a of items) summary[a.kind]++;
  return summary;
}

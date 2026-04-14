import { Hono } from "hono";
import { HomePage } from "./ui/home.js";
import { ReportPage, ErrorPage } from "./ui/report.js";
import type { ReportData, LanguageRow, NotableFile } from "./ui/report.js";
import { parseRepoUrl, fetchRepoMetadata, fetchTarball, RepoError } from "./fetch-repo.js";
import { iterateTarball } from "./untar.js";
import { detectLanguage } from "./languages.js";
import { countLines } from "./counter.js";
import { harvestAnnotations, summarizeAnnotations, type Annotation } from "./annotations.js";
import { generateComparisons } from "./compare.js";

type Bindings = {
  GITHUB_TOKEN?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

const SKIP_DIRS = [
  "node_modules/",
  ".git/",
  "vendor/",
  "dist/",
  "build/",
  ".next/",
  ".nuxt/",
  "target/",
  "__pycache__/",
  ".venv/",
  "venv/",
  "bower_components/",
  ".pnpm-store/",
  ".yarn/",
  "out/",
  ".turbo/",
  ".cache/",
];

const SKIP_FILES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lock",
  "bun.lockb",
  "composer.lock",
  "Gemfile.lock",
  "Cargo.lock",
  "poetry.lock",
  "Pipfile.lock",
  "go.sum",
]);

const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_TOTAL_FILES = 8000;

function shouldSkipPath(path: string): boolean {
  for (const d of SKIP_DIRS) if (path.includes(d)) return true;
  const base = path.split("/").pop() ?? "";
  if (SKIP_FILES.has(base)) return true;
  if (base.endsWith(".min.js")) return true;
  if (base.endsWith(".min.css")) return true;
  if (base.endsWith(".map")) return true;
  return false;
}

function looksBinary(bytes: Uint8Array): boolean {
  const probeLen = Math.min(bytes.length, 8192);
  let nulls = 0;
  for (let i = 0; i < probeLen; i++) {
    if (bytes[i] === 0) nulls++;
    if (nulls > 1) return true;
  }
  return false;
}

app.get("/", (c) => c.html(<HomePage />));

app.get("/scan", async (c) => {
  const url = c.req.query("url");
  if (!url) return c.redirect("/");

  const start = Date.now();

  const spec = parseRepoUrl(url);
  if (!spec) {
    return c.html(
      <ErrorPage message="Could not parse that URL. Provide a github.com or codeberg.org repository link." />,
      400,
    );
  }

  try {
    const meta = await fetchRepoMetadata(spec, c.env.GITHUB_TOKEN);
    const tarball = await fetchTarball(meta, c.env.GITHUB_TOKEN);

    const decoder = new TextDecoder("utf-8", { fatal: false, ignoreBOM: true });
    const langStats = new Map<string, LanguageRow>();
    const allAnnotations: Annotation[] = [];
    const fileStats: { path: string; language: string; lines: number; comments: number }[] = [];

    let totalBytes = 0;
    let totalFiles = 0;

    for (const entry of iterateTarball(tarball)) {
      if (entry.type !== "file") continue;
      if (entry.size === 0) continue;
      if (entry.size > MAX_FILE_BYTES) continue;
      if (totalFiles >= MAX_TOTAL_FILES) break;

      const parts = entry.name.split("/");
      const path = parts.slice(1).join("/");
      if (!path) continue;
      if (shouldSkipPath(path)) continue;
      if (looksBinary(entry.content)) continue;

      const content = decoder.decode(entry.content);
      const firstNewline = content.indexOf("\n");
      const firstLine = firstNewline >= 0 ? content.slice(0, firstNewline) : content;

      const lang = detectLanguage(path, firstLine);
      if (!lang) continue;

      const counts = countLines(content, lang);

      let row = langStats.get(lang.name);
      if (!row) {
        row = { name: lang.name, files: 0, code: 0, comment: 0, blank: 0, total: 0, bytes: 0 };
        langStats.set(lang.name, row);
      }
      row.files++;
      row.code += counts.code;
      row.comment += counts.comment;
      row.blank += counts.blank;
      row.total += counts.total;
      row.bytes += entry.size;

      totalBytes += entry.size;
      totalFiles++;

      if (allAnnotations.length < 5000) {
        const anns = harvestAnnotations(path, content);
        allAnnotations.push(...anns);
      }

      fileStats.push({ path, language: lang.name, lines: counts.total, comments: counts.comment });
    }

    if (totalFiles === 0) {
      return c.html(
        <ErrorPage message="No source files detected in this repository — it may be empty, binary-only, or use unsupported languages." />,
        404,
      );
    }

    const totals = { code: 0, comment: 0, blank: 0, total: 0, bytes: totalBytes, files: totalFiles };
    for (const row of langStats.values()) {
      totals.code += row.code;
      totals.comment += row.comment;
      totals.blank += row.blank;
      totals.total += row.total;
    }

    const languages = [...langStats.values()].sort((a, b) => b.code - a.code);

    const toNotable = (f: { path: string; language: string; lines: number }): NotableFile => ({
      path: f.path,
      language: f.language,
      lines: f.lines,
    });

    const longest = [...fileStats].sort((a, b) => b.lines - a.lines).slice(0, 8).map(toNotable);
    const shortest = [...fileStats]
      .filter((f) => f.lines > 0)
      .sort((a, b) => a.lines - b.lines)
      .slice(0, 8)
      .map(toNotable);
    const mostCommented = [...fileStats]
      .filter((f) => f.comments > 0)
      .sort((a, b) => b.comments - a.comments)
      .slice(0, 8)
      .map((f) => ({ path: f.path, language: f.language, lines: f.comments }));

    const annotationCounts = summarizeAnnotations(allAnnotations);
    const comparisons = generateComparisons(totalBytes, totals.code);

    const data: ReportData = {
      repoUrl: meta.htmlUrl,
      repoName: `${spec.owner}/${spec.repo}`,
      host: spec.host,
      branch: meta.defaultBranch,
      description: meta.description,
      scannedAt: new Date().toISOString().slice(0, 10),
      scanMs: Date.now() - start,
      totals,
      languages,
      comparisons,
      annotations: allAnnotations,
      annotationCounts,
      longest,
      shortest,
      mostCommented,
    };

    return c.html(<ReportPage data={data} />);
  } catch (err) {
    if (err instanceof RepoError) {
      return c.html(<ErrorPage message={err.message} />, err.status as any);
    }
    console.error(err);
    return c.html(
      <ErrorPage message="An unexpected error occurred while scanning the repository. Try again or pick a smaller repo." />,
      500,
    );
  }
});

export default app;

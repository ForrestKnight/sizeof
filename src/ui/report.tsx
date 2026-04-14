import type { FC } from "hono/jsx";
import { Layout } from "./layout.js";
import type { Comparison } from "../compare.js";
import type { Annotation, AnnotationKind } from "../annotations.js";

export type LanguageRow = {
  name: string;
  files: number;
  code: number;
  comment: number;
  blank: number;
  total: number;
  bytes: number;
};

export type NotableFile = {
  path: string;
  language: string;
  lines: number;
};

export type ReportData = {
  repoUrl: string;
  repoName: string;
  host: "github" | "codeberg";
  branch: string;
  description: string | null;
  scannedAt: string;
  scanMs: number;
  totals: { code: number; comment: number; blank: number; total: number; bytes: number; files: number };
  languages: LanguageRow[];
  comparisons: Comparison[];
  annotations: Annotation[];
  annotationCounts: Record<AnnotationKind, number>;
  longest: NotableFile[];
  shortest: NotableFile[];
  mostCommented: NotableFile[];
};

const fmt = (n: number) => n.toLocaleString("en-US");
const pct = (n: number, total: number) => (total === 0 ? "0%" : `${((n / total) * 100).toFixed(1)}%`);

export const ReportPage: FC<{ data: ReportData }> = ({ data }) => {
  const totalLines = data.totals.code + data.totals.comment + data.totals.blank;
  const ratioPct = totalLines === 0 ? 0 : (data.totals.comment / totalLines) * 100;

  return (
    <Layout title={`sizeof — ${data.repoName}`}>
      <section class="report-header">
        <div>
          <div class="label" style="margin-bottom: 16px;">Measurement report</div>
          <h2 class="report-title">
            {data.repoName.split("/")[0]}<em>/{data.repoName.split("/")[1]}</em>
          </h2>
          {data.description ? (
            <p style="color: var(--text-dim); margin-top: 16px; max-width: 640px; font-size: 13px;">
              {data.description}
            </p>
          ) : null}
        </div>
        <dl class="report-meta">
          <dt>Host</dt>
          <dd>{data.host}</dd>
          <dt>Branch</dt>
          <dd>{data.branch}</dd>
          <dt>Files scanned</dt>
          <dd class="num">{fmt(data.totals.files)}</dd>
          <dt>Scan time</dt>
          <dd class="num">{data.scanMs}ms</dd>
          <dt>Scanned at</dt>
          <dd>{data.scannedAt}</dd>
        </dl>
      </section>

      <div class="section-head">
        <span class="section-num">01</span>
        <span class="section-title">Overview</span>
        <div class="section-rule" />
      </div>

      <section class="stat-grid">
        <div class="stat">
          <div class="stat-label">Lines of code</div>
          <div class="stat-value">{fmt(data.totals.code)}</div>
          <div class="stat-detail">{pct(data.totals.code, totalLines)} of total</div>
        </div>
        <div class="stat">
          <div class="stat-label">Comment lines</div>
          <div class="stat-value">{fmt(data.totals.comment)}</div>
          <div class="stat-detail">{pct(data.totals.comment, totalLines)} of total</div>
        </div>
        <div class="stat">
          <div class="stat-label">Blank lines</div>
          <div class="stat-value">{fmt(data.totals.blank)}</div>
          <div class="stat-detail">{pct(data.totals.blank, totalLines)} of total</div>
        </div>
        <div class="stat">
          <div class="stat-label">Languages</div>
          <div class="stat-value">{data.languages.length}</div>
          <div class="stat-detail">detected in tree</div>
        </div>
      </section>

      <div class="section-head">
        <span class="section-num">02</span>
        <span class="section-title">Language breakdown</span>
        <div class="section-rule" />
      </div>

      <table class="lang-table">
        <thead>
          <tr>
            <th>Language</th>
            <th>Files</th>
            <th>Code</th>
            <th>Comment</th>
            <th>Blank</th>
            <th style="width: 220px;">Share</th>
          </tr>
        </thead>
        <tbody>
          {data.languages.map((row) => {
            const share = data.totals.code === 0 ? 0 : (row.code / data.totals.code) * 100;
            return (
              <tr>
                <td class="lang-name">{row.name}</td>
                <td>{fmt(row.files)}</td>
                <td>{fmt(row.code)}</td>
                <td>{fmt(row.comment)}</td>
                <td>{fmt(row.blank)}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 12px; justify-content: flex-end;">
                    <span style="color: var(--text-dim); min-width: 50px; text-align: right;">{share.toFixed(1)}%</span>
                    <div class="lang-bar" style="width: 120px;">
                      <div class="lang-bar-fill" style={`width: ${share}%`} />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div class="section-head">
        <span class="section-num">03</span>
        <span class="section-title">Notable files</span>
        <div class="section-rule" />
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr;">
        <div class="files-list" style="border-right: 1px solid var(--border);">
          <h4>Longest files</h4>
          <ol>
            {data.longest.map((f) => (
              <li>
                <span class="path">{f.path}</span>
                <span class="num">{fmt(f.lines)}</span>
              </li>
            ))}
          </ol>
        </div>
        <div class="files-list" style="border-right: 1px solid var(--border);">
          <h4>Most commented</h4>
          <ol>
            {data.mostCommented.map((f) => (
              <li>
                <span class="path">{f.path}</span>
                <span class="num">{fmt(f.lines)}</span>
              </li>
            ))}
          </ol>
        </div>
        <div class="files-list">
          <h4>Shortest files</h4>
          <ol>
            {data.shortest.map((f) => (
              <li>
                <span class="path">{f.path}</span>
                <span class="num">{fmt(f.lines)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div class="section-head" style="border-top: 1px solid var(--border);">
        <span class="section-num">04</span>
        <span class="section-title">Annotations harvested</span>
        <div class="section-rule" />
        <span class="label num">{fmt(data.annotations.length)} TOTAL</span>
      </div>

      <div class="annotations-list">
        <div class="annotations-summary">
          {(Object.keys(data.annotationCounts) as AnnotationKind[])
            .filter((k) => data.annotationCounts[k] > 0)
            .map((k) => (
              <span>
                <strong>{data.annotationCounts[k]}</strong>
                {k}
              </span>
            ))}
        </div>
        {data.annotations.length === 0 ? (
          <p style="color: var(--text-faint); font-size: 12px; text-transform: uppercase; letter-spacing: 0.18em;">
            None found. A pristine codebase, or a quiet one.
          </p>
        ) : (
          data.annotations.slice(0, 50).map((a) => (
            <div class="annotation">
              <span class="annotation-kind">{a.kind}</span>
              <span class="annotation-text">{a.text || "(no message)"}</span>
              <span class="annotation-loc">
                {a.file}:{a.line}
              </span>
            </div>
          ))
        )}
        {data.annotations.length > 50 ? (
          <p style="color: var(--text-faint); margin-top: 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em;">
            + {fmt(data.annotations.length - 50)} more
          </p>
        ) : null}
      </div>

      <div class="section-head">
        <span class="section-num">05</span>
        <span class="section-title">Size comparison</span>
        <div class="section-rule" />
      </div>

      <section class="compare-grid">
        {data.comparisons.map((c) => (
          <div class="compare">
            <div class="compare-label">{c.label}</div>
            <div class="compare-value">{c.value}</div>
            {c.detail ? <div class="compare-detail">{c.detail}</div> : null}
          </div>
        ))}
      </section>

      <div style="padding: 32px 40px; text-align: center; border-top: 1px solid var(--border);">
        <a href="/" class="label" style="color: var(--accent); text-decoration: none;">
          ← Scan another repository
        </a>
      </div>
    </Layout>
  );
};

export const ErrorPage: FC<{ message: string }> = ({ message }) => (
  <Layout title="sizeof — error">
    <section class="hero">
      <span class="label hero-eyebrow">Instrument error</span>
      <h1 style="font-size: clamp(36px, 5vw, 56px);">Could not scan.</h1>
      <p class="hero-desc">{message}</p>
      <a href="/" class="label" style="color: var(--accent); text-decoration: none;">
        ← Try another repository
      </a>
    </section>
  </Layout>
);

export const LoadingPage: FC<{ url: string }> = ({ url }) => (
  <Layout title="sizeof — scanning">
    <section class="hero">
      <span class="label hero-eyebrow">Instrument engaged</span>
      <h1 style="font-size: clamp(36px, 5vw, 56px);">
        Scanning <em>in progress</em>
      </h1>
      <p class="hero-desc">{url}</p>
      <div class="loading">Measuring</div>
    </section>
  </Layout>
);

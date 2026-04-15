import { raw } from "hono/html";
import type { FC } from "hono/jsx";

const STYLES = `
  :root {
    --bg: #0A1612;
    --surface: #0F1F1A;
    --surface-2: #122723;
    --border: rgba(244, 235, 217, 0.08);
    --border-mid: rgba(244, 235, 217, 0.14);
    --border-strong: rgba(244, 235, 217, 0.22);
    --text: #F4EBD9;
    --text-dim: rgba(244, 235, 217, 0.55);
    --text-faint: rgba(244, 235, 217, 0.32);
    --accent: #E8A87C;
    --accent-dim: rgba(232, 168, 124, 0.6);
    --code-bg: #1A2A24;
    --highlight: rgba(232, 168, 124, 0.18);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'IBM Plex Mono', ui-monospace, Menlo, Monaco, monospace;
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
    line-height: 1.6;
    font-feature-settings: "tnum", "kern", "ss01";
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
  }

  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle at 20% 0%, rgba(232, 168, 124, 0.04), transparent 50%),
                      radial-gradient(circle at 80% 100%, rgba(244, 235, 217, 0.02), transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  .layout {
    max-width: 1440px;
    margin: 0 auto;
    border-left: 1px solid var(--border);
    border-right: 1px solid var(--border);
    min-height: 100vh;
    position: relative;
    z-index: 1;
  }

  .serif {
    font-family: 'Newsreader', Georgia, 'Times New Roman', serif;
    font-weight: 300;
  }

  .label {
    text-transform: uppercase;
    letter-spacing: 0.22em;
    font-size: 11px;
    color: var(--text-dim);
    font-weight: 400;
  }

  .label-strong { color: var(--text); }

  .num { font-variant-numeric: tabular-nums; }

  /* ── HEADER ──────────────────────────────────── */

  .header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 28px 40px;
    border-bottom: 1px solid var(--border);
    position: relative;
  }

  .header-left { justify-self: start; }
  .header-right { justify-self: end; }

  .brand {
    font-family: 'Newsreader', serif;
    font-weight: 300;
    font-size: 32px;
    letter-spacing: 0.36em;
    text-align: center;
    color: var(--text);
    text-decoration: none;
    padding-left: 0.36em;
    font-style: italic;
  }

  .brand .paren { color: var(--accent); font-style: normal; opacity: 0.7; }

  .meta-tag {
    text-transform: uppercase;
    letter-spacing: 0.22em;
    font-size: 10px;
    color: var(--text-faint);
  }

  .gh-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.22em;
    font-size: 10px;
    padding: 8px 14px;
    border: 1px solid var(--border-mid);
    transition: all 180ms ease;
  }

  .gh-link:hover {
    color: var(--accent);
    border-color: var(--accent-dim);
    background: rgba(232, 168, 124, 0.04);
  }

  /* ── HERO ─────────────────────────────────────── */

  .hero {
    text-align: center;
    padding: 96px 40px 80px;
    border-bottom: 1px solid var(--border);
  }

  .hero-eyebrow {
    display: inline-block;
    margin-bottom: 36px;
    color: var(--text-dim);
  }

  .hero h1 {
    font-family: 'Newsreader', serif;
    font-weight: 300;
    font-size: clamp(44px, 7vw, 84px);
    line-height: 0.98;
    letter-spacing: -0.012em;
    text-transform: uppercase;
    color: var(--text);
    margin-bottom: 32px;
  }

  .hero h1 em {
    font-style: italic;
    font-weight: 300;
    color: var(--accent);
    letter-spacing: 0.01em;
  }

  .hero-desc {
    max-width: 540px;
    margin: 0 auto 56px;
    color: var(--text-dim);
    font-size: 14px;
    line-height: 1.7;
  }

  /* ── INPUT ROW ───────────────────────────────── */

  .input-form { max-width: 760px; margin: 0 auto; }

  .input-row {
    display: flex;
    border: 1px solid var(--border-strong);
    background: rgba(244, 235, 217, 0.02);
    transition: border-color 180ms;
  }

  .input-row:focus-within {
    border-color: var(--accent-dim);
    background: rgba(232, 168, 124, 0.03);
  }

  .input-row input {
    flex: 1;
    background: transparent;
    border: 0;
    padding: 22px 28px;
    color: var(--text);
    font-family: inherit;
    font-size: 14px;
    outline: none;
    letter-spacing: 0.02em;
  }

  .input-row input::placeholder {
    color: var(--text-faint);
    letter-spacing: 0.02em;
  }

  .input-row button {
    background: transparent;
    border: 0;
    border-left: 1px solid var(--border-strong);
    padding: 0 36px;
    color: var(--text);
    font-family: inherit;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    font-size: 11px;
    cursor: pointer;
    transition: all 180ms ease;
    white-space: nowrap;
  }

  .input-row button:hover {
    background: rgba(232, 168, 124, 0.08);
    color: var(--accent);
  }

  .input-row button:disabled { cursor: wait; }

  .input-row button.is-scanning {
    color: var(--accent);
    background: rgba(232, 168, 124, 0.06);
  }

  .scan-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
    margin-right: 12px;
    vertical-align: middle;
    box-shadow: 0 0 0 0 rgba(232, 168, 124, 0.6);
    animation: scan-pulse 1.2s ease-in-out infinite;
  }

  @keyframes scan-pulse {
    0%   { opacity: 0.35; box-shadow: 0 0 0 0 rgba(232, 168, 124, 0.55); }
    50%  { opacity: 1;    box-shadow: 0 0 0 6px rgba(232, 168, 124, 0); }
    100% { opacity: 0.35; box-shadow: 0 0 0 0 rgba(232, 168, 124, 0); }
  }

  .input-hint {
    margin-top: 14px;
    text-align: center;
    color: var(--text-faint);
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  /* ── FEATURES ────────────────────────────────── */

  .section-head {
    display: flex;
    align-items: baseline;
    gap: 20px;
    padding: 24px 40px 20px;
    border-bottom: 1px solid var(--border);
  }

  .section-num {
    font-family: 'Newsreader', serif;
    font-style: italic;
    font-size: 28px;
    color: var(--accent);
    letter-spacing: 0;
  }

  .section-title {
    text-transform: uppercase;
    letter-spacing: 0.22em;
    font-size: 12px;
    color: var(--text);
  }

  .section-rule { flex: 1; border-bottom: 1px solid var(--border); }

  .features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .feature {
    padding: 32px 40px;
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    min-height: 180px;
  }

  .feature:nth-child(3n) { border-right: 0; }
  .feature:nth-last-child(-n+3) { border-bottom: 0; }

  .feature-num {
    font-family: 'Newsreader', serif;
    font-style: italic;
    color: var(--accent);
    font-size: 13px;
    margin-bottom: 12px;
  }

  .feature h3 {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    margin-bottom: 14px;
    color: var(--text);
    font-weight: 500;
  }

  .feature p {
    color: var(--text-dim);
    font-size: 13px;
    line-height: 1.65;
  }

  /* ── FOOTER ──────────────────────────────────── */

  .footer {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: center;
    padding: 22px 40px;
    border-top: 1px solid var(--border);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: var(--text-faint);
  }

  .footer a { color: var(--text-dim); text-decoration: none; transition: color 180ms; }
  .footer a:hover { color: var(--accent); }
  .footer-mid { text-align: center; }
  .footer-right { text-align: right; }

  /* ── REPORT ──────────────────────────────────── */

  .report-header {
    padding: 56px 40px;
    border-bottom: 1px solid var(--border);
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 40px;
    align-items: end;
  }

  .report-title {
    font-family: 'Newsreader', serif;
    font-weight: 300;
    font-size: clamp(36px, 5vw, 56px);
    line-height: 1;
    letter-spacing: -0.01em;
  }

  .report-title em { font-style: italic; color: var(--accent); }

  .report-meta {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 24px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }

  .report-meta dt { color: var(--text-faint); }
  .report-meta dd { color: var(--text); }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }

  .stat {
    padding: 32px 40px;
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .stat:nth-child(4n) { border-right: 0; }

  .stat-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: var(--text-faint);
    margin-bottom: 12px;
  }

  .stat-value {
    font-family: 'Newsreader', serif;
    font-weight: 300;
    font-size: 40px;
    letter-spacing: -0.01em;
    line-height: 1;
    color: var(--text);
    font-variant-numeric: tabular-nums;
  }

  .stat-detail {
    font-size: 11px;
    color: var(--text-faint);
    margin-top: 8px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }

  table.lang-table {
    width: 100%;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  .lang-table th, .lang-table td {
    padding: 14px 24px;
    text-align: right;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
  }

  .lang-table th {
    text-align: right;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: var(--text-faint);
    font-weight: 400;
    padding-top: 18px;
    padding-bottom: 14px;
  }

  .lang-table th:first-child, .lang-table td:first-child { text-align: left; padding-left: 40px; }
  .lang-table th:last-child, .lang-table td:last-child { padding-right: 40px; }

  .lang-bar {
    width: 100%;
    height: 4px;
    background: var(--border);
    position: relative;
  }

  .lang-bar-fill {
    position: absolute;
    inset: 0 auto 0 0;
    background: var(--accent);
    opacity: 0.7;
  }

  .lang-name {
    font-weight: 500;
    color: var(--text);
  }

  .compare-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }

  .compare {
    padding: 28px 32px;
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .compare:nth-child(4n) { border-right: 0; }

  .compare-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: var(--text-faint);
    margin-bottom: 10px;
  }

  .compare-value {
    font-family: 'Newsreader', serif;
    font-weight: 300;
    font-size: 28px;
    line-height: 1.1;
    color: var(--text);
    font-variant-numeric: tabular-nums;
  }

  .compare-detail {
    margin-top: 6px;
    font-size: 10px;
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }

  .annotations-list {
    padding: 24px 40px 32px;
  }

  .annotations-summary {
    display: flex;
    gap: 32px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .annotations-summary span {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--text-faint);
  }

  .annotations-summary span strong {
    color: var(--accent);
    font-family: 'Newsreader', serif;
    font-style: italic;
    font-weight: 400;
    font-size: 16px;
    margin-right: 4px;
  }

  .annotation {
    display: grid;
    grid-template-columns: 90px 1fr auto;
    gap: 24px;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
    font-size: 12px;
  }

  .annotation:last-child { border-bottom: 0; }

  .annotation-kind {
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-size: 10px;
  }

  .annotation-text { color: var(--text); }
  .annotation-loc { color: var(--text-faint); font-size: 11px; }

  .files-list {
    padding: 0 40px;
  }

  .files-list h4 {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: var(--text-faint);
    padding: 24px 0 12px;
    font-weight: 400;
  }

  .files-list ol {
    list-style: none;
    counter-reset: file-counter;
    padding-bottom: 24px;
  }

  .files-list ol li {
    display: grid;
    grid-template-columns: 32px 1fr auto;
    gap: 16px;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
    counter-increment: file-counter;
    font-size: 12px;
  }

  .files-list ol li::before {
    content: counter(file-counter, decimal-leading-zero);
    font-family: 'Newsreader', serif;
    font-style: italic;
    color: var(--accent);
    font-size: 13px;
  }

  .files-list ol li .path {
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .files-list ol li .num {
    color: var(--text-dim);
    font-variant-numeric: tabular-nums;
  }

  .error-banner {
    margin: 40px;
    padding: 24px 32px;
    border: 1px solid rgba(232, 124, 124, 0.4);
    color: #f4d6d6;
    background: rgba(232, 124, 124, 0.06);
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }

  .loading {
    padding: 80px 40px;
    text-align: center;
    color: var(--text-dim);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
  }

  .loading::after {
    content: '';
    display: inline-block;
    width: 8px;
    text-align: left;
    animation: dots 1.4s infinite;
  }

  @keyframes dots {
    0%, 20% { content: '.'; }
    40% { content: '..'; }
    60%, 100% { content: '...'; }
  }

  /* ── RESPONSIVE ─────────────────────────────── */

  @media (max-width: 900px) {
    .header { padding: 20px 24px; }
    .hero { padding: 60px 24px; }
    .features, .stat-grid, .compare-grid { grid-template-columns: repeat(2, 1fr); }
    .stat:nth-child(4n), .compare:nth-child(4n) { border-right: 1px solid var(--border); }
    .stat:nth-child(2n), .compare:nth-child(2n) { border-right: 0; }
    .feature:nth-child(3n) { border-right: 1px solid var(--border); }
    .feature:nth-child(2n) { border-right: 0; }
    .report-header { grid-template-columns: 1fr; }
  }

  @media (max-width: 600px) {
    .features, .stat-grid, .compare-grid { grid-template-columns: 1fr; }
    .stat, .compare, .feature { border-right: 0 !important; }
    .header { grid-template-columns: 1fr; gap: 16px; text-align: center; }
    .header-left, .header-right { justify-self: center; }
  }
`;

const GH_ICON = `<svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;

export const Layout: FC<{ title: string; children?: any }> = (props) => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{props.title}</title>
      <meta name="description" content="A scanning instrument for source repositories. Measure what your codebase is made of." />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,200;0,6..72,300;0,6..72,400;1,6..72,200;1,6..72,300;1,6..72,400&display=swap"
        rel="stylesheet"
      />
      <style>{raw(STYLES)}</style>
    </head>
    <body>
      <div class="layout">
        <header class="header">
          <div class="header-left">
            <span class="meta-tag">CODE MEASUREMENT INSTRUMENT</span>
          </div>
          <a href="/" class="brand">SIZEOF</a>
          <div class="header-right">
            <a class="gh-link" href="https://github.com/forrestknight/sizeof" target="_blank" rel="noopener">
              {raw(GH_ICON)}
              <span>Github</span>
            </a>
          </div>
        </header>
        {props.children}
        <footer class="footer">
          <div class="footer-left">SIZEOF v0.1</div>
          <div class="footer-mid">
            <a href="https://github.com/forrestknight" target="_blank" rel="noopener">FORREST KNIGHT ↗</a>
          </div>
          <div class="footer-right">MIT — 2026</div>
        </footer>
      </div>
    </body>
  </html>
);

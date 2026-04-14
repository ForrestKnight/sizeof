import type { FC } from "hono/jsx";
import { Layout } from "./layout.js";

const FEATURES = [
  {
    num: "i",
    title: "Language Profile",
    body: "Per-language breakdown across 80+ languages with visual bars showing how your repository is composed.",
  },
  {
    num: "ii",
    title: "Comment Density",
    body: "Code-to-comment ratio measured per language. Catch undocumented modules and over-commented zombie code.",
  },
  {
    num: "iii",
    title: "Annotation Harvest",
    body: "Every TODO, FIXME, HACK, XXX and BUG marker collected with file and line. Inherited debt, surfaced.",
  },
  {
    num: "iv",
    title: "Notable Files",
    body: "The longest, the shortest, the most and least documented files in your repository, ranked.",
  },
  {
    num: "v",
    title: "Size Comparison",
    body: "What does your codebase weigh? In paperback novels, Tolstoy units, hours of reading aloud, printed pages.",
  },
  {
    num: "vi",
    title: "Stream Scanning",
    body: "No clone, no disk, no waiting. Tarballs are streamed and scanned in-memory at the edge in seconds.",
  },
];

export const HomePage: FC = () => (
  <Layout title="sizeof — code measurement instrument">
    <section class="hero">
      <span class="label hero-eyebrow">A scanning instrument · Open source · MIT</span>
      <h1>
        What is your<br />
        codebase <em>made of</em>?
      </h1>
      <p class="hero-desc">
        Paste a public github.com or codeberg.org repository URL below. The instrument
        will fetch, decompress, and measure your source — every line classified, every
        annotation harvested, every weight expressed in books.
      </p>
      <form class="input-form" id="scan-form" action="/scan" method="get">
        <div class="input-row">
          <input
            type="text"
            name="url"
            placeholder="https://github.com/owner/repository"
            autocomplete="off"
            spellcheck={false}
            required
          />
          <button type="submit">Scan ↗</button>
        </div>
        <p class="input-hint">github.com · codeberg.org</p>
      </form>
    </section>

    <div class="section-head">
      <span class="section-num">01</span>
      <span class="section-title">Features</span>
      <div class="section-rule" />
    </div>

    <section class="features">
      {FEATURES.map((f) => (
        <article class="feature">
          <div class="feature-num">{f.num}.</div>
          <h3>{f.title}</h3>
          <p>{f.body}</p>
        </article>
      ))}
    </section>
  </Layout>
);

export type StringRule = {
  start: string;
  end: string;
  escape?: string;
  multiline?: boolean;
};

export type LanguageDef = {
  name: string;
  line: string[];
  block: Array<[string, string]>;
  strings: StringRule[];
};

const C_LIKE: Pick<LanguageDef, "line" | "block" | "strings"> = {
  line: ["//"],
  block: [["/*", "*/"]],
  strings: [
    { start: '"', end: '"', escape: "\\" },
    { start: "'", end: "'", escape: "\\" },
  ],
};

const HASH: Pick<LanguageDef, "line" | "block" | "strings"> = {
  line: ["#"],
  block: [],
  strings: [
    { start: '"', end: '"', escape: "\\" },
    { start: "'", end: "'", escape: "\\" },
  ],
};

const HTML_LIKE: Pick<LanguageDef, "line" | "block" | "strings"> = {
  line: [],
  block: [["<!--", "-->"]],
  strings: [
    { start: '"', end: '"' },
    { start: "'", end: "'" },
  ],
};

const LANGUAGES: Record<string, LanguageDef> = {
  JavaScript: {
    name: "JavaScript",
    line: ["//"],
    block: [["/*", "*/"]],
    strings: [
      { start: '"', end: '"', escape: "\\" },
      { start: "'", end: "'", escape: "\\" },
      { start: "`", end: "`", escape: "\\", multiline: true },
    ],
  },
  TypeScript: {
    name: "TypeScript",
    line: ["//"],
    block: [["/*", "*/"]],
    strings: [
      { start: '"', end: '"', escape: "\\" },
      { start: "'", end: "'", escape: "\\" },
      { start: "`", end: "`", escape: "\\", multiline: true },
    ],
  },
  JSX: { name: "JSX", ...C_LIKE },
  TSX: { name: "TSX", ...C_LIKE },
  Python: {
    name: "Python",
    line: ["#"],
    block: [
      ['"""', '"""'],
      ["'''", "'''"],
    ],
    strings: [
      { start: '"', end: '"', escape: "\\" },
      { start: "'", end: "'", escape: "\\" },
    ],
  },
  Ruby: {
    name: "Ruby",
    line: ["#"],
    block: [["=begin", "=end"]],
    strings: [
      { start: '"', end: '"', escape: "\\" },
      { start: "'", end: "'", escape: "\\" },
    ],
  },
  Go: { name: "Go", ...C_LIKE },
  Rust: { name: "Rust", ...C_LIKE },
  C: { name: "C", ...C_LIKE },
  "C++": { name: "C++", ...C_LIKE },
  "C#": { name: "C#", ...C_LIKE },
  "Objective-C": { name: "Objective-C", ...C_LIKE },
  Java: { name: "Java", ...C_LIKE },
  Kotlin: { name: "Kotlin", ...C_LIKE },
  Scala: { name: "Scala", ...C_LIKE },
  Swift: { name: "Swift", ...C_LIKE },
  Dart: { name: "Dart", ...C_LIKE },
  PHP: {
    name: "PHP",
    line: ["//", "#"],
    block: [["/*", "*/"]],
    strings: [
      { start: '"', end: '"', escape: "\\" },
      { start: "'", end: "'", escape: "\\" },
    ],
  },
  HTML: { name: "HTML", ...HTML_LIKE },
  XML: { name: "XML", ...HTML_LIKE },
  SVG: { name: "SVG", ...HTML_LIKE },
  Vue: { name: "Vue", ...HTML_LIKE },
  Svelte: { name: "Svelte", ...HTML_LIKE },
  Astro: { name: "Astro", ...HTML_LIKE },
  CSS: {
    name: "CSS",
    line: [],
    block: [["/*", "*/"]],
    strings: [
      { start: '"', end: '"', escape: "\\" },
      { start: "'", end: "'", escape: "\\" },
    ],
  },
  SCSS: { name: "SCSS", ...C_LIKE },
  Sass: { name: "Sass", ...C_LIKE },
  Less: { name: "Less", ...C_LIKE },
  Stylus: {
    name: "Stylus",
    line: ["//"],
    block: [["/*", "*/"]],
    strings: [
      { start: '"', end: '"', escape: "\\" },
      { start: "'", end: "'", escape: "\\" },
    ],
  },
  Markdown: {
    name: "Markdown",
    line: [],
    block: [["<!--", "-->"]],
    strings: [],
  },
  JSON: { name: "JSON", line: [], block: [], strings: [{ start: '"', end: '"', escape: "\\" }] },
  YAML: { name: "YAML", ...HASH },
  TOML: { name: "TOML", ...HASH },
  INI: { name: "INI", line: [";", "#"], block: [], strings: [] },
  SQL: {
    name: "SQL",
    line: ["--"],
    block: [["/*", "*/"]],
    strings: [
      { start: "'", end: "'", escape: "\\" },
      { start: '"', end: '"', escape: "\\" },
    ],
  },
  Shell: { name: "Shell", ...HASH },
  Bash: { name: "Bash", ...HASH },
  Zsh: { name: "Zsh", ...HASH },
  Fish: { name: "Fish", ...HASH },
  PowerShell: {
    name: "PowerShell",
    line: ["#"],
    block: [["<#", "#>"]],
    strings: [
      { start: '"', end: '"', escape: "`" },
      { start: "'", end: "'" },
    ],
  },
  Dockerfile: { name: "Dockerfile", ...HASH },
  Makefile: { name: "Makefile", ...HASH },
  CMake: { name: "CMake", ...HASH },
  Lua: {
    name: "Lua",
    line: ["--"],
    block: [["--[[", "]]"]],
    strings: [
      { start: '"', end: '"', escape: "\\" },
      { start: "'", end: "'", escape: "\\" },
    ],
  },
  R: { name: "R", ...HASH },
  Julia: {
    name: "Julia",
    line: ["#"],
    block: [["#=", "=#"]],
    strings: [{ start: '"', end: '"', escape: "\\" }],
  },
  Perl: { name: "Perl", ...HASH },
  Raku: { name: "Raku", ...HASH },
  Clojure: { name: "Clojure", line: [";"], block: [], strings: [{ start: '"', end: '"', escape: "\\" }] },
  Elixir: {
    name: "Elixir",
    line: ["#"],
    block: [],
    strings: [
      { start: '"', end: '"', escape: "\\" },
      { start: "'", end: "'", escape: "\\" },
    ],
  },
  Erlang: { name: "Erlang", line: ["%"], block: [], strings: [{ start: '"', end: '"', escape: "\\" }] },
  Haskell: {
    name: "Haskell",
    line: ["--"],
    block: [["{-", "-}"]],
    strings: [{ start: '"', end: '"', escape: "\\" }],
  },
  OCaml: {
    name: "OCaml",
    line: [],
    block: [["(*", "*)"]],
    strings: [{ start: '"', end: '"', escape: "\\" }],
  },
  "F#": {
    name: "F#",
    line: ["//"],
    block: [["(*", "*)"]],
    strings: [{ start: '"', end: '"', escape: "\\" }],
  },
  Nim: {
    name: "Nim",
    line: ["#"],
    block: [["#[", "]#"]],
    strings: [{ start: '"', end: '"', escape: "\\" }],
  },
  Zig: { name: "Zig", line: ["//"], block: [], strings: [{ start: '"', end: '"', escape: "\\" }] },
  Crystal: { name: "Crystal", ...HASH },
  D: { name: "D", ...C_LIKE },
  V: { name: "V", ...C_LIKE },
  Vala: { name: "Vala", ...C_LIKE },
  Solidity: { name: "Solidity", ...C_LIKE },
  Move: { name: "Move", ...C_LIKE },
  GraphQL: { name: "GraphQL", ...HASH },
  Protobuf: { name: "Protobuf", ...C_LIKE },
  Thrift: { name: "Thrift", ...C_LIKE },
  Terraform: { name: "Terraform", ...HASH },
  HCL: { name: "HCL", ...HASH },
  Nix: { name: "Nix", line: ["#"], block: [["/*", "*/"]], strings: [{ start: '"', end: '"', escape: "\\" }] },
  TeX: { name: "TeX", line: ["%"], block: [], strings: [] },
  "Vim script": { name: "Vim script", line: ['"'], block: [], strings: [{ start: "'", end: "'" }] },
  "Emacs Lisp": { name: "Emacs Lisp", line: [";"], block: [], strings: [{ start: '"', end: '"', escape: "\\" }] },
  "Common Lisp": { name: "Common Lisp", line: [";"], block: [["#|", "|#"]], strings: [{ start: '"', end: '"', escape: "\\" }] },
  Scheme: { name: "Scheme", line: [";"], block: [["#|", "|#"]], strings: [{ start: '"', end: '"', escape: "\\" }] },
  Racket: { name: "Racket", line: [";"], block: [["#|", "|#"]], strings: [{ start: '"', end: '"', escape: "\\" }] },
  Elm: { name: "Elm", line: ["--"], block: [["{-", "-}"]], strings: [{ start: '"', end: '"', escape: "\\" }] },
  PureScript: { name: "PureScript", line: ["--"], block: [["{-", "-}"]], strings: [{ start: '"', end: '"', escape: "\\" }] },
  ReScript: { name: "ReScript", ...C_LIKE },
  ReasonML: { name: "ReasonML", ...C_LIKE },
  CoffeeScript: { name: "CoffeeScript", line: ["#"], block: [["###", "###"]], strings: [{ start: '"', end: '"', escape: "\\" }, { start: "'", end: "'", escape: "\\" }] },
  Pug: { name: "Pug", line: ["//"], block: [], strings: [{ start: '"', end: '"', escape: "\\" }, { start: "'", end: "'", escape: "\\" }] },
  Haml: { name: "Haml", line: ["-#"], block: [], strings: [{ start: '"', end: '"', escape: "\\" }, { start: "'", end: "'", escape: "\\" }] },
  Twig: { name: "Twig", line: [], block: [["{#", "#}"]], strings: [] },
  Liquid: { name: "Liquid", line: [], block: [["{% comment %}", "{% endcomment %}"]], strings: [] },
  Handlebars: { name: "Handlebars", line: [], block: [["{{!--", "--}}"], ["{{!", "}}"]], strings: [] },
  Jinja: { name: "Jinja", line: [], block: [["{#", "#}"]], strings: [] },
};

const EXTENSIONS: Record<string, string> = {
  js: "JavaScript",
  mjs: "JavaScript",
  cjs: "JavaScript",
  jsx: "JSX",
  ts: "TypeScript",
  mts: "TypeScript",
  cts: "TypeScript",
  tsx: "TSX",
  py: "Python",
  pyi: "Python",
  pyw: "Python",
  rb: "Ruby",
  rake: "Ruby",
  gemspec: "Ruby",
  go: "Go",
  rs: "Rust",
  c: "C",
  h: "C",
  cpp: "C++",
  cxx: "C++",
  cc: "C++",
  hpp: "C++",
  hxx: "C++",
  hh: "C++",
  cs: "C#",
  m: "Objective-C",
  mm: "Objective-C",
  java: "Java",
  kt: "Kotlin",
  kts: "Kotlin",
  scala: "Scala",
  sc: "Scala",
  swift: "Swift",
  dart: "Dart",
  php: "PHP",
  phtml: "PHP",
  html: "HTML",
  htm: "HTML",
  xhtml: "HTML",
  xml: "XML",
  svg: "SVG",
  vue: "Vue",
  svelte: "Svelte",
  astro: "Astro",
  css: "CSS",
  scss: "SCSS",
  sass: "Sass",
  less: "Less",
  styl: "Stylus",
  md: "Markdown",
  markdown: "Markdown",
  mdx: "Markdown",
  json: "JSON",
  jsonc: "JSON",
  json5: "JSON",
  yml: "YAML",
  yaml: "YAML",
  toml: "TOML",
  ini: "INI",
  cfg: "INI",
  conf: "INI",
  sql: "SQL",
  sh: "Shell",
  bash: "Bash",
  zsh: "Zsh",
  fish: "Fish",
  ps1: "PowerShell",
  psm1: "PowerShell",
  lua: "Lua",
  r: "R",
  jl: "Julia",
  pl: "Perl",
  pm: "Perl",
  raku: "Raku",
  rakumod: "Raku",
  clj: "Clojure",
  cljs: "Clojure",
  cljc: "Clojure",
  ex: "Elixir",
  exs: "Elixir",
  erl: "Erlang",
  hrl: "Erlang",
  hs: "Haskell",
  lhs: "Haskell",
  ml: "OCaml",
  mli: "OCaml",
  fs: "F#",
  fsx: "F#",
  fsi: "F#",
  nim: "Nim",
  nims: "Nim",
  zig: "Zig",
  cr: "Crystal",
  d: "D",
  v: "V",
  vala: "Vala",
  sol: "Solidity",
  move: "Move",
  graphql: "GraphQL",
  gql: "GraphQL",
  proto: "Protobuf",
  thrift: "Thrift",
  tf: "Terraform",
  tfvars: "Terraform",
  hcl: "HCL",
  nix: "Nix",
  tex: "TeX",
  ltx: "TeX",
  vim: "Vim script",
  el: "Emacs Lisp",
  lisp: "Common Lisp",
  cl: "Common Lisp",
  scm: "Scheme",
  ss: "Scheme",
  rkt: "Racket",
  elm: "Elm",
  purs: "PureScript",
  res: "ReScript",
  re: "ReasonML",
  coffee: "CoffeeScript",
  pug: "Pug",
  jade: "Pug",
  haml: "Haml",
  twig: "Twig",
  liquid: "Liquid",
  hbs: "Handlebars",
  handlebars: "Handlebars",
  jinja: "Jinja",
  jinja2: "Jinja",
  j2: "Jinja",
  cmake: "CMake",
};

const FILENAMES: Record<string, string> = {
  Dockerfile: "Dockerfile",
  Containerfile: "Dockerfile",
  Makefile: "Makefile",
  GNUmakefile: "Makefile",
  Rakefile: "Ruby",
  Gemfile: "Ruby",
  CMakeLists: "CMake",
  ".gitignore": "Shell",
  ".dockerignore": "Shell",
  ".env": "Shell",
};

const SHEBANG_TO_LANG: Array<[RegExp, string]> = [
  [/^#!.*\bnode\b/, "JavaScript"],
  [/^#!.*\bdeno\b/, "TypeScript"],
  [/^#!.*\bbun\b/, "TypeScript"],
  [/^#!.*\bpython[0-9.]*\b/, "Python"],
  [/^#!.*\bruby\b/, "Ruby"],
  [/^#!.*\bperl\b/, "Perl"],
  [/^#!.*\bphp\b/, "PHP"],
  [/^#!.*\blua\b/, "Lua"],
  [/^#!.*\bRscript\b/, "R"],
  [/^#!.*\bjulia\b/, "Julia"],
  [/^#!.*\bzsh\b/, "Zsh"],
  [/^#!.*\bfish\b/, "Fish"],
  [/^#!.*\bbash\b/, "Bash"],
  [/^#!.*\bsh\b/, "Shell"],
];

export function detectLanguage(path: string, firstLine?: string): LanguageDef | null {
  const base = path.split("/").pop() ?? path;

  if (FILENAMES[base]) return LANGUAGES[FILENAMES[base]] ?? null;

  const dotIdx = base.lastIndexOf(".");
  if (dotIdx > 0) {
    const ext = base.slice(dotIdx + 1).toLowerCase();
    const langName = EXTENSIONS[ext];
    if (langName) return LANGUAGES[langName] ?? null;
  }

  if (firstLine && firstLine.startsWith("#!")) {
    for (const [re, name] of SHEBANG_TO_LANG) {
      if (re.test(firstLine)) return LANGUAGES[name] ?? null;
    }
  }

  return null;
}

export function getLanguage(name: string): LanguageDef | undefined {
  return LANGUAGES[name];
}

export function allLanguageNames(): string[] {
  return Object.keys(LANGUAGES);
}

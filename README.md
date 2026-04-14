# sizeof

Counts blank lines, comment lines, and physical lines of source code in public GitHub and Codeberg repositories.

Live at [sizeof.dev](https://sizeof.dev). Paste a repo URL and you get:

- Per-language line counts (code, comment, blank) across 80+ languages
- TODO, FIXME, HACK, XXX, NOTE, BUG markers with file and line number
- Longest, shortest, and most-commented files
- Size comparisons — paperback novels, hours of reading aloud, printed pages

No clone, no disk. The repository tarball is streamed and measured in memory on a Cloudflare Worker.

## Supported hosts

- github.com
- codeberg.org

## How it counts

A character-by-character state machine walks each file, tracking strings and comments per language so that `// a string with // in it` is not miscounted as a comment. Each line is classified as exactly one of: code, comment, or blank. Files matching common generated/vendored directories (`node_modules`, `dist`, `.git`, `vendor`, `target`, `__pycache__`, etc.) and lock files (`package-lock.json`, `Cargo.lock`, `go.sum`, etc.) are skipped. Binary files are detected by null-byte probing and skipped.

## Local development

```
npm install
npm run dev
```

The dev server runs on `http://127.0.0.1:8787`.

Unauthenticated GitHub API calls are capped at 60 requests per hour per IP, which is fine for a few scans but will die under any real usage. To raise the cap to 5000 requests per hour, create a personal access token (no scopes required for public repos) and store it as a Worker secret:

```
printf 'your_token_here' | npx wrangler secret put GITHUB_TOKEN
```

## Deploy

```
npm run deploy
```

## Stack

- [Hono](https://hono.dev/) — routing and server-side JSX
- [fflate](https://github.com/101arrowz/fflate) — in-memory gzip decompression
- Cloudflare Workers — edge runtime
- TypeScript

## License

MIT

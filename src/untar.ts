import { RepoError } from "./fetch-repo.js";

export type TarEntry = {
  name: string;
  size: number;
  type: "file" | "directory" | "symlink" | "other";
  content: Uint8Array;
};

const decoder = new TextDecoder();

function decodeCString(bytes: Uint8Array): string {
  let end = 0;
  while (end < bytes.length && bytes[end] !== 0) end++;
  return decoder.decode(bytes.subarray(0, end));
}

function parseOctal(bytes: Uint8Array): number {
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b === 0 || b === 32) break;
    s += String.fromCharCode(b);
  }
  s = s.trim();
  if (!s) return 0;
  return parseInt(s, 8) || 0;
}

class StreamByteBuffer {
  private chunks: Uint8Array[] = [];
  private total = 0;
  private eof = false;
  private reader: ReadableStreamDefaultReader<Uint8Array>;

  constructor(stream: ReadableStream<Uint8Array>) {
    this.reader = stream.getReader();
  }

  private async pull(): Promise<boolean> {
    if (this.eof) return false;
    const { done, value } = await this.reader.read();
    if (done) {
      this.eof = true;
      return false;
    }
    if (value && value.byteLength > 0) {
      this.chunks.push(value);
      this.total += value.byteLength;
    }
    return true;
  }

  async read(n: number): Promise<Uint8Array | null> {
    while (this.total < n) {
      if (!(await this.pull())) break;
    }
    if (this.total < n) return null;

    const out = new Uint8Array(n);
    let offset = 0;
    while (offset < n) {
      const head = this.chunks[0];
      const need = n - offset;
      if (head.byteLength <= need) {
        out.set(head, offset);
        offset += head.byteLength;
        this.total -= head.byteLength;
        this.chunks.shift();
      } else {
        out.set(head.subarray(0, need), offset);
        this.chunks[0] = head.subarray(need);
        this.total -= need;
        offset = n;
      }
    }
    return out;
  }

  async skip(n: number): Promise<boolean> {
    let remaining = n;
    while (remaining > 0 && this.chunks.length > 0) {
      const head = this.chunks[0];
      if (head.byteLength <= remaining) {
        remaining -= head.byteLength;
        this.total -= head.byteLength;
        this.chunks.shift();
      } else {
        this.chunks[0] = head.subarray(remaining);
        this.total -= remaining;
        remaining = 0;
      }
    }
    while (remaining > 0 && !this.eof) {
      if (!(await this.pull())) break;
      while (remaining > 0 && this.chunks.length > 0) {
        const head = this.chunks[0];
        if (head.byteLength <= remaining) {
          remaining -= head.byteLength;
          this.total -= head.byteLength;
          this.chunks.shift();
        } else {
          this.chunks[0] = head.subarray(remaining);
          this.total -= remaining;
          remaining = 0;
        }
      }
    }
    return remaining === 0;
  }

  async cancel(): Promise<void> {
    await this.reader.cancel().catch(() => {});
  }
}

export type TarIterOptions = {
  maxFileBytes?: number;
};

export async function* iterateTarballStream(
  body: ReadableStream<Uint8Array>,
  options: TarIterOptions = {},
): AsyncGenerator<TarEntry> {
  const maxFileBytes = options.maxFileBytes ?? Number.POSITIVE_INFINITY;

  let decompressed: ReadableStream<Uint8Array>;
  try {
    decompressed = body.pipeThrough(new DecompressionStream("gzip"));
  } catch {
    throw new RepoError("Could not attach gzip decoder to repository stream.", 502);
  }

  const buf = new StreamByteBuffer(decompressed);
  let pendingLongName: string | null = null;

  try {
    while (true) {
      let header: Uint8Array | null;
      try {
        header = await buf.read(512);
      } catch {
        throw new RepoError("Repository archive ended unexpectedly or is corrupt.", 502);
      }
      if (!header) break;

      let allZero = true;
      for (let i = 0; i < 512; i++) {
        if (header[i] !== 0) {
          allZero = false;
          break;
        }
      }
      if (allZero) break;

      const size = parseOctal(header.subarray(124, 136));
      const typeFlag = String.fromCharCode(header[156]);
      const paddedSize = Math.ceil(size / 512) * 512;

      if (typeFlag === "L") {
        if (size > 0 && size <= 4096) {
          const content = await buf.read(paddedSize);
          if (!content) break;
          pendingLongName = decodeCString(content.subarray(0, size));
        } else if (paddedSize > 0) {
          if (!(await buf.skip(paddedSize))) break;
        }
        continue;
      }

      if (typeFlag === "x" || typeFlag === "g") {
        if (paddedSize > 0 && !(await buf.skip(paddedSize))) break;
        continue;
      }

      let name: string;
      if (pendingLongName !== null) {
        name = pendingLongName;
        pendingLongName = null;
      } else {
        const baseName = decodeCString(header.subarray(0, 100));
        const prefix = decodeCString(header.subarray(345, 500));
        name = prefix ? `${prefix}/${baseName}` : baseName;
      }

      let kind: TarEntry["type"];
      if (typeFlag === "0" || typeFlag === "\0") kind = "file";
      else if (typeFlag === "5") kind = "directory";
      else if (typeFlag === "2") kind = "symlink";
      else kind = "other";

      if (kind === "file" && size > 0 && size <= maxFileBytes) {
        const content = await buf.read(paddedSize);
        if (!content) break;
        yield { name, size, type: kind, content: content.subarray(0, size) };
      } else {
        if (paddedSize > 0) {
          if (!(await buf.skip(paddedSize))) break;
        }
      }
    }
  } finally {
    await buf.cancel();
  }
}

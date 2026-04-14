import { gunzipSync } from "fflate";

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

export function* iterateTarball(gzipped: Uint8Array): Generator<TarEntry> {
  const data = gunzipSync(gzipped);
  const len = data.length;

  let offset = 0;
  let pendingLongName: string | null = null;

  while (offset + 512 <= len) {
    const header = data.subarray(offset, offset + 512);

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

    const contentStart = offset + 512;
    const paddedSize = Math.ceil(size / 512) * 512;

    if (typeFlag === "L") {
      const content = data.subarray(contentStart, contentStart + size);
      pendingLongName = decodeCString(content);
      offset = contentStart + paddedSize;
      continue;
    }

    if (typeFlag === "x" || typeFlag === "g") {
      offset = contentStart + paddedSize;
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

    const content = data.subarray(contentStart, contentStart + size);
    yield { name, size, type: kind, content };

    offset = contentStart + paddedSize;
  }
}

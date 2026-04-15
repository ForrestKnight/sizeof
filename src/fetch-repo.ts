export type RepoHost = "github" | "codeberg";

export type RepoSpec = {
  host: RepoHost;
  owner: string;
  repo: string;
  branch?: string;
};

export type RepoMetadata = {
  spec: RepoSpec;
  defaultBranch: string;
  description: string | null;
  htmlUrl: string;
  stars: number | null;
  commitSha: string | null;
};

export class RepoError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message);
  }
}

export function parseRepoUrl(input: string): RepoSpec | null {
  let s = input.trim();
  if (!s) return null;

  s = s.replace(/^git@([^:]+):/, "https://$1/");
  s = s.replace(/^https?:\/\//, "");
  s = s.replace(/\.git$/, "");
  s = s.replace(/\/$/, "");

  const parts = s.split("/").filter(Boolean);
  if (parts.length < 3) return null;

  const host = parts[0].toLowerCase();
  let hostKey: RepoHost;
  if (host === "github.com" || host === "www.github.com") hostKey = "github";
  else if (host === "codeberg.org") hostKey = "codeberg";
  else return null;

  const owner = parts[1];
  const repo = parts[2];
  if (!owner || !repo) return null;

  let branch: string | undefined;
  if (hostKey === "github" && parts[3] === "tree" && parts[4]) {
    branch = parts.slice(4).join("/");
  } else if (hostKey === "codeberg" && parts[3] === "src" && parts[4] === "branch" && parts[5]) {
    branch = parts.slice(5).join("/");
  }

  return { host: hostKey, owner, repo, branch };
}

export async function fetchRepoMetadata(spec: RepoSpec, githubToken?: string): Promise<RepoMetadata> {
  if (spec.host === "github") {
    const headers: Record<string, string> = {
      "User-Agent": "sizeof.dev",
      Accept: "application/vnd.github+json",
    };
    if (githubToken) headers.Authorization = `Bearer ${githubToken}`;

    const res = await fetch(`https://api.github.com/repos/${spec.owner}/${spec.repo}`, { headers });
    if (res.status === 404) throw new RepoError("Repository not found on GitHub.", 404);
    if (res.status === 403) throw new RepoError("GitHub API rate limit exceeded. Try again shortly.", 429);
    if (!res.ok) throw new RepoError(`GitHub API returned ${res.status}.`, 502);

    const data = (await res.json()) as {
      default_branch: string;
      description: string | null;
      html_url: string;
      stargazers_count: number;
    };
    return {
      spec,
      defaultBranch: spec.branch ?? data.default_branch,
      description: data.description,
      htmlUrl: data.html_url,
      stars: data.stargazers_count,
      commitSha: null,
    };
  }

  const res = await fetch(`https://codeberg.org/api/v1/repos/${spec.owner}/${spec.repo}`);
  if (res.status === 404) throw new RepoError("Repository not found on Codeberg.", 404);
  if (!res.ok) throw new RepoError(`Codeberg API returned ${res.status}.`, 502);

  const data = (await res.json()) as {
    default_branch: string;
    description: string | null;
    html_url: string;
    stars_count: number;
  };
  return {
    spec,
    defaultBranch: spec.branch ?? data.default_branch,
    description: data.description,
    htmlUrl: data.html_url,
    stars: data.stars_count,
    commitSha: null,
  };
}

export async function fetchTarballStream(
  meta: RepoMetadata,
  githubToken?: string,
): Promise<ReadableStream<Uint8Array>> {
  const { spec, defaultBranch } = meta;

  let url: string;
  const headers: Record<string, string> = { "User-Agent": "sizeof.dev" };

  if (spec.host === "github") {
    url = `https://api.github.com/repos/${spec.owner}/${spec.repo}/tarball/${defaultBranch}`;
    if (githubToken) headers.Authorization = `Bearer ${githubToken}`;
  } else {
    url = `https://codeberg.org/${spec.owner}/${spec.repo}/archive/${defaultBranch}.tar.gz`;
  }

  const res = await fetch(url, { headers, redirect: "follow" });
  if (!res.ok) throw new RepoError(`Failed to download tarball (${res.status}).`, 502);
  if (!res.body) throw new RepoError("Tarball response had no body.", 502);

  return res.body;
}

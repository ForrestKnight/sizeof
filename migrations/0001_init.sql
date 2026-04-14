CREATE TABLE IF NOT EXISTS scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  host TEXT NOT NULL,
  owner TEXT NOT NULL,
  repo TEXT NOT NULL,
  default_branch TEXT,
  total_files INTEGER NOT NULL,
  total_bytes INTEGER NOT NULL,
  total_code INTEGER NOT NULL,
  scan_ms INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS scans_repo_idx ON scans(host, owner, repo);
CREATE INDEX IF NOT EXISTS scans_ts_idx ON scans(ts);

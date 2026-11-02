// Append migrations here. Never edit a migration after deploying it.
export const migrations = [
  {
    version: 1,
    sql: `
    CREATE TABLE posts (
      id TEXT PRIMARY KEY,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL CHECK (period_end > period_start),
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      body TEXT NOT NULL,
      category TEXT NOT NULL,
      image TEXT NOT NULL CHECK (image IN ('engineering', 'concept', 'flight')),
      href TEXT,
      status TEXT NOT NULL CHECK (status IN ('published', 'unpublished')),
      original_generated_json TEXT NOT NULL,
      manually_edited INTEGER NOT NULL DEFAULT 0,
      version INTEGER NOT NULL DEFAULT 1,
      published_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (period_start, period_end)
    );
    CREATE INDEX posts_public ON posts (status, period_end DESC);
    CREATE TABLE post_revisions (
      id INTEGER PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id),
      version INTEGER NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('generated', 'manual')),
      actor TEXT NOT NULL,
      snapshot_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE (post_id, version)
    );
    CREATE TABLE plane_activities (
      post_id TEXT NOT NULL REFERENCES posts(id),
      source_id TEXT NOT NULL,
      work_item_id TEXT NOT NULL,
      occurred_at TEXT NOT NULL,
      activity_json TEXT NOT NULL,
      PRIMARY KEY (post_id, source_id)
    );
    CREATE TABLE admin_users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );
    CREATE TABLE admin_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES admin_users(id),
      csrf_token TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
    CREATE INDEX sessions_expiry ON admin_sessions (expires_at);
    CREATE TABLE login_limits (
      key TEXT PRIMARY KEY,
      attempts INTEGER NOT NULL,
      window_start INTEGER NOT NULL
    );
  `,
  },
];

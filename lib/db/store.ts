import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { mkdirSync, chmodSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { migrations } from "./schema.ts";
import { AppError } from "../updates/types.ts";
import type {
  EditPost,
  PlaneActivity,
  Post,
  PostDetail,
  Revision,
  Submission,
} from "../updates/types.ts";

type Row = Record<string, string | number | null>;
const postColumns =
  "id, period_start, period_end, title, summary, body, category, image, href, status, manually_edited, version, published_at, created_at, updated_at";
export type AdminUser = {
  id: string;
  username: string;
  passwordHash: string;
  active: boolean;
};
export type AdminSession = {
  tokenHash: string;
  userId: string;
  username: string;
  csrfToken: string;
  expiresAt: string;
};

function toPost(row: Row): Post {
  return {
    id: row.id as string,
    periodStart: row.period_start as string,
    periodEnd: row.period_end as string,
    title: row.title as string,
    summary: row.summary as string,
    body: row.body as string,
    category: row.category as string,
    image: row.image as Post["image"],
    href: row.href as string | null,
    status: row.status as Post["status"],
    publishedAt: row.published_at as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    version: Number(row.version),
    manuallyEdited: row.manually_edited === 1,
  };
}

export function databasePath() {
  const path = resolve(process.env.DATABASE_PATH || "data/site.sqlite");
  const publicDirectory = resolve("public");
  const comparable = process.platform === "win32" ? path.toLowerCase() : path;
  const publicRoot =
    process.platform === "win32"
      ? publicDirectory.toLowerCase()
      : publicDirectory;
  if (comparable === publicRoot || comparable.startsWith(publicRoot + sep)) {
    throw new Error("DATABASE_PATH must be outside the public directory.");
  }
  return path;
}

export class Store {
  readonly db: DatabaseSync;

  constructor(path = databasePath()) {
    if (path !== ":memory:")
      mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(path, { timeout: 5000 });
    this.db.exec(
      "PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL; PRAGMA synchronous = FULL;",
    );
    if (path !== ":memory:" && process.platform !== "win32")
      chmodSync(path, 0o600);
    this.transaction(() => {
      this.db.exec(
        "CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)",
      );
      const current = Number(
        (
          this.db
            .prepare(
              "SELECT COALESCE(MAX(version), 0) AS version FROM schema_migrations",
            )
            .get() as Row
        ).version,
      );
      if (current > migrations.at(-1)!.version)
        throw new Error(
          "Database schema is newer than this application. Restore the matching application version.",
        );
      for (const migration of migrations) {
        if (migration.version <= current) continue;
        this.db.exec(migration.sql);
        this.db
          .prepare("INSERT INTO schema_migrations VALUES (?, ?)")
          .run(migration.version, new Date().toISOString());
      }
    });
  }

  transaction<T>(operation: () => T): T {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const result = operation();
      this.db.exec("COMMIT");
      return result;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  close() {
    this.db.close();
  }

  listPosts(publishedOnly = true): Post[] {
    const rows = this.db
      .prepare(
        `SELECT ${postColumns} FROM posts ${publishedOnly ? "WHERE status = 'published'" : ""} ORDER BY period_end DESC, created_at DESC`,
      )
      .all() as Row[];
    return rows.map(toPost);
  }

  getPost(id: string, publishedOnly = false): Post | null {
    const row = this.db
      .prepare(
        `SELECT ${postColumns} FROM posts WHERE id = ? ${publishedOnly ? "AND status = 'published'" : ""}`,
      )
      .get(id) as Row | undefined;
    return row ? toPost(row) : null;
  }

  private revision(post: Post, kind: Revision["kind"], actor: string) {
    this.db
      .prepare(
        "INSERT INTO post_revisions (post_id, version, kind, actor, snapshot_json, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run(
        post.id,
        post.version,
        kind,
        actor,
        JSON.stringify(post),
        post.updatedAt,
      );
  }

  createGeneratedPost(input: Submission): { post: Post; created: boolean } {
    return this.transaction(() => {
      const existing = this.db
        .prepare(
          "SELECT * FROM posts WHERE period_start = ? AND period_end = ?",
        )
        .get(input.periodStart, input.periodEnd) as Row | undefined;
      // Ingestion is create-only. Retries never edit or republish an existing post.
      if (existing) return { post: toPost(existing), created: false };
      const overlap = this.db
        .prepare(
          "SELECT id FROM posts WHERE period_start < ? AND period_end > ?",
        )
        .get(input.periodEnd, input.periodStart);
      if (overlap)
        throw new AppError(
          "This reporting period overlaps an existing post. Use the exact existing period for a retry.",
          409,
        );
      const id = randomUUID();
      const now = new Date().toISOString();
      this.db
        .prepare(
          `INSERT INTO posts (id, period_start, period_end, title, summary, body, category, image, href, status, original_generated_json, published_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?)`,
        )
        .run(
          id,
          input.periodStart,
          input.periodEnd,
          input.title,
          input.summary,
          input.body,
          input.category,
          input.image,
          input.href,
          JSON.stringify(input),
          now,
          now,
          now,
        );
      const insert = this.db.prepare(
        "INSERT INTO plane_activities (post_id, source_id, work_item_id, occurred_at, activity_json) VALUES (?, ?, ?, ?, ?)",
      );
      for (const activity of input.activities)
        insert.run(
          id,
          activity.id,
          activity.workItemId,
          activity.createdAt,
          JSON.stringify(activity),
        );
      const post = this.getPost(id)!;
      this.revision(post, "generated", "n8n");
      return { post, created: true };
    });
  }

  editPost(id: string, input: EditPost, actor: string): Post {
    return this.transaction(() => {
      const current = this.getPost(id);
      if (!current) throw new AppError("Post not found.", 404);
      if (input.version !== current.version)
        throw new AppError(
          "Another editor changed this post. Reload before saving so their changes are not overwritten.",
          409,
        );
      const now = new Date().toISOString();
      this.db
        .prepare(
          `UPDATE posts SET title = ?, summary = ?, body = ?, category = ?, image = ?, href = ?, status = ?, manually_edited = 1, version = version + 1, updated_at = ? WHERE id = ?`,
        )
        .run(
          input.title,
          input.summary,
          input.body,
          input.category,
          input.image,
          input.href,
          input.status,
          now,
          id,
        );
      const post = this.getPost(id)!;
      this.revision(post, "manual", actor);
      return post;
    });
  }

  detail(id: string): PostDetail | null {
    const row = this.db.prepare("SELECT * FROM posts WHERE id = ?").get(id) as
      Row | undefined;
    if (!row) return null;
    const revisions = (
      this.db
        .prepare(
          "SELECT * FROM post_revisions WHERE post_id = ? ORDER BY version DESC",
        )
        .all(id) as Row[]
    ).map((revision) => ({
      version: Number(revision.version),
      actor: revision.actor as string,
      kind: revision.kind as Revision["kind"],
      createdAt: revision.created_at as string,
      snapshot: JSON.parse(revision.snapshot_json as string) as Post,
    }));
    const activities = (
      this.db
        .prepare(
          "SELECT activity_json FROM plane_activities WHERE post_id = ? ORDER BY occurred_at, source_id",
        )
        .all(id) as Row[]
    ).map(
      (event) => JSON.parse(event.activity_json as string) as PlaneActivity,
    );
    return {
      post: toPost(row),
      originalGeneratedContent: JSON.parse(
        row.original_generated_json as string,
      ) as Submission,
      revisions,
      activities,
    };
  }

  user(name: string): AdminUser | null {
    const row = this.db
      .prepare("SELECT * FROM admin_users WHERE username = ?")
      .get(name) as Row | undefined;
    return row
      ? {
          id: row.id as string,
          username: row.username as string,
          passwordHash: row.password_hash as string,
          active: row.active === 1,
        }
      : null;
  }

  createUser(name: string, passwordHash: string) {
    if (this.user(name))
      throw new AppError(
        "That administrator already exists. Use admin:reset-password to rotate their password.",
        409,
      );
    this.db
      .prepare(
        "INSERT INTO admin_users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)",
      )
      .run(randomUUID(), name, passwordHash, new Date().toISOString());
  }

  resetPassword(name: string, passwordHash: string) {
    this.transaction(() => {
      const user = this.user(name);
      if (!user) throw new AppError("Administrator not found.", 404);
      this.db
        .prepare(
          "UPDATE admin_users SET password_hash = ?, active = 1 WHERE id = ?",
        )
        .run(passwordHash, user.id);
      this.db
        .prepare("DELETE FROM admin_sessions WHERE user_id = ?")
        .run(user.id);
    });
  }

  addSession(
    tokenHash: string,
    userId: string,
    csrfToken: string,
    expiresAt: string,
  ) {
    this.db
      .prepare("DELETE FROM admin_sessions WHERE expires_at <= ?")
      .run(new Date().toISOString());
    this.db
      .prepare("INSERT INTO admin_sessions VALUES (?, ?, ?, ?)")
      .run(tokenHash, userId, csrfToken, expiresAt);
  }

  session(tokenHash: string): AdminSession | null {
    const row = this.db
      .prepare(
        `SELECT s.*, u.username FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > ? AND u.active = 1`,
      )
      .get(tokenHash, new Date().toISOString()) as Row | undefined;
    return row
      ? {
          tokenHash,
          userId: row.user_id as string,
          username: row.username as string,
          csrfToken: row.csrf_token as string,
          expiresAt: row.expires_at as string,
        }
      : null;
  }

  revokeSession(tokenHash: string) {
    this.db
      .prepare("DELETE FROM admin_sessions WHERE token_hash = ?")
      .run(tokenHash);
  }
  revokeAllSessions() {
    this.db.exec("DELETE FROM admin_sessions");
  }

  consumeLoginAttempt(key: string, max: number, now = Date.now()) {
    return this.transaction(() => {
      const cutoff = now - 15 * 60 * 1000;
      this.db
        .prepare("DELETE FROM login_limits WHERE window_start <= ?")
        .run(cutoff);
      const row = this.db
        .prepare("SELECT attempts FROM login_limits WHERE key = ?")
        .get(key) as Row | undefined;
      if (row && Number(row.attempts) >= max) return false;
      this.db
        .prepare(
          `INSERT INTO login_limits (key, attempts, window_start) VALUES (?, 1, ?)
        ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1`,
        )
        .run(key, now);
      return true;
    });
  }
}

const globalStore = globalThis as typeof globalThis & { eagleEyeStore?: Store };
export function getStore() {
  // Reuse a connection during development reloads; never initialize at build time.
  return (globalStore.eagleEyeStore ??= new Store());
}

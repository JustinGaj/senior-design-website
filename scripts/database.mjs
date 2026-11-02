import { DatabaseSync, backup } from "node:sqlite";
import { chmodSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { randomBytes } from "node:crypto";
import { Store, databasePath } from "../lib/db/store.ts";

let database;
try {
  const [command, ...extra] = process.argv.slice(2);
  if (extra.length || !["init", "backup", "check"].includes(command))
    throw new Error("Use db:init, db:backup, or db:check.");
  const source = databasePath();
  if (command === "init") {
    const store = new Store(source);
    store.close();
    console.log("Database initialized; migrations are current.");
  } else {
    if (!existsSync(source))
      throw new Error(
        "Database not found. Check DATABASE_PATH before continuing.",
      );
    database = new DatabaseSync(source, { readOnly: true, timeout: 5000 });
    if (command === "check") {
      const rows = database.prepare("PRAGMA integrity_check").all();
      if (rows.some((row) => row.integrity_check !== "ok"))
        throw new Error("Database integrity check failed.");
      if (database.prepare("PRAGMA foreign_key_check").all().length)
        throw new Error("Database foreign key check failed.");
      console.log("Database integrity and foreign key checks passed.");
    } else {
      const folder = resolve(
        process.env.DATABASE_BACKUP_DIR || dirname(source) + "/backups",
      );
      mkdirSync(folder, { recursive: true, mode: 0o700 });
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const target = resolve(
        folder,
        `eagle-eye-${stamp}-${randomBytes(3).toString("hex")}.sqlite`,
      );
      await backup(database, target);
      if (process.platform !== "win32") chmodSync(target, 0o600);
      console.log("Consistent SQLite backup created: " + target);
    }
  }
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Database operation failed.",
  );
  process.exitCode = 1;
} finally {
  database?.close();
}

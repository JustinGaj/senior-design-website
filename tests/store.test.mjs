import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { backup } from "node:sqlite";
import { Store } from "../lib/db/store.ts";
import { parseSubmission, parseEdit } from "../lib/updates/validation.ts";
import { digest, hashPassword, verifyPassword } from "../lib/auth/crypto.ts";

function submission(overrides = {}) {
  return parseSubmission({
    periodStart: "2026-10-18",
    periodEnd: "2026-11-01",
    title: "Engineering progress",
    summary: "The team completed a tracked task.",
    body: "A recorded task moved to Done.\n\nThe team also documented the next test.",
    category: "Engineering",
    image: "engineering",
    activities: [
      {
        id: "activity-1",
        workItemId: "EE-1",
        createdAt: "2026-10-25T15:00:00Z",
        field: "state",
        oldValue: "In progress",
        newValue: "Done",
      },
    ],
    ...overrides,
  });
}

function temporaryStore(t) {
  const folder = mkdtempSync(join(tmpdir(), "eagle-eye-test-"));
  const store = new Store(join(folder, "site.sqlite"));
  t.after(() => {
    store.close();
    assert.equal(dirname(resolve(folder)), resolve(tmpdir()));
    rmSync(folder, { recursive: true, force: true });
  });
  return { store, folder };
}

test("generated posts retain original content, revisions, and Plane activity", (t) => {
  const { store } = temporaryStore(t);
  const input = submission();
  const { post, created } = store.createGeneratedPost(input);
  assert.equal(created, true);
  const detail = store.detail(post.id);
  assert.deepEqual(detail.originalGeneratedContent, input);
  assert.deepEqual(detail.activities, input.activities);
  assert.equal(detail.revisions[0].kind, "generated");
  assert.equal(store.listPosts().length, 1);
});

test("retries and a second connection cannot duplicate or overwrite a manually edited or unpublished post", (t) => {
  const { store, folder } = temporaryStore(t);
  const initial = store.createGeneratedPost(submission()).post;
  const edit = parseEdit({
    ...initial,
    title: "Corrected by the team",
    body: "Corrected details.",
    status: "unpublished",
  });
  const updated = store.editPost(initial.id, edit, "justin");
  const second = new Store(join(folder, "site.sqlite"));
  try {
    const retried = second.createGeneratedPost(
      submission({ title: "A later AI generation" }),
    );
    assert.equal(retried.created, false);
    assert.equal(retried.post.id, initial.id);
    assert.equal(retried.post.title, updated.title);
    assert.equal(retried.post.status, "unpublished");
    assert.equal(retried.post.version, 2);
    assert.equal(retried.post.manuallyEdited, true);
    assert.equal(second.listPosts().length, 0);
    assert.equal(second.getPost(initial.id, true), null);
    const detail = second.detail(initial.id);
    assert.equal(detail.revisions.length, 2);
    assert.equal(detail.originalGeneratedContent.title, initial.title);
    assert.equal(detail.activities.length, 1);
  } finally {
    second.close();
  }
});

test("overlapping periods are rejected while adjacent periods are accepted", (t) => {
  const { store } = temporaryStore(t);
  store.createGeneratedPost(submission());
  assert.throws(
    () =>
      store.createGeneratedPost(
        submission({ periodStart: "2026-10-25", periodEnd: "2026-11-08" }),
      ),
    { status: 409 },
  );
  store.createGeneratedPost(
    submission({
      periodStart: "2026-11-01",
      periodEnd: "2026-11-15",
      activities: [],
    }),
  );
  assert.equal(store.listPosts().length, 2);
});

test("stale editor versions cannot overwrite a newer revision; restoring content makes a new revision", (t) => {
  const { store } = temporaryStore(t);
  const initial = store.createGeneratedPost(submission()).post;
  store.editPost(
    initial.id,
    parseEdit({ ...initial, title: "First editor" }),
    "first",
  );
  assert.throws(
    () =>
      store.editPost(
        initial.id,
        parseEdit({ ...initial, title: "Stale editor" }),
        "second",
      ),
    { status: 409 },
  );
  const restored = store.editPost(
    initial.id,
    parseEdit({ ...initial, version: 2 }),
    "first",
  );
  assert.equal(restored.version, 3);
  assert.equal(store.detail(initial.id).revisions.length, 3);
});

test("a failed activity insert rolls back the entire post and revision", (t) => {
  const { store } = temporaryStore(t);
  const input = submission();
  assert.throws(() =>
    store.createGeneratedPost({
      ...input,
      activities: [input.activities[0], input.activities[0]],
    }),
  );
  assert.equal(store.listPosts(false).length, 0);
});

test("an online backup can be opened with all content, revisions, and evidence intact", async (t) => {
  const { store, folder } = temporaryStore(t);
  const post = store.createGeneratedPost(submission()).post;
  store.editPost(
    post.id,
    parseEdit({ ...post, summary: "Edited summary" }),
    "team",
  );
  const path = join(folder, "backup.sqlite");
  await backup(store.db, path);
  const restored = new Store(path);
  try {
    assert.deepEqual(restored.detail(post.id), store.detail(post.id));
  } finally {
    restored.close();
  }
});

test("validation rejects invalid periods, out-of-period evidence, duplicate activity IDs, and unsafe links", () => {
  assert.throws(() => submission({ periodStart: "2026-02-30" }));
  assert.throws(() => submission({ periodEnd: "2026-10-18" }));
  assert.throws(() => submission({ href: "javascript:alert(1)" }));
  assert.throws(() =>
    submission({
      activities: [
        { id: "a", workItemId: "EE-1", createdAt: "2026-11-01T00:00:00Z" },
      ],
    }),
  );
  const input = submission();
  assert.throws(() =>
    submission({ activities: [input.activities[0], input.activities[0]] }),
  );
  assert.throws(() => parseEdit({ ...input, status: "published" }));
});

test("passwords are salted and sessions expire, revoke, and rotate after a password reset", async (t) => {
  const { store } = temporaryStore(t);
  const hash = await hashPassword("a lengthy test password");
  assert.equal(await verifyPassword("a lengthy test password", hash), true);
  assert.equal(await verifyPassword("incorrect", hash), false);
  assert.notEqual(hash, await hashPassword("a lengthy test password"));
  store.createUser("tester", hash);
  const user = store.user("tester");
  store.addSession(
    digest("session"),
    user.id,
    "csrf",
    new Date(Date.now() + 60000).toISOString(),
  );
  assert.equal(store.session(digest("session")).username, "tester");
  store.resetPassword("tester", hash);
  assert.equal(store.session(digest("session")), null);
  store.addSession(
    digest("expired"),
    user.id,
    "csrf",
    "2020-01-01T00:00:00.000Z",
  );
  assert.equal(store.session(digest("expired")), null);
  store.addSession(
    digest("logout"),
    user.id,
    "csrf",
    new Date(Date.now() + 60000).toISOString(),
  );
  store.revokeSession(digest("logout"));
  assert.equal(store.session(digest("logout")), null);
});

test("login limits persist across database connections and expire after 15 minutes", (t) => {
  const { store, folder } = temporaryStore(t);
  assert.equal(store.consumeLoginAttempt("user:one", 2, 1000000), true);
  const second = new Store(join(folder, "site.sqlite"));
  try {
    assert.equal(second.consumeLoginAttempt("user:one", 2, 1000001), true);
    assert.equal(store.consumeLoginAttempt("user:one", 2, 1000002), false);
    assert.equal(second.consumeLoginAttempt("user:one", 2, 2000000), true);
  } finally {
    second.close();
  }
});

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { createServer } from "node:net";
import { randomBytes } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { Store } from "../lib/db/store.ts";
import { hashPassword, digest } from "../lib/auth/crypto.ts";

const folder = mkdtempSync(join(tmpdir(), "eagle-eye-http-"));
const dbPath = join(folder, "site.sqlite");
const store = new Store(dbPath);
const password = randomBytes(24).toString("hex");
const token = randomBytes(32).toString("hex");
await store.createUser("test-editor", await hashPassword(password));
const port = await new Promise((resolvePort, reject) => {
  const socket = createServer();
  socket.once("error", reject);
  socket.listen(0, "127.0.0.1", () => {
    const address = socket.address();
    socket.close(() => resolvePort(address.port));
  });
});
const origin = "https://eagle-eye.example.test";
const base = `http://127.0.0.1:${port}`;
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  {
    cwd: process.cwd(),
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      NODE_ENV: "production",
      DATABASE_PATH: dbPath,
      APP_ORIGIN: origin,
      UPDATES_INGEST_TOKEN: token,
    },
  },
);
let logs = "";
child.stdout.on("data", (chunk) => {
  logs += chunk.toString();
});
child.stderr.on("data", (chunk) => {
  logs += chunk.toString();
});
child.on("error", (error) => {
  logs += error.message;
});

const payload = {
  periodStart: "2026-10-18",
  periodEnd: "2026-11-01",
  title: "Integration test update",
  summary: "A recorded test task moved to Done.",
  body: "Public body.\n\n<script>alert('not executed')</script>",
  category: "Engineering",
  image: "engineering",
  activities: [
    {
      id: "private-activity-id",
      workItemId: "EE-TEST",
      createdAt: "2026-10-25T15:00:00Z",
      field: "state",
      oldValue: "In progress",
      newValue: "Done",
      comment: "Private supporting evidence",
    },
  ],
};

async function request(path, method = "GET", body, headers = {}) {
  return fetch(base + path, {
    method,
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (child.exitCode !== null)
      throw new Error("Next server exited: " + logs.slice(-2000));
    try {
      const response = await fetch(base + "/api/updates", {
        signal: AbortSignal.timeout(1000),
      });
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await delay(250);
  }
  assert(
    ready,
    "Production server did not start. Run npm run build first. " +
      logs.slice(-2000),
  );
  assert.deepEqual((await (await request("/api/updates")).json()).updates, []);
  assert.equal((await request("/admin")).status, 307);
  assert.equal((await request("/api/updates", "POST", payload)).status, 401);
  assert.equal(
    (
      await request("/api/updates", "POST", payload, {
        Authorization: "Bearer wrong",
      })
    ).status,
    401,
  );
  const auth = { Authorization: "Bearer " + token };
  assert.equal(
    (
      await request(
        "/api/updates",
        "POST",
        { ...payload, periodStart: "2026-02-30" },
        auth,
      )
    ).status,
    400,
  );
  const createdResponse = await request("/api/updates", "POST", payload, auth);
  assert.equal(
    createdResponse.status,
    201,
    await createdResponse.clone().text(),
  );
  const created = await createdResponse.json();
  assert.equal(
    (await request("/api/updates", "POST", payload, auth)).status,
    200,
  );
  const publicFeed = await (await request("/api/updates")).json();
  assert.equal(publicFeed.updates.length, 1);
  assert(!JSON.stringify(publicFeed).includes("Private supporting evidence"));
  assert(!JSON.stringify(publicFeed).includes("originalGeneratedContent"));
  let publicPage = await (await request("/updates/" + created.id)).text();
  assert(publicPage.includes("Public body."));
  assert(publicPage.includes("&lt;script&gt;"));
  assert(!publicPage.includes("Private supporting evidence"));
  assert.equal(
    (await request("/api/admin/posts/" + created.id, "PATCH", {})).status,
    401,
  );
  assert.equal(
    (
      await request(
        "/api/admin/login",
        "POST",
        { username: "test-editor", password },
        { Origin: "https://other.example.test" },
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await request(
        "/api/admin/login",
        "POST",
        { username: "test-editor", password: "wrong" },
        { Origin: origin },
      )
    ).status,
    401,
  );
  const login = await request(
    "/api/admin/login",
    "POST",
    { username: "test-editor", password },
    { Origin: origin },
  );
  assert.equal(login.status, 200, await login.clone().text());
  const setCookie = login.headers.get("set-cookie");
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=strict/i);
  assert.match(setCookie, /Secure/i);
  const cookie = setCookie.split(";")[0];
  const session = store.session(digest(cookie.split("=")[1]));
  assert(session);
  const edit = {
    ...store.getPost(created.id),
    title: "Edited by the team",
    body: "Manually corrected content",
    status: "unpublished",
  };
  const editPath = "/api/admin/posts/" + created.id;
  assert.equal(
    (await request(editPath, "PATCH", edit, { Cookie: cookie, Origin: origin }))
      .status,
    403,
  );
  const adminHeaders = {
    Cookie: cookie,
    Origin: origin,
    "X-CSRF-Token": session.csrfToken,
  };
  assert.equal(
    (
      await request(editPath, "PATCH", edit, {
        ...adminHeaders,
        Origin: "https://other.example.test",
      })
    ).status,
    403,
  );
  const saved = await request(editPath, "PATCH", edit, adminHeaders);
  assert.equal(saved.status, 200, await saved.clone().text());
  const detail = await saved.json();
  assert.equal(detail.post.version, 2);
  assert.equal(detail.revisions.length, 2);
  assert.equal(detail.originalGeneratedContent.title, payload.title);
  assert.equal(detail.activities[0].comment, "Private supporting evidence");
  assert.equal(
    (await request(editPath, "PATCH", edit, adminHeaders)).status,
    409,
  );
  assert.equal(
    (await (await request("/api/updates")).json()).updates.length,
    0,
  );
  assert.equal((await request("/updates/" + created.id)).status, 404);
  const retry = await (
    await request(
      "/api/updates",
      "POST",
      { ...payload, title: "Automation must not overwrite" },
      auth,
    )
  ).json();
  assert.equal(retry.created, false);
  assert.equal(retry.status, "unpublished");
  assert.equal(store.getPost(created.id).title, "Edited by the team");
  const republished = await request(
    editPath,
    "PATCH",
    { ...edit, status: "published", version: 2 },
    adminHeaders,
  );
  assert.equal(republished.status, 200);
  assert.equal(store.detail(created.id).revisions.length, 3);
  publicPage = await (await request("/updates/" + created.id)).text();
  assert(publicPage.includes("Manually corrected content"));
  assert.equal(
    (await request("/api/admin/logout", "POST", undefined, adminHeaders))
      .status,
    200,
  );
  assert.equal(
    (await request(editPath, "PATCH", { ...edit, version: 3 }, adminHeaders))
      .status,
    401,
  );
  const cli = spawn(process.execPath, ["scripts/database.mjs", "backup"], {
    cwd: process.cwd(),
    windowsHide: true,
    stdio: "ignore",
    env: {
      ...process.env,
      DATABASE_PATH: dbPath,
      DATABASE_BACKUP_DIR: join(folder, "backups"),
    },
  });
  assert.equal(await new Promise((done) => cli.once("exit", done)), 0);
  assert.equal(readdirSync(join(folder, "backups")).length, 1);
  console.log(
    "Production HTTP checks passed: publication, authentication, CSRF, escaped content, revisions, conflicts, unpublish/republish, retry protection, logout, and backup CLI.",
  );
} finally {
  child.kill();
  await Promise.race([
    new Promise((done) => child.once("exit", done)),
    delay(5000),
  ]);
  if (child.exitCode === null && child.signalCode === null)
    child.kill("SIGKILL");
  store.close();
  assert.equal(dirname(resolve(folder)), resolve(tmpdir()));
  rmSync(folder, { recursive: true, force: true });
}

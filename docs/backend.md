# Project log backend

Eagle Eye stores posts, reporting periods, original generated content, revisions, Plane evidence, administrator accounts, and sessions in SQLite. The website reads published posts from its own database. n8n submits new posts; it no longer supplies the public feed on each visit.

## Runtime and local setup

Use Node.js **24.13 or newer** and a running Next.js Node server. This backend uses Node's built-in `node:sqlite`; Node may print its experimental-feature warning. No separate database service or native SQLite npm package is needed. Static export hosting cannot run this backend.

```sh
npm ci
cp .env.example .env.local
npm run db:init
npm run admin:create -- justin
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env.local` instead of `cp` if preferred. The account command prompts twice for a hidden password of 12–128 characters. No default accounts are shipped, and passwords are stored as salted scrypt hashes. Create an individual account for each editor.

Open `/admin/login` and sign in. The public feed includes two archived October entries from the repository. New posts are stored in SQLite and appear before the archive. The archive does not appear in the editor. A published database post has a full-text page at `/updates/POST_ID`.

The application and CLI commands read `.env.local`; system environment variables can also supply configuration. Run CLI commands from the repository root, using the same database environment as the running application.

| Variable               | Purpose                                                                                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_PATH`        | SQLite file, default `./data/site.sqlite`. Use an absolute persistent path in production. Never put it inside `public`.                                                      |
| `DATABASE_BACKUP_DIR`  | Backup folder; defaults to a `backups` directory alongside the database.                                                                                                     |
| `APP_ORIGIN`           | Exact website origin. Use `http://localhost:3000` locally and `https://eagleye.stevensweb.org` on the server. Required with HTTPS in production for administrator mutations. |
| `UPDATES_INGEST_TOKEN` | Separate automation credential, at least 32 characters. Blank disables automated publishing.                                                                                 |

Generate the publishing token locally, then save it in the server environment and n8n's credential manager:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Do not put this token in browser code, GitHub, URLs, or a `NEXT_PUBLIC_*` variable. The previous `N8N_UPDATES_WEBHOOK_URL` is no longer used.

## Production deployment and storage

Use a single server with persistent local disk, or multiple Node workers on the same local SQLite file. Do not place this WAL database on a network filesystem or give independent replicas their own copies.

Example production environment:

```dotenv
DATABASE_PATH=/srv/eagle-eye-data/site.sqlite
DATABASE_BACKUP_DIR=/srv/eagle-eye-backups
APP_ORIGIN=https://eagleye.stevensweb.org
UPDATES_INGEST_TOKEN=YOUR_RANDOM_TOKEN
```

Keep the environment file outside the deployed checkout, restrict it to the service account, and have your process manager load it. The service account needs read/write access to the database **directory**, including SQLite's `-wal` and `-shm` files. On Linux, a private directory (`0700`) and database (`0600`) are appropriate. Backups contain private evidence and account hashes, so protect them too.

Deploy code with:

```sh
npm ci
npm run db:init
npm run build
npm start
```

The reverse proxy must forward requests to the Next.js server and provide HTTPS. `APP_ORIGIN` remains the public HTTPS origin even when the proxy talks to Node over HTTP. Disable proxy/CDN caching for `/admin`, `/admin/*`, `/api/admin/*`, `/api/updates`, and `/updates/*` so edits and unpublishing become visible on the next request. The application marks its dynamic responses as non-cacheable.

**Keep the database and secrets outside any directory deleted or replaced by the deployment script.** Pulling or rebuilding the repo must not reset either one. Do not run `git clean -fdx` against a checkout containing a live database. `.gitignore` excludes runtime databases and backups; that does not protect them from deployment deletion.

Versioned migrations live in `lib/db/schema.ts`. `db:init` applies pending migrations transactionally. Back up before upgrading. A newer schema is rejected by older application code; an application rollback may need its matching database backup.

## Editing and publishing

The administrator list includes both published and unpublished posts. Open a post, edit its title, summary, body, category, illustration, related link, or visibility, then select **Save changes**. Use publicly accessible URLs for related links. The public article hides links to the team's Plane instance.

- Unpublished posts disappear from the feed and return 404 on their public URL.
- Each save creates a revision with the editor's username, timestamp, and full content snapshot.
- Original generated content and Plane activity remain unchanged.
- A previous revision can be loaded into the editor. Saving it creates another revision rather than deleting history.
- An editor saving an old version gets a 409 conflict. Copy any unsaved changes before reloading.
- Automation is create-only. Retrying a period never edits, republishes, or adds evidence to an existing post, even when it has no manual edits yet.

Post bodies are plain text and support blank-line paragraph breaks. HTML is rendered as text, not executed. Raw Plane evidence and revisions are available only to signed-in administrators, not through public post endpoints.

Sessions use random tokens stored as hashes, expire after 12 hours, and use HttpOnly, SameSite=Strict cookies (Secure in production). Mutations also require the exact configured origin and a per-session CSRF token. Sign-in limits are database-backed. There is no public registration or password-reset endpoint.

Account maintenance:

```sh
npm run admin:create -- teammate
npm run admin:reset-password -- teammate
npm run admin:revoke-sessions
```

A password reset revokes that user's sessions. The last command revokes all sessions, including after restoring a backup. Rotate the n8n publishing token by replacing its environment value, restarting the app, and updating n8n.

## n8n submission contract

The [n8n workflow guide](n8n.md) provides the scheduled workflow and local smoke workflow. n8n calls the website endpoint. The website serves the saved posts from SQLite.

Send one request per reporting period:

```http
POST https://eagleye.stevensweb.org/api/updates
Authorization: Bearer YOUR_RANDOM_TOKEN
Content-Type: application/json
```

```json
{
  "periodStart": "2026-10-18",
  "periodEnd": "2026-11-01",
  "title": "Biweekly engineering progress",
  "summary": "A concise public summary of recorded work.",
  "body": "Completed work supported by Plane history.\n\nOngoing work and documented next steps.",
  "category": "Engineering",
  "image": "engineering",
  "activities": [
    {
      "id": "plane-activity-uuid",
      "workItemId": "EE-42",
      "createdAt": "2026-10-25T15:00:00Z",
      "field": "state",
      "verb": "updated",
      "oldValue": "In progress",
      "newValue": "Done",
      "comment": "Optional supporting note",
      "actor": "Optional actor name",
      "url": "https://YOUR-PLANE-HOST/WORK-ITEM-URL"
    }
  ]
}
```

Reporting dates are UTC calendar boundaries: `periodStart` is inclusive and `periodEnd` exclusive. The example covers Oct 18 at 00:00 UTC through, but not including, Nov 1 at 00:00 UTC. n8n may run on a New York schedule but must use these explicit UTC boundaries for evidence retrieval and submission. Activity timestamps must fall inside that period and include their time zone. Keep the same boundaries on retries; never recompute them from the retry time.

Required content: `title` (up to 140 characters), `summary` (600), `body` (30,000), reporting dates, and `activities` (up to 1,000 records). Each activity needs a unique `id`, `workItemId`, and `createdAt`. Other activity fields are optional text; serialize complex old/new values to strings in n8n. `category` defaults to Project. `image` defaults to engineering and accepts engineering, concept, or flight; it chooses the site's existing card illustration, not an image URL. An optional top-level `href` supplies a related HTTP/HTTPS link. Publication time is assigned by the server.

Total request size is capped at 1 MiB, including all evidence. Fetch all pages of Plane activities, remove duplicate IDs, filter to the reporting period, and supply enough evidence for the post. If a period exceeds the limits, reduce verbose fields or coordinate a capacity change; do not silently omit the remaining pages. Send `activities: []` for a factual no-recorded-progress post. Source history is only as complete as the Plane API access and data supplied by the workflow.

| Status                  | Meaning and workflow action                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `201`                   | New post published and saved atomically with its evidence and first revision.                                          |
| `200`, `created: false` | Exact reporting period already exists. Treat as a successful retry; its current content and visibility were preserved. |
| `400` / `413` / `415`   | Invalid input, excessive size, or wrong content type. Correct the request rather than retrying unchanged.              |
| `401`                   | Publishing token is missing or incorrect.                                                                              |
| `409`                   | Period overlaps a different existing period. Inspect the dates; do not shift them to force publication.                |
| `503`                   | Publishing is unconfigured or temporarily unavailable. Check configuration and retry transient failures with backoff.  |

Use a dedicated Bearer Auth credential in n8n with the raw publishing token. The response includes the post ID, whether it was created, current version, visibility, and whether it was manually edited. `GET /api/updates` returns only published database card data and links to public detail pages. It never exposes the submitted evidence or revisions.

## Backups and recovery

```sh
npm run db:backup
npm run db:check
```

`db:backup` uses SQLite's online backup API, including committed WAL changes, and writes a uniquely named backup without replacing earlier files. It is safe to run while the app is serving requests. `db:check` checks integrity and foreign keys. Both fail if the configured source file does not exist, avoiding a misleading backup of an accidental empty database.

Schedule backups daily and before deployments. Keep a copy off the server and choose a retention policy, for example 30 daily backups. A database on the same disk is persistent storage, not a disaster-recovery backup.

To restore:

1. Stop all application processes using the database.
2. Preserve the current database and any `-wal` / `-shm` sidecar files in a separate recovery folder.
3. Place the selected backup at the configured `DATABASE_PATH`. Ensure old sidecars from the replaced database are no longer present there.
4. Restore ownership/permissions, run `npm run db:check`, then `npm run db:init` with the matching application version.
5. Run `npm run admin:revoke-sessions`, restart the app, sign in, and verify a post, its revisions, and evidence.

Never replace the file or remove its WAL while Node processes are running. Test restoration to a separate path regularly before relying on backups.

## Verification

```sh
npm run check
npm test
npm run build
npm run test:integration
```

The unit tests use temporary databases and cover retries, manual edits, unpublishing, revision conflicts, overlapping periods, rollback, password/session behavior, migrations, and online backup restoration. Integration tests start a temporary production Next server with generated test credentials and an isolated database; they never use the real database or n8n token.

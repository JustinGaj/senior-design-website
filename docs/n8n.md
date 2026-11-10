# Publish biweekly project updates with n8n

The website receives a JSON POST at `/api/updates`. n8n uses a Schedule Trigger and an outgoing HTTP Request node. Plane supplies work items and their recorded history via its read API.

## How a post is made

1. **Sunday schedule → Reporting period.** The trigger checks Sundays at 9 a.m. in `America/New_York`. The date check continues only on alternating Sundays anchored to `firstPeriodEnd` (November 15, 2026 in the export). The first automated window starts November 1. A window spans 14 days from midnight UTC inclusive to midnight UTC exclusive. Manual runs can select an earlier completed window on that cadence with `overridePeriodEnd`. Scheduled runs ignore that override.
2. **List Plane work items → Read Plane history → Collect Plane activity.** The workflow fetches all available pages for the four configured projects, deduplicates events by ID, and keeps activity recorded inside the window. It keeps supporting evidence private in SQLite and sends selected progress fields and relevant task titles to the configured model. Comment and description values and tasks flagged by the access-task filter are omitted from model input. The model can summarize only the records the Plane credential can read.
3. **Write team update → Validate website post.** The model writes a title, short Overview summary, and plain-text article body. The structured parser and validation step check the shape and limits. The workflow attaches the reporting dates and evidence separately. With `publishEnabled: false`, the validated payload ends at **Preview only**. Check it against Plane before enabling live publishing.
4. **Publish to Eagle Eye.** n8n sends the payload as JSON with the website's dedicated Bearer Auth credential. The first accepted submission returns **201**. SQLite stores the post, original generation, evidence, and initial revision in one transaction. A repeated period returns **200** with `created: false` and preserves edits and visibility. An overlapping period returns **409**.
5. **Website and editing.** Overview displays the two latest summaries. Updates links to the article at `/updates/<id>`. At `/admin/login`, an editor can update the title, summary, body, or visibility. Each save creates a revision. Unpublishing removes the post from both public feeds. The original two October entries stay visible in the archive and are maintained in `app/data/project-updates.ts`.

## Local smoke test on Windows

Use a checkout of `feat/sqlite-project-log` and Node.js 24.13+. In the repo root, create a local environment file if one does not already exist.

```powershell
npm ci
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Set `UPDATES_INGEST_TOKEN` in `.env.local` to the generated value. Use a disposable database, for example `DATABASE_PATH=./data/n8n-smoke.sqlite`. Keep `APP_ORIGIN=http://localhost:3000` and open that exact origin when using the admin editor.

```powershell
npm run db:init
npm run admin:create -- yourname
npm run dev
```

**Test without n8n or a model key.** In a second PowerShell, run this from the repo root. At the prompt, enter the token from your local `.env.local`. This sends the same fixture as the local n8n workflow.

```powershell
$workflow = Get-Content n8n/local-publish-test.json -Raw | ConvertFrom-Json
$body = ($workflow.nodes | Where-Object name -eq 'Fixture post').parameters.jsonOutput
$token = Read-Host 'Local publishing token' -AsSecureString
$bearer = [System.Net.NetworkCredential]::new('', $token).Password
$result = Invoke-WebRequest -UseBasicParsing -Method Post -Uri 'http://localhost:3000/api/updates' -Headers @{ Authorization = "Bearer $bearer" } -ContentType 'application/json' -Body $body
$result.StatusCode
$result.Content
Remove-Variable token, bearer
```

**Test from the n8n editor.** Run `npx n8n` in another terminal and open `http://localhost:5678`. Import [local-publish-test.json](../n8n/local-publish-test.json) using **Import from File**. Open **Publish to Eagle Eye**, create a **Generic Credential Type → Bearer Auth** credential, and enter the raw local token in **Bearer Token**. Execute the manual workflow. This local workflow uses fixed fixture content and requires neither Plane nor a model credential. The hosted n8n instance cannot reach the website on your computer through `localhost`.

On a fresh test database the first run returns **201** and a second run returns **200** with `created: false`. Refresh the website and check the summary in Overview, the article link in Updates, and the full article. Edit or unpublish the fixture at `/admin/login`, then rerun the workflow. The existing post ID, edits, and visibility should be preserved. Use a new disposable database to repeat the first-publication check.

## Enable production

1. Deploy the SQLite branch as the Next.js Node service. Give it an absolute persistent `DATABASE_PATH` outside the deployment checkout and a fresh production `UPDATES_INGEST_TOKEN`. Set `APP_ORIGIN=https://eagleye.stevensweb.org`. Run `npm run db:init`, build and restart, and check the public `GET /api/updates`. See [backend deployment and backups](backend.md).
2. In the hosted n8n editor, import [biweekly-updates.json](../n8n/biweekly-updates.json) as the production workflow. Copy the four actual Plane project UUIDs from **Project configuration** in the existing draft into the matching placeholders in the new workflow. Select the existing Plane **Header Auth** credential (`X-API-Key`) in both Plane GET nodes. Attach the model credential in **Summary model**. In **Publish to Eagle Eye**, select a separate **Bearer Auth** credential containing the raw production token. Keep one scheduled workflow published.
3. With `publishEnabled: false`, execute **Manual preview** after the first window closes, or use a completed aligned window. Inspect **Preview only** for the correct dates, summaries, and supporting evidence. A manual run selects the latest completed window by default. To retry an older window, set `overridePeriodEnd` to that exact completed period end, run manually, then clear it.
4. After reviewing the preview and checking the live endpoint, set `publishEnabled: true`. Run once manually for the intended period and verify the post on the live site, then publish the n8n workflow to start the schedule. Use the same period for a retry if an execution fails. Investigate **401** as an authentication error, **409** as a date conflict, and **503** as a server or deployment issue.

The exports contain no saved credentials or pinned Plane responses. Keep the database, n8n credentials, and environment files out of Git.

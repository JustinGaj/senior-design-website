# Eagle Eye

Responsive Next.js project website with an SQLite-backed project log.

## Local development

Use Node.js **24.13 or newer**.

```sh
npm ci
cp .env.example .env.local
npm run db:init
npm run admin:create -- yourname
npm run dev
```

On PowerShell, `Copy-Item .env.example .env.local` also works. Administrator creation prompts for a hidden password. Open `/admin/login` to manage posts.

## Project updates

The Overview preview and Updates page read published posts from `GET /api/updates`. Full entries have permanent `/updates/POST_ID` URLs. The authenticated `POST /api/updates` endpoint accepts biweekly posts and supporting Plane activity from n8n.

Posts, original generations, revisions, evidence, and administrator accounts persist in SQLite. There are no placeholder posts or default passwords. Retries never overwrite an existing reporting period or a team's edits.

See **[backend setup and operations](docs/backend.md)** for the complete n8n payload, account management, publishing behavior, server configuration, migrations, online backups, and recovery.

## Deployment

Run this as a Next.js Node server, not an exported static site. Store the live database and environment secrets outside the directory replaced by deployments. Configure `DATABASE_PATH`, `APP_ORIGIN`, and `UPDATES_INGEST_TOKEN` on the server; keep runtime files and secrets out of Git.

```sh
npm ci
npm run db:init
npm run build
npm start
```

The `dev` and `build` scripts use Webpack for compatibility with the reported Windows native-binding issue.

## Checks

```sh
npm run check
npm test
npm run build
npm run test:integration
```

Integration checks start an isolated production server with a temporary database and generated test credentials. They do not publish to the live website or use real credentials.

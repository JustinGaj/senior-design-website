# Gimbaled Drone System

Responsive Next.js App Router website for the Stevens engineering project.

## Project log

Overview shows a short summary of the latest update, and Updates provides the
fuller entries. The current posts are curated from Plane activity for October
18–31, 2026, with activity dates and links to their source work items (PMGT-16 and
PMGT-5). Edit the content in `app/data/project-updates.ts`.

The feed renders directly from that file without credentials, n8n, or a database.
Automated publishing is not active in this branch. The existing API route remains
available for the future integration.

## Run locally

```bash
npm install
npm run dev
```

## Project updates webhook

The `/api/updates` route serves curated local entries until the n8n workflow is configured. Set `N8N_UPDATES_WEBHOOK_URL` in the deployment environment (server-side only). The webhook should respond with JSON shaped like:

```json
{
  "updates": [
    {
      "date": "2026-10-27",
      "title": "Concept review",
      "category": "Design",
      "summary": "A concise update for the project blog.",
      "image": "concept",
      "href": "https://example.com/project-ticket"
    }
  ]
}
```

The API route falls back to local entries if the webhook is absent or unavailable. The current website feed uses the curated project-log file described above. Keep integrations read-only and do not place webhook secrets in client-side environment variables.

## Content editing

Project descriptions, team roles, design alternatives, engineering targets, planning milestones, BOM rows, and curated update entries are in `app/page.tsx` and `app/data/project-updates.ts`. Verify engineering targets, budget values, milestones, and update dates with the team before publishing them as current.

## Bundler

The `dev` and `build` scripts use Next.js Webpack mode for compatibility with Windows environments where Turbopack native bindings are unavailable.

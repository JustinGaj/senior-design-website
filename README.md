# Gimbaled Drone System

Responsive Next.js App Router website for the Stevens ME 423 senior design project.

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

The page requests this endpoint on load. The route falls back to local entries if the webhook is absent or unavailable. Keep integrations read-only and do not place webhook secrets in client-side environment variables.

## Content editing

Project descriptions, team roles, design alternatives, engineering targets, planning milestones, BOM rows, and local update entries are in `app/page.tsx` and `app/api/updates/route.ts`. Verify engineering targets, budget values, milestones, and update dates with the team before publishing them as current.

## Bundler

The `dev` and `build` scripts use Next.js Webpack mode for compatibility with Windows environments where Turbopack native bindings are unavailable.

import { NextResponse } from "next/server";

type ProjectUpdate = { date?: string; title: string; category: string; summary: string; image: "engineering" | "concept" | "flight"; href?: string };

// Seed entries summarize material in the project brief; they are not dated progress claims.
const fallback: ProjectUpdate[] = [
  { title: "Project goals and requirements", category: "Project", summary: "The brief sets goals for target range, gimbal mass, power, camera rate, and stable tracking.", image: "engineering" },
  { title: "Concepts under evaluation", category: "Design", summary: "Candidate compute, camera, gimbal, and control architectures are compared against weighted criteria.", image: "concept" },
  { title: "Integration approach", category: "Engineering", summary: "The proposed system combines optical sensing, onboard compute, inertial feedback, and a wireless ground station.", image: "flight" }
];

function normalizeUpdates(payload: unknown): ProjectUpdate[] | null {
  const items = Array.isArray(payload) ? payload : (payload as { updates?: unknown } | null)?.updates;
  if (!Array.isArray(items)) return null;
  const rows: ProjectUpdate[] = [];
  for (const value of items) {
    if (!value || typeof value !== "object") continue;
    const item = value as Record<string, unknown>;
    if (typeof item.title !== "string" || typeof item.summary !== "string") continue;
    const date = typeof item.date === "string" && !Number.isNaN(Date.parse(item.date)) ? item.date.slice(0, 40) : undefined;
    const href = typeof item.href === "string" && /^https?:\/\//i.test(item.href) ? item.href.slice(0, 2048) : undefined;
    const image = item.image === "concept" || item.image === "flight" ? item.image : "engineering";
    rows.push({
      title: item.title.slice(0, 140),
      category: typeof item.category === "string" ? item.category.slice(0, 48) : "Project",
      summary: item.summary.slice(0, 600),
      image,
      ...(date ? { date } : {}),
      ...(href ? { href } : {})
    });
  }
  return rows;
}

export async function GET() {
  // n8n integration: set N8N_UPDATES_WEBHOOK_URL in the server environment.
  // Expected JSON: { "updates": [{ "date", "title", "category", "summary", "image", "href" }] }.
  // Keep the webhook URL server-side; never expose credentials in NEXT_PUBLIC_* variables.
  const endpoint = process.env.N8N_UPDATES_WEBHOOK_URL;
  if (!endpoint) return NextResponse.json({ updates: fallback, source: "local" }, { headers: { "Cache-Control": "no-store" } });
  try {
    const response = await fetch(endpoint, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Webhook returned ${response.status}`);
    const updates = normalizeUpdates(await response.json());
    if (!updates) throw new Error("Webhook payload must contain an updates array");
    return NextResponse.json({ updates, source: "n8n" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ updates: fallback, source: "local", integration: "unavailable" }, { headers: { "Cache-Control": "no-store" } });
  }
}

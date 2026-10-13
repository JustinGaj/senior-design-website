import { NextResponse } from "next/server";

const fallback = [
  { date: "2026-10-13", title: "Project kickoff and requirements", category: "Project", summary: "The team aligned on system goals, user needs, and initial performance targets.", image: "engineering" },
  { date: "2026-10-27", title: "Concept review", category: "Design", summary: "We compared candidate camera, compute, gimbal, and control architectures against the weighted criteria.", image: "concept" },
  { date: "2026-11-10", title: "Integration plan", category: "Integration", summary: "Mechanical packaging, power distribution, sensing, and software interfaces are being brought together.", image: "flight" }
];

export async function GET() {
  // n8n integration: set N8N_UPDATES_WEBHOOK_URL in the server environment.
  // Expected JSON: { "updates": [{ "date", "title", "category", "summary", "image", "href" }] }.
  // Keep the webhook URL server-side; never expose credentials in NEXT_PUBLIC_* variables.
  const endpoint = process.env.N8N_UPDATES_WEBHOOK_URL;
  if (!endpoint) return NextResponse.json({ updates: fallback, source: "local" }, { headers: { "Cache-Control": "no-store" } });
  try {
    const response = await fetch(endpoint, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Webhook returned ${response.status}`);
    const payload: unknown = await response.json();
    const updates = Array.isArray(payload) ? payload : (payload as { updates?: unknown })?.updates;
    if (!Array.isArray(updates)) throw new Error("Webhook payload must contain an updates array");
    return NextResponse.json({ updates, source: "n8n" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ updates: fallback, source: "local", integration: "unavailable" }, { headers: { "Cache-Control": "no-store" } });
  }
}

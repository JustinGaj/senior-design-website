import { NextResponse } from "next/server";

// Seed entries are summaries of material in the project brief, not dated progress claims.
// Replace them with approved bi-weekly posts when the n8n feed is connected.
const fallback = [
  { title: "Project goals and requirements", category: "Project", summary: "The brief sets goals for target range, gimbal mass, power, camera rate, and stable tracking.", image: "engineering" },
  { title: "Concepts under evaluation", category: "Design", summary: "Candidate compute, camera, gimbal, and control architectures are compared against weighted criteria.", image: "concept" },
  { title: "Integration approach", category: "Engineering", summary: "The proposed system combines optical sensing, onboard compute, inertial feedback, and a wireless ground station.", image: "flight" }
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

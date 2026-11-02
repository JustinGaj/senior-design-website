import { NextResponse } from "next/server";
import { getStore } from "../../../lib/db/store.ts";
import { parseSubmission } from "../../../lib/updates/validation.ts";
import {
  apiError,
  privateHeaders,
  readJson,
  requireIngestToken,
} from "../../../lib/http.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Only public content is returned. Original generations, evidence, and revisions stay private.
    const updates = getStore()
      .listPosts()
      .map((post) => ({
        id: post.id,
        date: post.publishedAt,
        title: post.title,
        summary: post.summary,
        category: post.category,
        image: post.image,
        periodStart: post.periodStart,
        periodEnd: post.periodEnd,
        url: `/updates/${post.id}`,
      }));
    return NextResponse.json(
      { updates, source: "database" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    requireIngestToken(request);
    const input = parseSubmission(await readJson(request));
    const result = getStore().createGeneratedPost(input);
    return NextResponse.json(
      {
        id: result.post.id,
        created: result.created,
        status: result.post.status,
        version: result.post.version,
        manuallyEdited: result.post.manuallyEdited,
        message: result.created
          ? "Post published."
          : "This period already exists; its content and visibility were preserved.",
      },
      { status: result.created ? 201 : 200, headers: privateHeaders },
    );
  } catch (error) {
    return apiError(error);
  }
}

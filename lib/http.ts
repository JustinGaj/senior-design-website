import { NextResponse } from "next/server";
import { AppError } from "./updates/types.ts";
import { equalSecret } from "./auth/crypto.ts";

export const privateHeaders = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function readJson(
  request: Request,
  maxBytes = 1024 * 1024,
): Promise<unknown> {
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  ) {
    throw new AppError("Send Content-Type: application/json.", 415);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new AppError("A JSON request body is required.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) {
        await reader.cancel();
        throw new AppError("Request body is too large.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new AppError("Request body is not valid JSON.");
  }
}

export function appOrigin(request?: Request) {
  const configured = process.env.APP_ORIGIN;
  if (!configured && process.env.NODE_ENV === "production")
    throw new AppError("Administrator access is not configured.", 503);
  const origin = new URL(configured || request?.url || "http://localhost:3000");
  if (process.env.NODE_ENV === "production" && origin.protocol !== "https:")
    throw new AppError("Administrator access requires HTTPS.", 503);
  return origin.origin;
}

export function requireSameOrigin(request: Request) {
  if (request.headers.get("origin") !== appOrigin(request))
    throw new AppError("Request origin is not allowed.", 403);
}

export function requireCsrf(request: Request, token: string) {
  requireSameOrigin(request);
  const provided = request.headers.get("x-csrf-token");
  if (!provided || !equalSecret(provided, token))
    throw new AppError("The form has expired. Reload and try again.", 403);
}

export function requireIngestToken(request: Request) {
  const token = process.env.UPDATES_INGEST_TOKEN;
  if (!token || token.length < 32)
    throw new AppError("Automated publishing is not configured.", 503);
  const provided = request.headers
    .get("authorization")
    ?.match(/^Bearer (.+)$/)?.[1];
  if (!provided || !equalSecret(provided, token))
    throw new AppError("Invalid publishing credentials.", 401);
}

export function apiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status, headers: privateHeaders },
    );
  }
  // Keep database paths, payloads, credentials, and stack traces out of responses.
  console.error("Eagle Eye backend operation failed.");
  return NextResponse.json(
    { error: "The service is temporarily unavailable." },
    { status: 503, headers: privateHeaders },
  );
}

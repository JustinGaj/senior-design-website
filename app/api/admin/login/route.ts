import { NextResponse } from "next/server";
import { getStore } from "../../../../lib/db/store.ts";
import {
  digest,
  dummyHash,
  randomToken,
  verifyPassword,
} from "../../../../lib/auth/crypto.ts";
import { sessionCookie, sessionSeconds } from "../../../../lib/auth/admin.ts";
import {
  apiError,
  privateHeaders,
  readJson,
  requireSameOrigin,
} from "../../../../lib/http.ts";
import { object } from "../../../../lib/updates/validation.ts";
import { AppError } from "../../../../lib/updates/types.ts";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const input = object(await readJson(request, 4096));
    if (
      typeof input.username !== "string" ||
      typeof input.password !== "string" ||
      input.password.length > 128 ||
      input.username.length > 64
    ) {
      throw new AppError("Invalid username or password.", 401);
    }
    const name = input.username.toLowerCase();
    const store = getStore();
    // Database-backed limits survive server restarts and apply across Node workers.
    if (
      !store.consumeLoginAttempt("global", 100) ||
      !store.consumeLoginAttempt("user:" + digest(name), 10)
    ) {
      return NextResponse.json(
        { error: "Too many sign-in attempts. Try again in 15 minutes." },
        { status: 429, headers: { ...privateHeaders, "Retry-After": "900" } },
      );
    }
    const user = store.user(name);
    const valid = await verifyPassword(
      input.password,
      user?.passwordHash ?? dummyHash,
    );
    if (!valid || !user?.active)
      throw new AppError("Invalid username or password.", 401);
    const token = randomToken();
    const csrfToken = randomToken();
    store.transaction(() => {
      // A reset during asynchronous password verification must invalidate this sign-in too.
      const latest = store.user(name);
      if (!latest?.active || latest.passwordHash !== user.passwordHash) {
        throw new AppError("Invalid username or password.", 401);
      }
      store.addSession(
        digest(token),
        latest.id,
        csrfToken,
        new Date(Date.now() + sessionSeconds * 1000).toISOString(),
      );
    });
    const response = NextResponse.json(
      { ok: true },
      { headers: privateHeaders },
    );
    response.cookies.set(sessionCookie, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: sessionSeconds,
    });
    return response;
  } catch (error) {
    return apiError(error);
  }
}

import { NextResponse } from "next/server";
import { requireAdmin, sessionCookie } from "../../../../lib/auth/admin.ts";
import { getStore } from "../../../../lib/db/store.ts";
import { apiError, privateHeaders, requireCsrf } from "../../../../lib/http.ts";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    requireCsrf(request, session.csrfToken);
    getStore().revokeSession(session.tokenHash);
    const response = NextResponse.json(
      { ok: true },
      { headers: privateHeaders },
    );
    response.cookies.set(sessionCookie, "", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return apiError(error);
  }
}

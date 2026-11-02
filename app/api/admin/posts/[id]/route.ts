import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/auth/admin.ts";
import { getStore } from "../../../../../lib/db/store.ts";
import { parseEdit } from "../../../../../lib/updates/validation.ts";
import {
  apiError,
  privateHeaders,
  readJson,
  requireCsrf,
} from "../../../../../lib/http.ts";
import { AppError } from "../../../../../lib/updates/types.ts";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const session = await requireAdmin();
    requireCsrf(request, session.csrfToken);
    const input = parseEdit(await readJson(request, 128 * 1024));
    const { id } = await params;
    getStore().editPost(id, input, session.username);
    const detail = getStore().detail(id);
    if (!detail) throw new AppError("Post not found.", 404);
    return NextResponse.json(detail, { headers: privateHeaders });
  } catch (error) {
    return apiError(error);
  }
}

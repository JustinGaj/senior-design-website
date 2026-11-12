import { cookies } from "next/headers";
import { getStore } from "../db/store.ts";
import { digest } from "./crypto.ts";
import { AppError } from "../updates/types.ts";

export const sessionCookie = "eagle_eye_admin";
export const sessionSeconds = 12 * 60 * 60;

export async function currentAdmin() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return getStore().session(digest(token));
}

export async function requireAdmin() {
  const session = await currentAdmin();
  if (!session) throw new AppError("Please sign in again.", 401);
  return session;
}

import {
  createHash,
  randomBytes,
  scrypt as deriveKey,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { AppError } from "../updates/types.ts";

const scrypt = promisify(deriveKey);

export function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function equalSecret(left: string, right: string) {
  return timingSafeEqual(
    Buffer.from(digest(left), "hex"),
    Buffer.from(digest(right), "hex"),
  );
}

export function randomToken() {
  return randomBytes(32).toString("hex");
}

export async function hashPassword(password: string) {
  if (password.length < 12 || password.length > 128)
    throw new AppError("Use a password of 12–128 characters.");
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, hash: string) {
  const [algorithm, salt, key] = hash.split("$");
  if (
    algorithm !== "scrypt" ||
    !/^[a-f0-9]{32}$/.test(salt ?? "") ||
    !/^[a-f0-9]{128}$/.test(key ?? "")
  )
    return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  return timingSafeEqual(actual, Buffer.from(key, "hex"));
}

// A fixed, non-user hash keeps unknown-user authentication on the same scrypt path.
export const dummyHash =
  "scrypt$00000000000000000000000000000000$" + "00".repeat(64);

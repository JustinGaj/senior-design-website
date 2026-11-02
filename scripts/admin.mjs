import { emitKeypressEvents } from "node:readline";
import { Store } from "../lib/db/store.ts";
import { hashPassword } from "../lib/auth/crypto.ts";
import { username } from "../lib/updates/validation.ts";

function hiddenPassword(prompt) {
  if (!process.stdin.isTTY || !process.stdout.isTTY)
    throw new Error(
      "Use an interactive terminal; passwords are never accepted in command-line arguments.",
    );
  process.stdout.write(prompt);
  const input = process.stdin;
  const wasRaw = Boolean(input.isRaw);
  emitKeypressEvents(input);
  input.setRawMode(true);
  input.resume();
  return new Promise((resolve, reject) => {
    let password = "";
    function finish(error) {
      input.removeListener("keypress", onKey);
      input.setRawMode(wasRaw);
      input.pause();
      process.stdout.write("\n");
      if (error) reject(error);
      else resolve(password);
    }
    function onKey(character, key = {}) {
      if (key.ctrl && (key.name === "c" || key.name === "d"))
        return finish(new Error("Cancelled."));
      if (key.name === "return" || key.name === "enter") return finish();
      if (key.name === "backspace") {
        password = Array.from(password).slice(0, -1).join("");
      } else if (
        character &&
        !key.ctrl &&
        !key.meta &&
        !character.includes("\x1b")
      ) {
        password += character;
      }
      // Raw mode disables terminal echo; no password characters are written to stdout.
    }
    input.on("keypress", onKey);
  });
}

let store;
try {
  const [command, name, ...extra] = process.argv.slice(2);
  if (extra.length || !["create", "reset", "revoke"].includes(command))
    throw new Error(
      "Usage: admin:create USERNAME, admin:reset-password USERNAME, or admin:revoke-sessions",
    );
  if (command === "revoke") {
    if (name) throw new Error("admin:revoke-sessions takes no arguments.");
    store = new Store();
    store.revokeAllSessions();
    console.log("All administrator sessions revoked.");
  } else {
    const user = username(name);
    const password = await hiddenPassword("Password (12–128 characters): ");
    const confirmation = await hiddenPassword("Repeat password: ");
    if (password !== confirmation) throw new Error("Passwords do not match.");
    const hash = await hashPassword(password);
    store = new Store();
    if (command === "create") store.createUser(user, hash);
    else store.resetPassword(user, hash);
    console.log(
      command === "create"
        ? "Administrator created."
        : "Password changed and existing sessions revoked.",
    );
  }
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Administrator operation failed.",
  );
  process.exitCode = 1;
} finally {
  store?.close();
}

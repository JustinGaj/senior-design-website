"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton({ csrfToken }: { csrfToken: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        headers: { "X-CSRF-Token": csrfToken },
      });
      if (!response.ok && response.status !== 401)
        throw new Error("Unable to sign out. Try again.");
      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign out.");
      setBusy(false);
    }
  }
  return (
    <div>
      <button className="admin-button" onClick={logout} disabled={busy}>
        {busy ? "Signing out…" : "Sign out"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

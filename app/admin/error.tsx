"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className="card admin-empty">
      <h1>The editor is temporarily unavailable.</h1>
      <p>Your saved posts have not been changed.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Update = {
  date?: string;
  title: string;
  category: string;
  summary: string;
  image: "engineering" | "concept" | "flight";
  url: string;
  id: string;
};

export function UpdatesFeed({ limit }: { limit?: number } = {}) {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const visibleUpdates = limit ? updates.slice(0, limit) : updates;

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/updates", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load project updates");
        return response.json();
      })
      .then((data: { updates?: Update[]; source?: string }) => {
        setUpdates(data.updates ?? []);
        setStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setUpdates([]);
          setStatus("error");
        }
      });
    return () => controller.abort();
  }, []);

  return (
    <section id="updates" className="dark-section updates-section">
      <div className="wrap">
        <div className="section-head updates-heading">
          <div>
            <div className="eyebrow">Project log</div>
            <h2>Build notes from the team.</h2>
            <p className="lead">
              Short progress updates every two weeks, with design decisions and
              test learnings.
            </p>
          </div>
          <div className="cadence">
            <span className="pulse" /> BI-WEEKLY UPDATES
          </div>
        </div>
        {visibleUpdates.length > 0 ? (
          <div className="updates-grid">
            {visibleUpdates.map((update, index) => (
              <article className="update-card" key={update.id}>
                <div className={`update-art art-${update.image}`}>
                  <span>{update.category}</span>
                  <i>{String(index + 1).padStart(2, "0")}</i>
                  <b aria-hidden="true">
                    {update.image === "flight"
                      ? "↗"
                      : update.image === "concept"
                        ? "◇"
                        : "⌖"}
                  </b>
                </div>
                <div className="update-copy">
                  <small>
                    {update.date
                      ? new Date(update.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          timeZone: "UTC",
                        })
                      : "PROJECT LOG"}
                  </small>
                  <h3>
                    <Link href={update.url}>{update.title}</Link>
                  </h3>
                  <p>{update.summary}</p>
                  <Link href={update.url}>Read update ↗</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="updates-empty">
            <div className="empty-symbol" aria-hidden="true">
              ↻
            </div>
            <h3>
              {status === "loading"
                ? "Loading project updates…"
                : status === "error"
                  ? "Project updates are temporarily unavailable."
                  : "No new updates from the team yet."}
            </h3>
            <p>New notes will appear here as the team shares progress.</p>
          </div>
        )}
        <div className="feed-note">
          Updates source: project team <span>·</span> Maintained every two weeks
        </div>
        {limit && visibleUpdates.length > 0 && (
          <a className="button ghost updates-more" href="#updates">
            View all project updates <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </section>
  );
}

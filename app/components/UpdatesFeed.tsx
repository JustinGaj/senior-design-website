import { projectUpdates } from "../data/project-updates";

export function UpdatesFeed({ limit }: { limit?: number } = {}) {
  const isPreview = limit !== undefined;
  const visibleUpdates = isPreview
    ? projectUpdates.slice(0, limit)
    : projectUpdates;

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
        <div
          className={`updates-grid${isPreview ? " updates-grid-preview" : ""}`}
        >
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
                  <time dateTime={update.date}>
                    {new Date(update.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </time>
                </small>
                <h3>{update.title}</h3>
                <p>{update.summary}</p>
                {!isPreview && (
                  <div className="update-detail">
                    {update.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
        <div className="feed-note">
          Updates from the project team
        </div>
        {isPreview && (
          <a className="button ghost updates-more" href="#updates">
            View all project updates <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </section>
  );
}

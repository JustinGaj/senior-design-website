"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type {
  Post,
  PostDetail,
  PostImage,
  PostStatus,
} from "../../../../lib/updates/types";

function fields(post: Post) {
  return {
    title: post.title,
    summary: post.summary,
    body: post.body,
    category: post.category,
    image: post.image,
    href: post.href ?? "",
    status: post.status,
  };
}

export function PostEditor({
  initial,
  csrfToken,
}: {
  initial: PostDetail;
  csrfToken: string;
}) {
  const [detail, setDetail] = useState(initial);
  const [draft, setDraft] = useState(fields(initial.post));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const dirty = JSON.stringify(draft) !== JSON.stringify(fields(detail.post));

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/posts/${detail.post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ ...draft, version: detail.post.version }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to save the post.");
      setDetail(result);
      setDraft(fields(result.post));
      setMessage(
        result.post.status === "published"
          ? "Changes saved and published."
          : "Changes saved. This post is hidden from the public log.",
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to save the post.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Link className="text-link" href="/admin">
        ← All updates
      </Link>
      <div className="admin-heading">
        <div>
          <div className="eyebrow">
            {detail.post.periodStart} → {detail.post.periodEnd} (end exclusive)
          </div>
          <h1>Edit project update</h1>
          <p className="lead">
            Manual changes are preserved when the automation retries.
          </p>
        </div>
        <span className={`status-badge ${detail.post.status}`}>
          {detail.post.status}
        </span>
      </div>
      <form className="admin-form card editor-card" onSubmit={save}>
        <fieldset disabled={busy}>
          <label>
            Title
            <input
              value={draft.title}
              maxLength={140}
              required
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </label>
          <label>
            Card summary
            <textarea
              value={draft.summary}
              maxLength={600}
              required
              rows={3}
              onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
            />
          </label>
          <label>
            Post body
            <textarea
              value={draft.body}
              maxLength={30000}
              required
              rows={14}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            />
            <small>Plain text. Separate paragraphs with a blank line.</small>
          </label>
          <div className="editor-fields">
            <label>
              Category
              <input
                value={draft.category}
                maxLength={48}
                required
                onChange={(e) =>
                  setDraft({ ...draft, category: e.target.value })
                }
              />
            </label>
            <label>
              Card illustration
              <select
                value={draft.image}
                onChange={(e) =>
                  setDraft({ ...draft, image: e.target.value as PostImage })
                }
              >
                <option value="engineering">Engineering</option>
                <option value="concept">Concept</option>
                <option value="flight">Flight</option>
              </select>
            </label>
            <label>
              Visibility
              <select
                value={draft.status}
                onChange={(e) =>
                  setDraft({ ...draft, status: e.target.value as PostStatus })
                }
              >
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </label>
          </div>
          <label>
            Related project link (optional)
            <input
              type="url"
              value={draft.href}
              maxLength={2048}
              onChange={(e) => setDraft({ ...draft, href: e.target.value })}
            />
          </label>
          <div className="editor-actions">
            <button className="button primary" type="submit" disabled={!dirty}>
              {busy ? "Saving…" : "Save changes"}
            </button>
            {detail.post.status === "published" && (
              <Link
                className="text-link"
                href={`/updates/${detail.post.id}`}
                target="_blank"
              >
                View published post ↗
              </Link>
            )}
            <span>
              Revision {detail.post.version}
              {dirty ? " · Unsaved changes" : ""}
            </span>
          </div>
        </fieldset>
        {message && (
          <p className="admin-success" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}
      </form>
      <div className="admin-evidence">
        <details className="disclosure">
          <summary>
            <span>Revision history</span>
            <small>{detail.revisions.length} saved revisions</small>
          </summary>
          <div className="disclosure-body">
            {detail.revisions.map((revision) => (
              <details className="revision-item" key={revision.version}>
                <summary>
                  Revision {revision.version} · {revision.actor} ·{" "}
                  {new Date(revision.createdAt).toLocaleString()}
                </summary>
                <p>
                  <b>{revision.snapshot.title}</b> · {revision.snapshot.status}
                </p>
                <p>{revision.snapshot.summary}</p>
                <pre>{revision.snapshot.body}</pre>
                <button
                  className="admin-button"
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setDraft(fields(revision.snapshot));
                    setMessage(
                      "Revision loaded into the editor. Save changes to create a new revision.",
                    );
                  }}
                >
                  Load into editor
                </button>
              </details>
            ))}
          </div>
        </details>
        <details className="disclosure">
          <summary>
            <span>Original generated content</span>
            <small>Preserved before team edits</small>
          </summary>
          <div className="disclosure-body">
            <h2>{detail.originalGeneratedContent.title}</h2>
            <p>{detail.originalGeneratedContent.summary}</p>
            <pre>{detail.originalGeneratedContent.body}</pre>
          </div>
        </details>
        <details className="disclosure">
          <summary>
            <span>Supporting Plane activity</span>
            <small>{detail.activities.length} records</small>
          </summary>
          <div className="disclosure-body">
            {detail.activities.length ? (
              detail.activities.map((activity) => (
                <details className="revision-item" key={activity.id}>
                  <summary>
                    {activity.workItemId} ·{" "}
                    {activity.field || activity.verb || "Activity"} ·{" "}
                    {new Date(activity.createdAt).toLocaleString()}
                  </summary>
                  <pre>{JSON.stringify(activity, null, 2)}</pre>
                </details>
              ))
            ) : (
              <p>
                No activity records were supplied for this reporting period.
              </p>
            )}
          </div>
        </details>
      </div>
    </>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin } from "../../lib/auth/admin.ts";
import { getStore } from "../../lib/db/store.ts";
import { LogoutButton } from "./LogoutButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await currentAdmin();
  if (!session) redirect("/admin/login");
  const posts = getStore().listPosts(false);
  return (
    <>
      <div className="admin-heading">
        <div>
          <div className="eyebrow">Signed in as {session.username}</div>
          <h1>Project updates</h1>
          <p className="lead">Published posts and saved reporting periods.</p>
        </div>
        <LogoutButton csrfToken={session.csrfToken} />
      </div>
      {posts.length ? (
        <div className="admin-post-list">
          {posts.map((post) => (
            <Link
              className="card admin-post-item"
              href={`/admin/posts/${post.id}`}
              key={post.id}
            >
              <div>
                <small>
                  {post.periodStart} → {post.periodEnd} (end exclusive)
                </small>
                <h2>{post.title}</h2>
                <p>{post.summary}</p>
              </div>
              <div className="admin-post-state">
                <span className={`status-badge ${post.status}`}>
                  {post.status}
                </span>
                <small>
                  Revision {post.version}
                  {post.manuallyEdited ? " · Team edited" : " · Generated"}
                </small>
                <b>Edit post ↗</b>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card admin-empty">
          <h2>No posts yet.</h2>
          <p>
            Published updates will appear here when the automation submits its
            first reporting period.
          </p>
        </div>
      )}
    </>
  );
}

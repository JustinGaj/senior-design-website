import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore } from "../../../lib/db/store.ts";
import { publicUpdateLink } from "../../../lib/updates/public-link.ts";
import "./post.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = getStore().getPost(id, true);
  return post
    ? { title: `${post.title} | Eagle Eye`, description: post.summary }
    : { title: "Update not found | Eagle Eye", robots: { index: false } };
}

export default async function UpdatePage({ params }: Props) {
  const { id } = await params;
  const post = getStore().getPost(id, true);
  if (!post) notFound();
  const relatedLink = publicUpdateLink(post.href);
  const periodDates = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const periodLabel = periodDates.formatRange(
    new Date(post.periodStart + "T00:00:00Z"),
    new Date(Date.parse(post.periodEnd + "T00:00:00Z") - 86400000),
  );
  return (
    <>
      <header className="post-nav">
        <Link className="brand" href="/">
          EAGLE EYE
        </Link>
        <Link className="text-link" href="/#updates">
          All project updates ↗
        </Link>
      </header>
      <main className="wrap post-page">
        <article>
          <div className="eyebrow">{post.category} · Project log</div>
          <h1>{post.title}</h1>
          <p className="post-dates">
            Published{" "}
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: "UTC",
            })}{" "}
            · Reporting period {periodLabel}
          </p>
          <p className="lead">{post.summary}</p>
          <div className="post-body">{post.body}</div>
          {relatedLink && (
            <a
              className="text-link"
              href={relatedLink}
              target="_blank"
              rel="noreferrer"
            >
              Related project item ↗
            </a>
          )}
        </article>
      </main>
    </>
  );
}

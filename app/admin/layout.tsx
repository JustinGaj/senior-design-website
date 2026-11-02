import type { Metadata } from "next";
import Link from "next/link";
import "./admin.css";

export const metadata: Metadata = {
  title: "Project log administration | Eagle Eye",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="editor-nav">
        <Link className="brand" href="/">
          EAGLE EYE
        </Link>
        <Link className="text-link" href="/#updates">
          View project log ↗
        </Link>
      </header>
      <main className="wrap admin-page">{children}</main>
    </>
  );
}

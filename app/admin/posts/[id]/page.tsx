import { notFound, redirect } from "next/navigation";
import { currentAdmin } from "../../../../lib/auth/admin.ts";
import { getStore } from "../../../../lib/db/store.ts";
import { PostEditor } from "./PostEditor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await currentAdmin();
  if (!session) redirect("/admin/login");
  const { id } = await params;
  const detail = getStore().detail(id);
  if (!detail) notFound();
  return <PostEditor initial={detail} csrfToken={session.csrfToken} />;
}

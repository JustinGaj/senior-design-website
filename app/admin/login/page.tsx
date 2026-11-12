import { redirect } from "next/navigation";
import { currentAdmin } from "../../../lib/auth/admin.ts";
import { LoginForm } from "./LoginForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await currentAdmin()) redirect("/admin");
  return (
    <div className="admin-login card">
      <div className="eyebrow">Team access</div>
      <h1>Project log editor</h1>
      <p className="lead">Sign in to manage published updates.</p>
      <LoginForm />
    </div>
  );
}

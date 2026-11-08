import Link from "next/link";
import { ArrowLeft, ShieldCheck, Database } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { DEMO_MODE, isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  const configured = isSupabaseConfigured();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-5 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to the website
        </Link>

        <div className="surface p-7 sm:p-8">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold">Administrator sign in</h1>
          <p className="mt-1.5 text-[13.5px] leading-6 text-muted-foreground">
            This area is private. Every administrator has identical permissions.
          </p>

          {!configured && (
            <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="flex items-center gap-2 text-[13px] font-medium text-amber-700 dark:text-amber-400">
                <Database className="size-4" /> Supabase is not connected
              </p>
              <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">
                Add <code className="rounded bg-muted px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="rounded bg-muted px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
                <code className="rounded bg-muted px-1">.env.local</code>, run the SQL in{" "}
                <code className="rounded bg-muted px-1">supabase/migrations</code>, then restart.
              </p>
            </div>
          )}

          <div className="mt-6">
            <LoginForm demoMode={DEMO_MODE} />
          </div>

          <p className="mt-6 border-t border-border pt-4 text-[11.5px] leading-5 text-muted-foreground">
            There is no public registration. New administrators are added by invitation from an
            existing administrator, and access is verified on the server plus enforced by database
            Row Level Security.
          </p>
        </div>
      </div>
    </div>
  );
}

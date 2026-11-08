import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, LogOut } from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { signOutAction } from "@/app/admin/actions/auth";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    if (!isSupabaseConfigured()) {
      redirect("/admin/login");
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

    if (!user) redirect("/admin/login");

    // A signed-in account without an admins row may still have a pending
    // invitation for its verified email address.
    const { data: accepted } = await supabase.rpc("accept_pending_admin_invite");
    if (accepted === true) redirect("/admin");

    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-5 py-12">
        <div className="surface w-full max-w-md p-8 text-center">
          <span className="mx-auto inline-flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <ShieldAlert className="size-5" />
          </span>
          <h1 className="mt-4 text-xl font-semibold">This account has no admin access</h1>
          <p className="mt-2 text-[13.5px] leading-6 text-muted-foreground">
            You are signed in as <span className="font-medium text-foreground">{user.email}</span>,
            but this email has not been invited as an administrator. Ask an existing administrator
            to send an invitation.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </form>
            <Link href="/" className="text-[12.5px] text-muted-foreground hover:text-foreground">
              Return to the public website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <AdminShell admin={admin}>{children}</AdminShell>;
}

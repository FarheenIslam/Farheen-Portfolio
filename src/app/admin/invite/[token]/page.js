import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, ShieldX, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentAdmin } from "@/lib/auth";
import { InviteAcceptForm } from "@/components/admin/invite-accept-form";

export const metadata = {
  title: "Accept administrator invitation",
  robots: { index: false, follow: false },
};

export default async function AcceptInvitePage({ params }) {
  const { token } = await params;

  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  let invite = null;
  let state = "invalid";

  if (!isSupabaseConfigured()) {
    state = "unconfigured";
  } else {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_admin_invite", { p_token: token });

    if (!error && Array.isArray(data) && data.length > 0) {
      invite = data[0];
      if (invite.accepted_at) state = "accepted";
      else if (new Date(invite.expires_at) < new Date()) state = "expired";
      else state = "valid";
    }
  }

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
          {state === "valid" && invite ? (
            <>
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <ShieldCheck className="size-5" />
              </span>
              <h1 className="mt-4 text-2xl font-semibold">You have been invited</h1>
              <p className="mt-1.5 text-[13.5px] leading-6 text-muted-foreground">
                Create a password for <strong className="text-foreground">{invite.email}</strong> to
                become an administrator. All administrators have equal permissions.
              </p>
              <div className="mt-6">
                <InviteAcceptForm
                  email={invite.email}
                  fullName={invite.full_name || ""}
                  token={token}
                />
              </div>
            </>
          ) : (
            <>
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <ShieldX className="size-5" />
              </span>
              <h1 className="mt-4 text-xl font-semibold">
                {state === "expired"
                  ? "This invitation has expired"
                  : state === "accepted"
                    ? "This invitation was already used"
                    : state === "unconfigured"
                      ? "Supabase is not configured"
                      : "This invitation link is not valid"}
              </h1>
              <p className="mt-2 text-[13.5px] leading-6 text-muted-foreground">
                {state === "accepted"
                  ? "Sign in with the account you created. If you have not set a password yet, ask an administrator for a new invitation."
                  : state === "unconfigured"
                    ? "Add the Supabase environment variables to .env.local and restart the server, then open this link again."
                    : "Ask an existing administrator to create a new invitation for your email address."}
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <Link
                  href="/admin/login"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground"
                >
                  Go to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

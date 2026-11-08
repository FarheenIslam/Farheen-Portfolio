import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AdminsManager } from "@/components/admin/admins-manager";

export const metadata = {
  title: "Administrators · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminAdminsPage() {
  const admin = await requireAdmin();

  let admins = [];
  let invites = [];

  if (admin.demo || !isSupabaseConfigured()) {
    admins = [
      {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];
  } else {
    const supabase = await createClient();

    const [{ data: adminRows }, { data: inviteRows }] = await Promise.all([
      supabase.from("admins").select("*").order("created_at", { ascending: true }),
      supabase
        .from("admin_invites")
        .select("id, email, full_name, token, expires_at, created_at")
        .is("accepted_at", null)
        .order("created_at", { ascending: false }),
    ]);

    admins = adminRows ?? [];
    invites = inviteRows ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Administrators</h2>
        <p className="mt-1 max-w-2xl text-[13px] leading-6 text-muted-foreground">
          All administrators have exactly equal permissions. There is no super admin and no role
          hierarchy.
        </p>
      </div>

      <AdminsManager admins={admins} invites={invites} currentAdminId={admin.id} />
    </div>
  );
}

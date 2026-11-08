import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LogsTable } from "@/components/admin/logs-table";

export const metadata = {
  title: "Activity logs · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLogsPage() {
  const admin = await requireAdmin();
  let logs = [];

  if (!admin.demo && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("admin_activity_logs")
      .select("id, action, entity, entity_id, admin_email, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    logs = data ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Activity logs</h2>
        <p className="mt-1 max-w-2xl text-[13px] leading-6 text-muted-foreground">
          Append-only audit trail of administrator actions. Logs cannot be edited or deleted from the
          app, and never contain passwords, tokens or secret keys.
        </p>
      </div>

      <LogsTable logs={logs} />
    </div>
  );
}

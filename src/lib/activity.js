import { createClient } from "@/lib/supabase/server";

/**
 * Append an entry to admin_activity_logs.
 * Never pass secrets, passwords or tokens in `metadata`.
 */
export async function logActivity(admin, { action, entity = null, entityId = null, metadata = {} }) {
  if (!admin || admin.demo) return;

  try {
    const supabase = await createClient();
    if (!supabase) return;

    await supabase.from("admin_activity_logs").insert({
      admin_id: admin.id,
      admin_email: admin.email ?? null,
      action,
      entity,
      entity_id: entityId ? String(entityId) : null,
      metadata,
    });
  } catch (error) {
    // Logging must never break the user-facing operation.
    console.warn(`[activity] ${error.message}`);
  }
}

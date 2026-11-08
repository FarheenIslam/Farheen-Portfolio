import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEMO_MODE, isSupabaseConfigured } from "@/lib/supabase/config";

export const DEMO_COOKIE = "portfolio_demo_admin";

/**
 * Resolve the signed-in administrator on the server.
 *
 * Admin rights live in public.admins, not in the auth user's metadata, so a
 * normal Supabase account has zero privileges unless an active admins row maps
 * to it. Every admin layout, page and server action calls this function.
 */
export const getCurrentAdmin = cache(async () => {
  if (DEMO_MODE) {
    const store = await cookies();
    if (store.get(DEMO_COOKIE)?.value === "1") {
      return {
        id: "demo-admin",
        user_id: "demo-user",
        email: "demo@local.dev",
        full_name: "Demo Administrator",
        is_active: true,
        demo: true,
      };
    }
    return null;
  }

  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data: admin, error } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !admin) return null;

  return { ...admin, email: admin.email || user.email, user };
});

/** Use inside admin layouts/pages. Redirects to the login screen when needed. */
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** For server actions: throw instead of redirect. */
export async function assertAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("Not authorised. Please sign in again.");
  }
  return admin;
}

/** Count of active admins, used to protect the last active administrator. */
export async function countActiveAdmins(supabase) {
  const { count, error } = await supabase
    .from("admins")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);
  if (error) return null;
  return count ?? 0;
}

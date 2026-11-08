"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEMO_MODE, isSupabaseConfigured } from "@/lib/supabase/config";
import { DEMO_COOKIE } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function signInAction(_previousState, formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and restart the server.",
    };
  }

  try {
    const supabase = await createClient();
    if (!supabase) throw new Error("Supabase client unavailable");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    // If a valid invitation exists for this verified email, accept it now so
    // the new administrator can start working immediately.
    const { data: accepted } = await supabase.rpc("accept_pending_admin_invite");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: admin } = await supabase
        .from("admins")
        .select("id, email")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (admin) {
        await logActivity(admin, { action: "login", entity: "auth" });
      }
    }

    if (accepted === false) {
      return {
        error:
          "This account is not authorised yet. Ask an existing administrator to invite this email address.",
      };
    }
  } catch (error) {
    return { error: error.message || "Sign in failed. Please try again." };
  }

  redirect("/admin");
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase?.auth.signOut();
  }

  const store = await cookies();
  store.delete(DEMO_COOKIE);
  redirect("/admin/login");
}

/** Local-only demo access so the dashboard can be reviewed without Supabase. */
export async function enterDemoAction() {
  if (!DEMO_MODE) {
    redirect("/admin/login");
  }

  const store = await cookies();
  store.set(DEMO_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/admin");
}

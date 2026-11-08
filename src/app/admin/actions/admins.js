"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { assertAdmin, countActiveAdmins } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

const DEMO_ERROR = {
  ok: false,
  message: "Demo mode: connect Supabase to manage administrators.",
};

const inviteSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  full_name: z.string().trim().max(120).optional().default(""),
});

function friendlyError(error) {
  return error?.message || "Something went wrong. Please try again.";
}

export async function inviteAdminAction(_previousState, formData) {
  try {
    const admin = await assertAdmin();
    if (admin.demo || !isSupabaseConfigured()) return DEMO_ERROR;

    const parsed = inviteSchema.safeParse({
      email: formData.get("email"),
      full_name: formData.get("full_name"),
    });

    if (!parsed.success) {
      return {
        ok: false,
        errors: { email: parsed.error.issues[0]?.message },
        message: "Enter a valid email address.",
      };
    }

    const email = parsed.data.email.toLowerCase();
    const supabase = await createClient();

    const { data: existingAdmin } = await supabase
      .from("admins")
      .select("id, is_active")
      .ilike("email", email)
      .maybeSingle();

    if (existingAdmin) {
      return {
        ok: false,
        message: existingAdmin.is_active
          ? "That email is already an active administrator."
          : "That email already has an administrator account. Reactivate it from the list below.",
      };
    }

    const { data: existingInvite } = await supabase
      .from("admin_invites")
      .select("id")
      .ilike("email", email)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (existingInvite) {
      return { ok: false, message: "There is already a pending invitation for that email." };
    }

    const { data: invite, error } = await supabase
      .from("admin_invites")
      .insert({
        email,
        full_name: parsed.data.full_name || null,
        invited_by: admin.id,
      })
      .select("id, token, email, expires_at")
      .single();

    if (error) throw error;

    await logActivity(admin, {
      action: "invite_admin",
      entity: "admin_invites",
      entityId: invite.id,
      metadata: { email },
    });

    revalidatePath("/admin/admins");
    return {
      ok: true,
      message: `Invitation created for ${email}.`,
      invite: { token: invite.token, email: invite.email, expiresAt: invite.expires_at },
    };
  } catch (error) {
    return { ok: false, message: friendlyError(error) };
  }
}

export async function setAdminActiveAction(id, isActive) {
  try {
    const admin = await assertAdmin();
    if (admin.demo || !isSupabaseConfigured()) return DEMO_ERROR;

    if (admin.id === id && !isActive) {
      return { ok: false, message: "You cannot deactivate your own account." };
    }

    const supabase = await createClient();

    if (!isActive) {
      const activeCount = await countActiveAdmins(supabase);
      if (activeCount !== null && activeCount <= 1) {
        return { ok: false, message: "At least one active administrator must remain." };
      }
    }

    const { error } = await supabase
      .from("admins")
      .update({ is_active: Boolean(isActive) })
      .eq("id", id);
    if (error) throw error;

    await logActivity(admin, {
      action: isActive ? "activate_admin" : "deactivate_admin",
      entity: "admins",
      entityId: id,
    });

    revalidatePath("/admin/admins");
    return {
      ok: true,
      message: isActive ? "Administrator reactivated." : "Administrator deactivated.",
    };
  } catch (error) {
    return { ok: false, message: friendlyError(error) };
  }
}

export async function removeAdminAction(id) {
  try {
    const admin = await assertAdmin();
    if (admin.demo || !isSupabaseConfigured()) return DEMO_ERROR;

    if (admin.id === id) {
      return {
        ok: false,
        message: "You cannot remove your own administrator account. Ask another admin instead.",
      };
    }

    const supabase = await createClient();
    const activeCount = await countActiveAdmins(supabase);
    if (activeCount !== null && activeCount <= 1) {
      return { ok: false, message: "At least one active administrator must remain." };
    }

    const { error } = await supabase.from("admins").delete().eq("id", id);
    if (error) throw error;

    await logActivity(admin, { action: "remove_admin", entity: "admins", entityId: id });

    revalidatePath("/admin/admins");
    return { ok: true, message: "Administrator removed. Their login may still exist in Supabase Auth." };
  } catch (error) {
    return { ok: false, message: friendlyError(error) };
  }
}

export async function revokeInviteAction(id) {
  try {
    const admin = await assertAdmin();
    if (admin.demo || !isSupabaseConfigured()) return DEMO_ERROR;

    const supabase = await createClient();
    const { error } = await supabase.from("admin_invites").delete().eq("id", id);
    if (error) throw error;

    await logActivity(admin, { action: "revoke_invite", entity: "admin_invites", entityId: id });

    revalidatePath("/admin/admins");
    return { ok: true, message: "Invitation revoked." };
  } catch (error) {
    return { ok: false, message: friendlyError(error) };
  }
}

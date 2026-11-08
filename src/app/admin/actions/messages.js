"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { assertAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

const DEMO_ERROR = { ok: false, message: "Demo mode: connect Supabase to manage messages." };

function friendlyError(error) {
  return error?.message || "Something went wrong. Please try again.";
}

export async function setMessageFlagsAction(id, patch) {
  try {
    const admin = await assertAdmin();
    if (admin.demo || !isSupabaseConfigured()) return DEMO_ERROR;

    const allowed = {};
    if (typeof patch.is_read === "boolean") allowed.is_read = patch.is_read;
    if (typeof patch.is_archived === "boolean") allowed.is_archived = patch.is_archived;
    if (Object.keys(allowed).length === 0) {
      return { ok: false, message: "Nothing to update." };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").update(allowed).eq("id", id);
    if (error) throw error;

    await logActivity(admin, {
      action: allowed.is_archived === true ? "archive_message" : "update_message",
      entity: "contact_messages",
      entityId: id,
      metadata: allowed,
    });

    revalidatePath("/admin/messages");
    revalidatePath("/admin");
    return { ok: true, message: "Message updated." };
  } catch (error) {
    return { ok: false, message: friendlyError(error) };
  }
}

export async function deleteMessageAction(id) {
  try {
    const admin = await assertAdmin();
    if (admin.demo || !isSupabaseConfigured()) return DEMO_ERROR;

    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) throw error;

    await logActivity(admin, {
      action: "delete_message",
      entity: "contact_messages",
      entityId: id,
    });

    revalidatePath("/admin/messages");
    revalidatePath("/admin");
    return { ok: true, message: "Message deleted." };
  } catch (error) {
    return { ok: false, message: friendlyError(error) };
  }
}

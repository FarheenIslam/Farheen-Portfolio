"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { assertAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function deleteMediaAction(id) {
  try {
    const admin = await assertAdmin();
    if (admin.demo || !isSupabaseConfigured()) {
      return { ok: false, message: "Demo mode: connect Supabase to manage files." };
    }

    const supabase = await createClient();

    const { data: asset, error: fetchError } = await supabase
      .from("media_assets")
      .select("id, bucket, path")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!asset) return { ok: false, message: "That file no longer exists." };

    const { error: storageError } = await supabase.storage.from(asset.bucket).remove([asset.path]);
    if (storageError) throw storageError;

    const { error } = await supabase.from("media_assets").delete().eq("id", id);
    if (error) throw error;

    await logActivity(admin, {
      action: "delete_file",
      entity: "storage",
      entityId: asset.path,
      metadata: { bucket: asset.bucket },
    });

    revalidatePath("/admin/media");
    return { ok: true, message: "File deleted." };
  } catch (error) {
    return { ok: false, message: error?.message || "Could not delete the file." };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { assertAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

const settingsSchema = z.object({
  site_title: z.string().trim().min(1).max(120),
  site_tagline: z.string().trim().max(200).optional().default(""),
  seo_description: z.string().trim().max(400).optional().default(""),
  contact_intro: z.string().trim().max(600).optional().default(""),
  footer_note: z.string().trim().max(200).optional().default(""),
  show_design_gallery: z.boolean(),
});

export async function saveSettingsAction(_previousState, formData) {
  try {
    const admin = await assertAdmin();
    if (admin.demo || !isSupabaseConfigured()) {
      return { ok: false, message: "Demo mode: connect Supabase to save settings." };
    }

    const parsed = settingsSchema.safeParse({
      site_title: formData.get("site_title"),
      site_tagline: formData.get("site_tagline"),
      seo_description: formData.get("seo_description"),
      contact_intro: formData.get("contact_intro"),
      footer_note: formData.get("footer_note"),
      show_design_gallery: formData.get("show_design_gallery") === "true",
    });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message || "Please check the fields." };
    }

    const supabase = await createClient();
    const rows = Object.entries(parsed.data).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) throw error;

    await logActivity(admin, {
      action: "update_settings",
      entity: "site_settings",
      metadata: { keys: Object.keys(parsed.data) },
    });

    revalidatePath("/", "layout");

    return { ok: true, message: "Website settings saved." };
  } catch (error) {
    return { ok: false, message: error?.message || "Could not save settings." };
  }
}

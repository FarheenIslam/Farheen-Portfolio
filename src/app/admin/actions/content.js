"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { assertAdmin } from "@/lib/auth";
import { getResource } from "@/lib/resources";
import { formDataToValues, validateResource } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

const DEMO_ERROR = {
  ok: false,
  message: "Demo mode: connect Supabase and sign in to save changes.",
};

function revalidateAll() {
  revalidatePath("/", "layout");
}

function friendlyError(error) {
  if (error?.code === "23505") {
    return "That URL slug is already used by another item. Choose a different one.";
  }
  if (error?.code === "42501") {
    return "Your account is not allowed to perform this action. Sign in again as an administrator.";
  }
  return error?.message || "Something went wrong. Please try again.";
}

function parseGallery(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.url === "string" && item.url.trim())
      .map((item, index) => ({
        url: item.url.trim(),
        caption: item.caption ? String(item.caption).slice(0, 300) : null,
        sort_order: index,
      }));
  } catch {
    return [];
  }
}

export async function saveResourceAction(_previousState, formData) {
  try {
    const admin = await assertAdmin();
    if (admin.demo || !isSupabaseConfigured()) return DEMO_ERROR;

    const resourceKey = String(formData.get("__resource") || "");
    const resource = getResource(resourceKey);
    const recordId = String(formData.get("id") || "") || null;

    const values = formDataToValues(formData);
    const { data, errors } = validateResource(resource, values);

    if (errors) {
      return { ok: false, errors, message: "Please fix the highlighted fields." };
    }

    const supabase = await createClient();
    if (!supabase) return DEMO_ERROR;

    let savedId = recordId;

    if (resource.singleton) {
      if (recordId) {
        const { error } = await supabase
          .from(resource.table)
          .update(data)
          .eq("id", recordId);
        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase
          .from(resource.table)
          .insert(data)
          .select("id")
          .single();
        if (error) throw error;
        savedId = inserted.id;
      }
    } else if (recordId) {
      const { error } = await supabase.from(resource.table).update(data).eq("id", recordId);
      if (error) throw error;
    } else {
      const { data: inserted, error } = await supabase
        .from(resource.table)
        .insert(data)
        .select("id")
        .single();
      if (error) throw error;
      savedId = inserted.id;
    }

    // Sync gallery child rows.
    if (resource.gallery && savedId) {
      const gallery = parseGallery(formData.get("gallery"));
      const { error: deleteError } = await supabase
        .from(resource.gallery.table)
        .delete()
        .eq(resource.gallery.foreignKey, savedId);
      if (deleteError) throw deleteError;

      if (gallery.length > 0) {
        const rows = gallery.map((item) => ({
          [resource.gallery.foreignKey]: savedId,
          ...item,
        }));
        const { error: insertError } = await supabase
          .from(resource.gallery.table)
          .insert(rows);
        if (insertError) throw insertError;
      }
    }

    await logActivity(admin, {
      action: recordId ? "update" : "create",
      entity: resource.table,
      entityId: savedId,
      metadata: {
        title: data.title || data.full_name || data.institution || data.name || null,
        published: data.is_published ?? null,
      },
    });

    revalidateAll();

    return {
      ok: true,
      id: savedId,
      message: recordId ? `${resource.singular} updated.` : `${resource.singular} created.`,
    };
  } catch (error) {
    return { ok: false, message: friendlyError(error) };
  }
}

export async function deleteResourceAction(resourceKey, id) {
  try {
    const admin = await assertAdmin();
    if (admin.demo || !isSupabaseConfigured()) return DEMO_ERROR;

    const resource = getResource(resourceKey);
    const supabase = await createClient();
    if (!supabase) return DEMO_ERROR;

    const { error } = await supabase.from(resource.table).delete().eq("id", id);
    if (error) throw error;

    await logActivity(admin, {
      action: "delete",
      entity: resource.table,
      entityId: id,
    });

    revalidateAll();
    return { ok: true, message: `${resource.singular} deleted.` };
  } catch (error) {
    return { ok: false, message: friendlyError(error) };
  }
}

export async function togglePublishedAction(resourceKey, id, nextValue) {
  try {
    const admin = await assertAdmin();
    if (admin.demo || !isSupabaseConfigured()) return DEMO_ERROR;

    const resource = getResource(resourceKey);
    const supabase = await createClient();
    if (!supabase) return DEMO_ERROR;

    const { error } = await supabase
      .from(resource.table)
      .update({ is_published: Boolean(nextValue) })
      .eq("id", id);
    if (error) throw error;

    await logActivity(admin, {
      action: nextValue ? "publish" : "unpublish",
      entity: resource.table,
      entityId: id,
    });

    revalidateAll();
    return {
      ok: true,
      message: nextValue ? "Published to the website." : "Moved back to draft.",
    };
  } catch (error) {
    return { ok: false, message: friendlyError(error) };
  }
}

/** Re-order helper used by the list view arrows. */
export async function moveResourceAction(resourceKey, id, direction) {
  try {
    const admin = await assertAdmin();
    if (admin.demo || !isSupabaseConfigured()) return DEMO_ERROR;

    const resource = getResource(resourceKey);
    const supabase = await createClient();
    if (!supabase) return DEMO_ERROR;

    const { data: rows, error } = await supabase
      .from(resource.table)
      .select("id, sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw error;

    const index = rows.findIndex((row) => row.id === id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= rows.length) {
      return { ok: true };
    }

    const current = rows[index];
    const target = rows[targetIndex];

    await supabase
      .from(resource.table)
      .update({ sort_order: target.sort_order ?? targetIndex })
      .eq("id", current.id);
    await supabase
      .from(resource.table)
      .update({ sort_order: current.sort_order ?? index })
      .eq("id", target.id);

    await logActivity(admin, {
      action: "reorder",
      entity: resource.table,
      entityId: id,
      metadata: { direction },
    });

    revalidateAll();
    return { ok: true, message: "Order updated." };
  } catch (error) {
    return { ok: false, message: friendlyError(error) };
  }
}

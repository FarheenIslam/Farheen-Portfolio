import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, STORAGE_BUCKETS } from "@/lib/supabase/config";
import { logActivity } from "@/lib/activity";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const DOCUMENT_TYPES = [...IMAGE_TYPES, "application/pdf"];

const BUCKETS = new Set(Object.values(STORAGE_BUCKETS));

export async function POST(request) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }
  if (admin.demo || !isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Demo mode: connect Supabase to upload files." },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const bucket = String(formData.get("bucket") || STORAGE_BUCKETS.images);
    const folder = slugify(String(formData.get("folder") || "general")) || "general";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }
    if (!BUCKETS.has(bucket)) {
      return NextResponse.json({ error: "Unknown storage bucket." }, { status: 400 });
    }

    const isImageBucket = bucket === STORAGE_BUCKETS.images;
    const allowed = isImageBucket ? IMAGE_TYPES : DOCUMENT_TYPES;
    const maxBytes = isImageBucket ? 5 * 1024 * 1024 : 10 * 1024 * 1024;

    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        {
          error: isImageBucket
            ? "Only JPG, PNG, WebP or GIF images can be uploaded here."
            : "Only PDF, JPG, PNG or WebP files can be uploaded here.",
        },
        { status: 415 }
      );
    }

    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File is too large. Maximum size is ${maxBytes / 1024 / 1024} MB.` },
        { status: 413 }
      );
    }

    const supabase = await createClient();
    if (!supabase) throw new Error("Supabase is not configured");

    const extension = (file.name.split(".").pop() || "bin").toLowerCase().slice(0, 8);
    const safeName = slugify(file.name.replace(/\.[^.]+$/, "")) || "file";
    const path = `${folder}/${crypto.randomUUID()}-${safeName}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) throw uploadError;

    let url = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

    // Private files are never served publicly - hand back a short-lived URL.
    if (bucket === STORAGE_BUCKETS.privateDocuments) {
      const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
      url = signed?.signedUrl ?? null;
    }

    await supabase.from("media_assets").insert({
      bucket,
      path,
      url,
      file_name: file.name.slice(0, 200),
      mime_type: file.type,
      size_bytes: file.size,
      uploaded_by: admin.id,
    });

    await logActivity(admin, {
      action: "upload",
      entity: "storage",
      entityId: path,
      metadata: { bucket, mime: file.type, size: file.size },
    });

    return NextResponse.json({ url, path, bucket, name: file.name });
  } catch (error) {
    console.error("[upload]", error);
    return NextResponse.json(
      { error: error.message || "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

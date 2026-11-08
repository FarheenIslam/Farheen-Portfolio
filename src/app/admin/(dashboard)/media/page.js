import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { MediaManager } from "@/components/admin/media-manager";

export const metadata = {
  title: "Media library · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminMediaPage() {
  const admin = await requireAdmin();
  let assets = [];

  if (!admin.demo && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("media_assets")
      .select("id, bucket, path, url, file_name, mime_type, size_bytes, created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    assets = data ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Media library</h2>
        <p className="mt-1 max-w-2xl text-[13px] leading-6 text-muted-foreground">
          Every uploaded file, with its bucket, size and public URL. Drag-free, simple and safe:
          uploads are validated by type and size on the server.
        </p>
      </div>

      <MediaManager assets={assets} />
    </div>
  );
}

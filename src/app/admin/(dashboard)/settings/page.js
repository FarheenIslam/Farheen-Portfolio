import { CheckCircle2, Circle, Database, FolderOpen, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/lib/data";
import { isSupabaseConfigured, STORAGE_BUCKETS } from "@/lib/supabase/config";
import { SettingsForm } from "@/components/admin/settings-form";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Website settings · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  const settings = await getSiteSettings();
  const configured = isSupabaseConfigured();

  const checklist = [
    {
      label: "Supabase environment variables set",
      done: configured,
      hint: "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    },
    {
      label: "Database migrations applied",
      done: configured,
      hint: "supabase/migrations/0001 → 0003 run in the SQL editor",
    },
    {
      label: "Seed content loaded",
      done: configured,
      hint: "supabase/seed.sql run once",
    },
    {
      label: "Storage buckets created",
      done: configured,
      hint: Object.values(STORAGE_BUCKETS).join(", "),
    },
    {
      label: "Signed in as a database administrator",
      done: !admin.demo,
      hint: "An active row in public.admins mapped to your auth user",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Website settings</h2>
        <p className="mt-1 max-w-2xl text-[13px] leading-6 text-muted-foreground">
          Global copy used across the public site and its metadata.
        </p>
      </div>

      <SettingsForm settings={settings} />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="surface p-5">
          <h3 className="flex items-center gap-2 text-[13.5px] font-semibold">
            <Database className="size-4 text-accent" /> Setup checklist
          </h3>
          <ul className="mt-3 space-y-2.5">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-start gap-2.5">
                {item.done ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
                )}
                <div>
                  <p className="text-[12.5px] font-medium">{item.label}</p>
                  <p className="text-[11.5px] leading-5 text-muted-foreground">{item.hint}</p>
                </div>
              </li>
            ))}
          </ul>
          {admin.demo && (
            <p className="mt-3 rounded-lg bg-amber-500/10 p-2.5 text-[11.5px] text-amber-700 dark:text-amber-400">
              You are in local demo mode. Anything you save here is intentionally disabled until
              Supabase is connected.
            </p>
          )}
        </div>

        <div className="space-y-5">
          <div className="surface p-5">
            <h3 className="flex items-center gap-2 text-[13.5px] font-semibold">
              <FolderOpen className="size-4 text-accent" /> Storage buckets
            </h3>
            <ul className="mt-3 space-y-2">
              <li className="flex items-center justify-between text-[12.5px]">
                <span className="font-mono">{STORAGE_BUCKETS.images}</span>
                <Badge variant="success">Public read</Badge>
              </li>
              <li className="flex items-center justify-between text-[12.5px]">
                <span className="font-mono">{STORAGE_BUCKETS.documents}</span>
                <Badge variant="success">Public read</Badge>
              </li>
              <li className="flex items-center justify-between text-[12.5px]">
                <span className="font-mono">{STORAGE_BUCKETS.privateDocuments}</span>
                <Badge variant="warning">Admins only</Badge>
              </li>
            </ul>
            <p className="mt-3 text-[11.5px] leading-5 text-muted-foreground">
              Limits: 5 MB for images, 10 MB for documents. JPG, PNG, WebP, GIF and PDF only.
            </p>
          </div>

          <div className="surface p-5">
            <h3 className="flex items-center gap-2 text-[13.5px] font-semibold">
              <ShieldCheck className="size-4 text-accent" /> Security
            </h3>
            <ul className="mt-3 space-y-1.5 text-[12px] leading-6 text-muted-foreground">
              <li>• Server-side admin checks on every page and action.</li>
              <li>• Row Level Security on every table.</li>
              <li>• Public read restricted to published rows.</li>
              <li>• No service-role key anywhere in the application.</li>
              <li>• Last active administrator is protected by a database trigger.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

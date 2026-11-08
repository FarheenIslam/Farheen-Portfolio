import Link from "next/link";
import {
  FolderKanban,
  BookOpen,
  Palette,
  Award,
  Inbox,
  ArrowRight,
  Database,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  defaultProjects,
  defaultPublications,
  defaultDesignWorks,
  defaultCertificates,
  defaultActivities,
  defaultEducation,
  defaultSkills,
  defaultExperiences,
} from "@/lib/defaults";

async function count(table) {
  const supabase = await createClient();
  if (!supabase) return { total: 0, published: 0 };

  const [{ count: total }, { count: published }] = await Promise.all([
    supabase.from(table).select("id", { count: "exact", head: true }),
    supabase.from(table).select("id", { count: "exact", head: true }).eq("is_published", true),
  ]);

  return { total: total ?? 0, published: published ?? 0 };
}

function StatCard({ href, label, icon: Icon, value, sub }) {
  return (
    <Link
      href={href}
      className="surface group flex flex-col justify-between p-5 transition-shadow hover:shadow-lift"
    >
      <div className="flex items-start justify-between">
        <span className="inline-flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Icon className="size-4" />
        </span>
        <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <div className="mt-4">
        <p className="font-serif text-2xl leading-none">{value}</p>
        <p className="mt-1.5 text-[12.5px] font-medium">{label}</p>
        {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
      </div>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const configured = isSupabaseConfigured();

  let stats;
  let unread = 0;
  let logs = [];

  if (admin.demo || !configured) {
    stats = {
      projects: { total: defaultProjects.length, published: defaultProjects.length },
      publications: { total: defaultPublications.length, published: defaultPublications.length },
      designs: { total: defaultDesignWorks.length, published: defaultDesignWorks.length },
      certificates: { total: defaultCertificates.length, published: defaultCertificates.length },
      activities: { total: defaultActivities.length, published: defaultActivities.length },
      education: { total: defaultEducation.length, published: defaultEducation.length },
      skills: { total: defaultSkills.length, published: defaultSkills.length },
      experiences: { total: defaultExperiences.length, published: defaultExperiences.length },
    };
  } else {
    const [
      projects,
      publications,
      designs,
      certificates,
      activities,
      education,
      skills,
      experiences,
    ] = await Promise.all([
      count("projects"),
      count("publications"),
      count("design_works"),
      count("certificates"),
      count("activities"),
      count("education"),
      count("skills"),
      count("experiences"),
    ]);

    stats = { projects, publications, designs, certificates, activities, education, skills, experiences };

    const supabase = await createClient();
    const [{ count: unreadCount }, { data: logRows }] = await Promise.all([
      supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false),
      supabase
        .from("admin_activity_logs")
        .select("id, action, entity, admin_email, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    unread = unreadCount ?? 0;
    logs = logRows ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          Welcome back{admin.full_name ? `, ${admin.full_name.split(" ").slice(-1)[0]}` : ""}
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Everything on the public website is managed from here. All administrators have identical
          permissions.
        </p>
      </div>

      {!configured && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <p className="flex items-center gap-2 text-[13.5px] font-medium text-amber-800 dark:text-amber-300">
            <Database className="size-4" /> Connect Supabase to start editing
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-[12.5px] leading-6 text-muted-foreground">
            <li>Create a Supabase project and copy the Project URL and anon key.</li>
            <li>
              Add them to <code className="rounded bg-muted px-1">.env.local</code> and restart the
              server.
            </li>
            <li>
              Run <code className="rounded bg-muted px-1">supabase/migrations/*.sql</code> then{" "}
              <code className="rounded bg-muted px-1">supabase/seed.sql</code> in the SQL editor.
            </li>
            <li>Create your auth user, add an admins row, then sign in.</li>
          </ol>
          <Link href="/admin/settings" className="mt-2 inline-flex text-[12px] font-medium text-accent hover:underline">
            See the full setup checklist →
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          href="/admin/projects"
          label="Projects"
          icon={FolderKanban}
          value={stats.projects.total}
          sub={`${stats.projects.published} published`}
        />
        <StatCard
          href="/admin/publications"
          label="Publications"
          icon={BookOpen}
          value={stats.publications.total}
          sub={`${stats.publications.published} published`}
        />
        <StatCard
          href="/admin/designs"
          label="Design works"
          icon={Palette}
          value={stats.designs.total}
          sub={`${stats.designs.published} published`}
        />
        <StatCard
          href="/admin/certificates"
          label="Certificates"
          icon={Award}
          value={stats.certificates.total}
          sub={`${stats.certificates.published} published`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[13.5px] font-semibold">
              <Activity className="size-4 text-accent" /> Recent activity
            </h3>
            <Link href="/admin/logs" className="text-[12px] text-accent hover:underline">
              All logs
            </Link>
          </div>

          {logs.length === 0 ? (
            <p className="py-6 text-center text-[12.5px] text-muted-foreground">
              No activity recorded yet. Actions such as creating, editing and publishing content are
              logged here automatically.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {logs.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px]">
                      <span className="font-medium capitalize">{log.action}</span>{" "}
                      <span className="text-muted-foreground">{log.entity?.replace(/_/g, " ")}</span>
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">{log.admin_email}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatDate(log.created_at, { month: "short" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <Link
            href="/admin/messages"
            className="surface flex items-center justify-between p-5 transition-shadow hover:shadow-lift"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Inbox className="size-4" />
              </span>
              <div>
                <p className="text-[13px] font-medium">Contact messages</p>
                <p className="text-[11.5px] text-muted-foreground">
                  {unread > 0 ? `${unread} unread` : "No unread messages"}
                </p>
              </div>
            </div>
            {unread > 0 && <Badge variant="accent">{unread}</Badge>}
          </Link>

          <div className="surface p-5">
            <h3 className="flex items-center gap-2 text-[13px] font-semibold">
              <ShieldCheck className="size-4 text-accent" /> Administrators
            </h3>
            <p className="mt-1.5 text-[12px] leading-6 text-muted-foreground">
              Add or deactivate administrators. The database blocks removing the last active
              administrator.
            </p>
            <Link
              href="/admin/admins"
              className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent hover:underline"
            >
              Manage administrators <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="surface p-5">
            <h3 className="text-[13px] font-semibold">Content summary</h3>
            <dl className="mt-3 space-y-1.5 text-[12px]">
              {[
                ["Education", stats.education],
                ["Skills", stats.skills],
                ["Experience", stats.experiences],
                ["Activities", stats.activities],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">
                    {value.published} / {value.total}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

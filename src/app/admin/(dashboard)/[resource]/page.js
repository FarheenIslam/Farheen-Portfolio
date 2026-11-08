import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { RESOURCES } from "@/lib/resources";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ResourceManager } from "@/components/admin/resource-manager";
import {
  defaultProfile,
  defaultEducation,
  defaultSkills,
  defaultProjects,
  defaultPublications,
  defaultThesis,
  defaultCertificates,
  defaultAchievements,
  defaultDesignWorks,
  defaultExperiences,
  defaultActivities,
} from "@/lib/defaults";

const MANAGED = [
  "profile",
  "education",
  "skills",
  "projects",
  "publications",
  "thesis",
  "certificates",
  "achievements",
  "designs",
  "experiences",
  "activities",
];

const DEMO_ROWS = {
  profile: [defaultProfile],
  education: defaultEducation,
  skills: defaultSkills,
  projects: defaultProjects,
  publications: defaultPublications,
  thesis: defaultThesis,
  certificates: defaultCertificates,
  achievements: defaultAchievements,
  designs: defaultDesignWorks,
  experiences: defaultExperiences,
  activities: defaultActivities,
};

export async function generateMetadata({ params }) {
  const { resource } = await params;
  const config = RESOURCES[resource];
  return {
    title: config ? `${config.label} · Admin` : "Admin",
    robots: { index: false, follow: false },
  };
}

async function fetchRows(resource) {
  const supabase = await createClient();
  if (!supabase) return [];

  const select = resource.gallery ? `*, ${resource.gallery.table}(*)` : "*";
  const { data, error } = await supabase
    .from(resource.table)
    .select(select)
    .order("sort_order", { ascending: true });

  if (error) {
    console.warn(`[admin] ${resource.table}: ${error.message}`);
    return [];
  }

  return data ?? [];
}

export default async function AdminResourcePage({ params }) {
  const { resource: resourceKey } = await params;

  if (!MANAGED.includes(resourceKey)) notFound();

  const admin = await requireAdmin();
  const resource = RESOURCES[resourceKey];

  const rows =
    admin.demo || !isSupabaseConfigured()
      ? DEMO_ROWS[resourceKey] ?? []
      : await fetchRows(resource);

  const publicPaths = {
    projects: "/projects",
    designs: "/designs",
    publications: "/research",
    thesis: "/research",
    certificates: "/certificates",
    achievements: "/certificates",
    experiences: "/experience",
    activities: "/experience",
    education: "/about",
    skills: "/about",
    profile: "/about",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{resource.label}</h2>
          <p className="mt-1 max-w-2xl text-[13px] leading-6 text-muted-foreground">
            {resource.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!resource.singleton && (
            <span className="rounded-md border border-border px-2.5 py-1 text-[11.5px] text-muted-foreground">
              {rows.length} total ·{" "}
              {rows.filter((row) => row.is_published).length} published
            </span>
          )}
          <Link
            href={publicPaths[resourceKey] ?? "/"}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[11.5px] font-medium hover:bg-muted"
          >
            View on site <ExternalLink className="size-3" />
          </Link>
        </div>
      </div>

      <ResourceManager resourceKey={resourceKey} resource={resource} rows={rows} />
    </div>
  );
}

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
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
  defaultSiteSettings,
} from "@/lib/defaults";

/**
 * Public content access layer.
 *
 * Every function returns plain objects with the same shape as the database
 * rows, so components never need to know whether the data came from Supabase
 * or from the verified defaults. RLS restricts these queries to published rows.
 */

const bySortOrder = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0);

async function publicQuery(table, { order = "sort_order", ascending = true } = {}) {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("is_published", true)
      .order(order, { ascending });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.warn(`[data] Falling back to defaults for "${table}": ${error.message}`);
    return null;
  }
}

export const getProfile = cache(async () => {
  if (!isSupabaseConfigured()) return defaultProfile;

  try {
    const supabase = await createClient();
    if (!supabase) return defaultProfile;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ?? defaultProfile;
  } catch (error) {
    console.warn(`[data] profile fallback: ${error.message}`);
    return defaultProfile;
  }
});

export const getSiteSettings = cache(async () => {
  if (!isSupabaseConfigured()) return defaultSiteSettings;

  try {
    const supabase = await createClient();
    if (!supabase) return defaultSiteSettings;

    const { data, error } = await supabase.from("site_settings").select("key, value");
    if (error) throw error;
    if (!data?.length) return defaultSiteSettings;

    const merged = { ...defaultSiteSettings };
    data.forEach((row) => {
      merged[row.key] = row.value;
    });
    return merged;
  } catch (error) {
    console.warn(`[data] settings fallback: ${error.message}`);
    return defaultSiteSettings;
  }
});

export const getEducation = cache(async () => {
  const rows = await publicQuery("education");
  return (rows ?? defaultEducation).slice().sort(bySortOrder);
});

export const getSkills = cache(async () => {
  const rows = await publicQuery("skills");
  return (rows ?? defaultSkills).slice().sort(bySortOrder);
});

export const getPublications = cache(async () => {
  const rows = await publicQuery("publications");
  return (rows ?? defaultPublications).slice().sort(bySortOrder);
});

export const getThesis = cache(async () => {
  const rows = await publicQuery("thesis");
  return (rows ?? defaultThesis).slice().sort(bySortOrder);
});

export const getCertificates = cache(async () => {
  const rows = await publicQuery("certificates");
  return (rows ?? defaultCertificates).slice().sort(bySortOrder);
});

export const getAchievements = cache(async () => {
  const rows = await publicQuery("achievements");
  return (rows ?? defaultAchievements).slice().sort(bySortOrder);
});

export const getExperiences = cache(async () => {
  const rows = await publicQuery("experiences", { order: "start_date", ascending: false });
  return (rows ?? defaultExperiences).slice().sort(bySortOrder);
});

export const getActivities = cache(async () => {
  const rows = await publicQuery("activities", { order: "event_date", ascending: false });
  return (rows ?? defaultActivities).slice().sort(bySortOrder);
});

export const getProjects = cache(async () => {
  if (!isSupabaseConfigured()) return defaultProjects;

  try {
    const supabase = await createClient();
    if (!supabase) return defaultProjects;

    const { data, error } = await supabase
      .from("projects")
      .select("*, project_images(*)")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data ?? []).map((project) => ({
      ...project,
      project_images: (project.project_images ?? []).sort(bySortOrder),
    }));
  } catch (error) {
    console.warn(`[data] projects fallback: ${error.message}`);
    return defaultProjects;
  }
});

export const getProjectBySlug = cache(async (slug) => {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug) ?? null;
});

export const getDesignWorks = cache(async () => {
  if (!isSupabaseConfigured()) return defaultDesignWorks;

  try {
    const supabase = await createClient();
    if (!supabase) return defaultDesignWorks;

    const { data, error } = await supabase
      .from("design_works")
      .select("*, design_work_images(*)")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data ?? []).map((work) => ({
      ...work,
      design_work_images: (work.design_work_images ?? []).sort(bySortOrder),
    }));
  } catch (error) {
    console.warn(`[data] design works fallback: ${error.message}`);
    return defaultDesignWorks;
  }
});

export const getDesignWorkBySlug = cache(async (slug) => {
  const works = await getDesignWorks();
  return works.find((work) => work.slug === slug) ?? null;
});

/** Everything the PDF generator and resume page need, in one call. */
export const getPortfolioBundle = cache(async () => {
  const [
    profile,
    settings,
    education,
    skills,
    projects,
    publications,
    thesis,
    certificates,
    achievements,
    designWorks,
    experiences,
    activities,
  ] = await Promise.all([
    getProfile(),
    getSiteSettings(),
    getEducation(),
    getSkills(),
    getProjects(),
    getPublications(),
    getThesis(),
    getCertificates(),
    getAchievements(),
    getDesignWorks(),
    getExperiences(),
    getActivities(),
  ]);

  return {
    profile,
    settings,
    education,
    skills,
    projects,
    publications,
    thesis,
    certificates,
    achievements,
    designWorks,
    experiences,
    activities,
  };
});

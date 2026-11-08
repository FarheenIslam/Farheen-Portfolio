import { getProjects, getDesignWorks } from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";
import { requestOrigin } from "@/lib/site-url";

export default async function sitemap() {
  const [projects, designs, origin] = await Promise.all([
    getProjects(),
    getDesignWorks(),
    requestOrigin(),
  ]);

  const staticRoutes = [
    { path: "/", priority: 1 },
    { path: "/about", priority: 0.8 },
    { path: "/projects", priority: 0.9 },
    { path: "/research", priority: 0.9 },
    { path: "/designs", priority: 0.9 },
    { path: "/certificates", priority: 0.7 },
    { path: "/experience", priority: 0.7 },
    { path: "/resume", priority: 0.6 },
    { path: "/contact", priority: 0.6 },
  ];

  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path, origin),
      lastModified: now,
      changeFrequency: "monthly",
      priority: route.priority,
    })),
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`, origin),
      lastModified: project.updated_at ? new Date(project.updated_at) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
    ...designs.map((design) => ({
      url: absoluteUrl(`/designs/${design.slug}`, origin),
      lastModified: design.updated_at ? new Date(design.updated_at) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];
}
